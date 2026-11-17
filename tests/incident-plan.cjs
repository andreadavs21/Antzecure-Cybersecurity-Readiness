const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const output=fs.mkdtempSync(path.join(os.tmpdir(),'antzecure-plan-'));
console.log('Sample PDFs: '+output);
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8000');
const cases=[
 {name:'Small Office',employeeCount:'1-10',itSupport:'No IT Support',existingPlan:'No',backups:'No',criticalSystems:'Email',backupTesting:'Not Applicable',reportingMethod:'Email',alternateContact:'No'},
 {name:'Nonprofit',employeeCount:'11-25',itSupport:'External IT Provider',existingPlan:'Partially',backups:'Yes',backupTesting:'No',criticalSystems:'Customer Records',reportingMethod:'Phone',alternateContact:'Yes',deviceIsolation:'Not Sure'},
 {name:'Small Clinic',employeeCount:'1-10',itSupport:'Internal IT Team',existingPlan:'Yes',backups:'Yes',backupTesting:'Yes',criticalSystems:'Customer Records',mfa:'Yes',sensitiveData:'Yes',reportingMethod:'In Person',alternateContact:'Yes',deviceIsolation:'Yes'}
];
for(const [i,org] of cases.entries()){
 await page.evaluate(org=>{
  const form=document.getElementById('organizationForm');
  for(const select of form.querySelectorAll('select'))select.value=[...select.options].some(o=>o.value==='No')?'No':select.options[1].value;
  document.getElementById('organizationName').value=org.name;
  document.getElementById('emergencyContact').value=org.name==='Small Office'?'Not Assigned':'Office Manager';
  for(const [key,val] of Object.entries(org))if(document.getElementById(key))document.getElementById(key).value=val;
  document.getElementById('backups').dispatchEvent(new Event('change'));
  document.getElementById('backupTesting').value=org.backupTesting;
  form.dispatchEvent(new Event('submit',{cancelable:true}));
  // Unsubmitted edits must not enter the resource.
  document.getElementById('organizationName').value='UNSUBMITTED';
 },org);
 const popupPromise=page.waitForEvent('popup');
 await page.locator('[data-resource="incidentPlan"]').click();
 const popup=await popupPromise;await popup.waitForLoadState();
 await popup.waitForFunction(()=>!document.querySelector('.report-toolbar button').disabled);
 const body=await popup.locator('body').innerText();
 assert(body.includes(org.name));assert(!body.includes('UNSUBMITTED'));
 assert(body.includes(org.criticalSystems));assert.equal(await popup.locator('[data-plan-step]').count(),3);
 assert.equal(await popup.locator('[data-plan-section], table').count(),0);
 assert.deepEqual(await popup.locator('h2').allTextContents(),['01Report and Prevent the Problem from Spreading','02Protect Your Organization','03Recover and Follow Up']);
 assert.equal(await popup.locator('.draft-contacts h3').textContent(),'Who to Contact');
 assert.deepEqual(await popup.locator('.draft-contacts a').evaluateAll(links=>links.map(a=>a.href)),['https://www.cisa.gov/report','https://www.ic3.gov/']);
 for(const guidance of ['promptly isolate the affected device from the network using approved instructions, when safe and possible','immediately contact the designated IT responder','Do not shut down, restart, wipe, or investigate','Notify the incident coordinator or manager and IT support immediately','Coverage not confirmed','Name / phone:','For suspected ransomware or active spreading, follow Step 1 isolation guidance']) assert(body.includes(guidance),guidance);
 if(org.deviceIsolation==='Yes') assert(body.includes('For suspected ransomware or spreading, promptly follow approved isolation instructions'));
 assert(!body.includes('Do not restart or disconnect affected equipment unless instructed'));
 assert(body.includes('Starter draft — review and complete contact details before use.'));
 assert(body.includes(org.name==='Small Office'?'Not confirmed — name:':'Office Manager'));
 assert(body.includes(org.alternateContact==='Yes'?'Reported available':'None reported'));
 assert(body.includes(org.reportingMethod));
 if(org.reportingMethod==='Email') assert(body.includes('If email is unavailable, use a confirmed phone or in-person method'));
 assert(body.includes(org.itSupport==='Internal IT Team'?'Internal IT team reported':org.itSupport==='External IT Provider'?'External IT provider reported':'No dedicated IT support reported'));
 assert(body.includes(org.backups==='No'?'No backups reported. Do not plan to restore':'Backups reported available'));
 assert(body.includes(org.backupTesting==='Yes'?'Confirm the latest result':org.backups==='Yes'?'do not assume restoration will work':'No dedicated IT support reported'));
 await popup.emulateMedia({media:'print'});
 await popup.pdf({path:path.join(output,`plan-${i}.pdf`),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
 const pdfPath=path.join(output,`plan-${i}.pdf`);
 const info=execFileSync('pdfinfo',[pdfPath],{encoding:'utf8'});
 assert.match(info,/Pages:\s+2\b/);assert.match(info,/Page size:\s+612 x 792 pts/);
 for(let n=1;n<=2;n++){
  const text=execFileSync('pdftotext',['-f',String(n),'-l',String(n),pdfPath,'-'],{encoding:'utf8'});
  assert(text.includes(`Page ${n} of 2`),'footer and content must remain on their intended sheet');
 }
 console.log(org.name + ': two Letter pages, correct per-page footers');
 await popup.close();
}
// Existing downloads still render through their original handlers.
for(const selector of ['#downloadReport','[data-resource="contacts"]','[data-resource="tabletop"]']){
 const opened=page.waitForEvent('popup');await page.locator(selector).click();const p=await opened;await p.waitForLoadState();assert((await p.locator('main').innerText()).length>200);await p.close();
}
await page.evaluate(()=>{
 const answers={...latestAssessmentReport.answers,organizationName:'<img src=x onerror=alert(1)>',emergencyContact:'<script>bad()</script>',backups:'Not Sure',backupTesting:'Not Sure',criticalSystems:'Not Sure',itSupport:'No IT Support'};
 latestAssessmentReport={...latestAssessmentReport,organizationName:answers.organizationName,answers,recommendations:evaluateReadiness(answers).recommendations};
});
const opened=page.waitForEvent('popup');await page.locator('[data-resource="incidentPlan"]').click();const p=await opened;await p.waitForLoadState();
assert((await p.locator('main').innerText()).includes('<img src=x onerror=alert(1)>'));assert.equal(await p.locator('main script, main img').count(),0);assert((await p.locator('main').innerText()).includes('Backup availability is unconfirmed'));
// Exercise unconfirmed and partial answers without inventing existing arrangements.
await page.evaluate(() => {
 const render = changes => {
  const report = document.createElement('main');
  const snapshot = {...latestAssessmentReport, answers: {...latestAssessmentReport.answers, ...changes}};
  const element = (tag, text, className) => {
   const node = document.createElement(tag);
   if (text !== undefined) node.textContent = text;
   if (className) node.className = className;
   return node;
  };
  renderIncidentPlan({element, report, snapshot});
  if (report.querySelectorAll('[data-plan-step]').length !== 3) throw Error('three steps');
  return report.textContent;
 };
 for (const value of ['', 'Not Sure', 'Not Applicable']) {
  const text = render({emergencyContact:'Not Assigned', alternateContact:value, reportingMethod:value, backups:value, backupTesting:value, recoveryProcedures:value, recoveryCommunication:value, sensitiveData:value});
  for (const expected of ['Not confirmed — name:', 'Availability not confirmed', 'method / details:', 'Backup availability is unconfirmed', 'Status unconfirmed']) {
   if (!text.includes(expected)) throw Error('unconfirmed answer handling: '+expected);
  }
 }
 const partial = render({deviceIsolation:'Partially', recoveryProcedures:'Partially', recoveryCommunication:'Partially', backups:'Yes', backupTesting:'Not Sure'});
 for (const expected of ['Procedures are incomplete', 'The process is incomplete', 'Testing status is unconfirmed']) {
  if (!partial.includes(expected)) throw Error('partial answer handling: '+expected);
 }
});
await page.setViewportSize({width:390,height:844});
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: A/B/C personalization, three steps, reporting and support, latest snapshot, unknowns, safe text, existing resources');
})().catch(e=>{console.error(e);process.exit(1)});

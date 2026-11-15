const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const output=fs.mkdtempSync(path.join(os.tmpdir(),'antzecure-plan-'));
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8000');
const cases=[
 {name:'Small Office',employeeCount:'1-10',itSupport:'No IT Support',existingPlan:'No',backups:'No',criticalSystems:'Email',backupTesting:'Not Applicable'},
 {name:'Nonprofit',employeeCount:'11-25',itSupport:'External IT Provider',existingPlan:'Partially',backups:'Yes',backupTesting:'No',criticalSystems:'Customer Records'},
 {name:'Small Clinic',employeeCount:'1-10',itSupport:'External IT Provider',existingPlan:'Yes',backups:'Yes',backupTesting:'Yes',criticalSystems:'Customer Records',mfa:'Yes',sensitiveData:'Yes'}
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
 assert(body.includes(org.criticalSystems));assert.equal(await popup.locator('[data-plan-section]').count(),10);
 assert.equal(await popup.locator('.plan-phase').count(),4);
 assert(body.includes(org.backups==='No'?'No backups reported. Do not plan to restore':'Backups reported available'));
 assert(body.includes(org.backupTesting==='Yes'?'latest test date':org.backups==='Yes'?'Do not assume restoration will work':'No dedicated IT support reported'));
 await popup.emulateMedia({media:'print'});
 await popup.pdf({path:path.join(output,`plan-${i}.pdf`),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
 const pdfPath=path.join(output,`plan-${i}.pdf`);
 const info=execFileSync('pdfinfo',[pdfPath],{encoding:'utf8'});
 assert.match(info,/Pages:\s+5\b/);assert.match(info,/Page size:\s+612 x 792 pts/);
 for(let n=1;n<=5;n++){
  const text=execFileSync('pdftotext',['-f',String(n),'-l',String(n),pdfPath,'-'],{encoding:'utf8'});
  assert(text.includes(`Page ${n} of 5`),'footer and content must remain on their intended sheet');
 }
 const sizes=await popup.locator('.plan-sheet').evaluateAll(els=>els.map(el=>({height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width})));
 console.log(org.name + ': five Letter pages, correct per-page footers');
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
await page.setViewportSize({width:390,height:844});
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: A/B/C personalization, 10 sections, first hour, latest snapshot, unknowns, safe text, existing resources');
})().catch(e=>{console.error(e);process.exit(1)});

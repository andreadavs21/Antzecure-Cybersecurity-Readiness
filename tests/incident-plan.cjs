const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'antzecure-plan-'));
console.log('Automated PDF artifacts: ' + output);
const cases = [
 {name:'A Small nonprofit',itSupport:'External IT Provider',reportingMethod:'Email',deviceIsolation:'No',backups:'Yes',backupTesting:'No'},
 {name:'B Small business',itSupport:'No IT Support',backups:'No',alternateContact:'No',emergencyContact:'Not Assigned'},
 {name:'C Internal IT',sensitiveData:'Yes',itSupport:'Internal IT Team',reportingMethod:'Phone',deviceIsolation:'Yes',backups:'Yes',backupTesting:'Yes',alternateContact:'Yes',recoveryProcedures:'Yes',recoveryCommunication:'Yes'},
 {name:'D Unsure organization',allUnsure:true,emergencyContact:'idk'},
 {name:'E Office Manager',itSupport:'Office Manager',criticalSystems:'Other',reportingMethod:'Other'},
 {name:'F No reporting method',itSupport:'External IT Provider',reportingMethod:'Not Established'},
 {name:'G Partial procedures',deviceIsolation:'Not Sure',recoveryProcedures:'Partially',recoveryCommunication:'Partially',backups:'Yes',backupTesting:'Not Applicable'},
 {name:'I Same Office Manager',emergencyContact:'Office Manager',itSupport:'Office Manager'},
 {name:'J Same internal team',emergencyContact:'Internal IT Team',itSupport:'Internal IT Team'},
 {name:'H Free text <img src=x onerror=alert(1)>',emergencyContact:'<script>bad()</script>',itSupport:'Internal IT Team',reportingMethod:'In Person'}
];
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
 const page = await browser.newPage();
 const errors = []; page.on('pageerror',e => errors.push(e.message));
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8000');
 for (const [i, profile] of cases.entries()) {
  await page.evaluate(profile => {
   const form = document.getElementById('organizationForm');
   for (const select of form.querySelectorAll('select')) select.value = [...select.options].some(o => o.value === 'No') ? 'No' : select.options[1].value;
   document.getElementById('organizationName').value = profile.name;
   document.getElementById('emergencyContact').value = profile.emergencyContact || 'Office contact';
   document.getElementById('criticalSystems').value = 'Customer Records';
   document.getElementById('itSupport').value = 'External IT Provider';
   document.getElementById('reportingMethod').value = 'Phone';
   for (const [key, value] of Object.entries(profile)) if (document.getElementById(key)) document.getElementById(key).value = value;
   document.getElementById('backups').dispatchEvent(new Event('change'));
   document.getElementById('backupTesting').value = profile.backupTesting || 'Not Applicable';
   form.dispatchEvent(new Event('submit', {cancelable:true}));
   // Q3 and Q14 have no Not Sure option. Exercise defensive handling without changing the questionnaire.
   if (profile.allUnsure) {
    const answers = {...latestAssessmentReport.answers};
    for (const select of form.querySelectorAll('select')) answers[select.id] = 'Not Sure';
    latestAssessmentReport = {...latestAssessmentReport, answers};
   }
   document.getElementById('organizationName').value = 'UNSUBMITTED';
  }, profile);
  const opened = page.waitForEvent('popup'); await page.locator('[data-resource="incidentPlan"]').click();
  const popup = await opened; await popup.waitForLoadState();
  await popup.waitForFunction(() => !document.querySelector('.report-toolbar button').disabled);
  popup.on('pageerror', e => errors.push(e.message));
  const text = await popup.locator('main').innerText();
  assert(text.includes(profile.name)); assert(!text.includes('UNSUBMITTED'));
  assert.deepEqual(await popup.locator('h2').allTextContents(), ['01 — Stop the Spread','02 — Report It','03 — Recover and Follow Up']);
  assert.equal(await popup.locator('main table, main script, main img, .draft-facts, .plan-footer').count(),0);
  assert(!/\b(containment|contained|escalation|compromised|mitigation|threat actor|out-of-band|isolation|qualified personnel)\b/i.test(text));
  assert(text.includes('Prepared with Antzecure')); assert(text.includes('For urgent problems, call by phone.'));
  assert(text.includes('Leave it powered on when possible.')); assert(text.includes('If there is an immediate danger to people, follow emergency safety procedures first.'));
  assert.equal(await popup.locator('.draft-leadership, main a').count(),0);
  for(const removed of ['C. Leadership decides','CISA','IC3','Policy number','Not every problem needs every report below']) assert(!text.includes(removed));
  assert(text.includes('Management may need advice from its insurer (if applicable), a legal advisor, or relevant authorities.'));
  assert.deepEqual(await popup.locator('[data-plan-step="2"] h3').allTextContents(),['A. Who to Call','B. What to Tell Them']);
  assert.deepEqual(await popup.locator('.draft-call-order > li').evaluateAll(rows=>rows.map(r=>r.dataset.contact)),['main','backup','it']);
  assert.equal(await popup.locator('[data-plan-step="1"] .plan-checklist > li').count(),4);
  assert.equal(await popup.locator('[data-plan-step="3"] .plan-checklist > li').count(),4);
  assert.deepEqual(await popup.locator('.draft-tell > li').allTextContents(),['What happened?','When did you notice it?','Which computer, account, or system is affected?','Are there any warning messages?']);
  assert.equal(await popup.locator('[data-plan-step="2"] > p').last().textContent(),'The person handling the incident and your IT support will help decide what to do next.');
  assert(text.includes('For shared systems, servers, or equipment that affects other employees'));
  assert(text.includes('before disconnecting or shutting down anything'));
  assert.equal(await popup.locator('[data-contact="main"] input').first().inputValue(),profile.emergencyContact && !['Not Assigned','idk'].includes(profile.emergencyContact) ? profile.emergencyContact : profile.emergencyContact ? '' : 'Office contact');
  const complete = await popup.locator('.draft-complete').innerText();
  if(profile.name.startsWith('A ')) {
   for(const expected of ['Contact your external IT provider','In an emergency, call instead','Your backups have not been tested.']) assert(text.includes(expected),expected);
  }
  if(profile.name.startsWith('B ')) {
   assert(!text.includes('internal IT team') && !text.includes('external IT provider'));
   assert(text.includes('Ask management to arrange a trusted technology professional'));
   assert(text.includes('Your answers say there are no backups.'));
   const recovery=await popup.locator('[data-plan-step="3"]').innerText();
   assert(!/restor\w*.*from backups/i.test(recovery));
   for(const expected of ['Assign a main contact','Choose a backup contact','Arrange trusted IT help']) assert(complete.includes(expected));
  }
  if(profile.name.startsWith('C ')) {
   for(const expected of ['Contact your internal IT team',"approved disconnect steps",'Backups have been tested before','Fill in all phone numbers above before printing.']) assert(text.includes(expected),expected);
   assert(!text.includes('usually reports problems'));
  }
  if(profile.allUnsure) {
   assert(!text.includes('Call idk') && !text.includes('your Not Sure'));
   for(const expected of ['Assign a main contact','Confirm a backup contact','Confirm IT support','Identify important systems','Confirm whether backups exist','Confirm safe steps','Confirm the usual reporting method','Confirm written recovery steps']) assert(complete.includes(expected),expected);
  }
  if(profile.name.startsWith('E ')) assert(text.includes('Contact your Office Manager') && (await popup.locator('input').count())>0);
  if(profile.name.startsWith('F ')) assert(text.includes('has not chosen a reporting method') && complete.includes('Choose a usual reporting method'));
  if(profile.name.startsWith('G ')) assert(text.includes('not finished') && text.includes('Backup testing is unknown'));
  if(profile.name.startsWith('H ')) assert.equal(await popup.locator('[data-contact="main"] input').first().inputValue(),'<script>bad()</script>');
  if(profile.name.startsWith('I ') || profile.name.startsWith('J ')) {
   assert(text.includes("Use the main contact's number above"));
   assert.equal(await popup.locator('[data-contact="it"] input').count(),0);
  }
  // All plan blanks are the original editableLine controls. Typing and beforeprint synchronization are exercised.
  assert(await popup.locator('.resource-field input').count() >= 5);
  await popup.locator('.resource-field input').first().fill('Reviewed November 17');
  assert.equal(await popup.locator('.print-field-value').first().textContent(),'Reviewed November 17');
  const fields=popup.locator('.draft-call-order input');
  for(let field=0;field<await fields.count();field++) {
   await fields.nth(field).fill('Contact '+field+' <b>as text</b>');
   assert.equal(await fields.nth(field).locator('..').locator('.print-field-value').textContent(),'Contact '+field+' <b>as text</b>');
  }
  for (const format of ['Letter','A4']) {
   const file = path.join(output, `case-${i}-${format}.pdf`);
   await popup.pdf({path:file,format,preferCSSPageSize:false,printBackground:true,displayHeaderFooter:false});
   const info = execFileSync('pdfinfo',[file],{encoding:'utf8'});
   const pages = Number(info.match(/Pages:\s+(\d+)/)[1]);
   assert(pages >= 1 && pages <= 2, profile.name + ' ' + format + ': ' + pages + ' pages');
   const pdfText = execFileSync('pdftotext',[file,'-'],{encoding:'utf8'});
   assert(pdfText.includes('Reviewed November 17'));
   for(let field=0;field<await fields.count();field++) assert(pdfText.includes('Contact '+field+' <b>as text</b>'));
   assert(!pdfText.includes('cisa.gov/report') && !pdfText.includes('ic3.gov') && !pdfText.includes('Leadership decides'));
   assert(!pdfText.includes('Page 1 of 2'));
  }
  await popup.setViewportSize({width:390,height:844});
  assert(await popup.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  console.log(profile.name + ': content, editable fields, Letter/A4 automated PDF checks passed');
  await popup.close();
 }
 for (const selector of ['#downloadReport','[data-resource="contacts"]','[data-resource="tabletop"]']) {
  const opened = page.waitForEvent('popup'); await page.locator(selector).click(); const p = await opened; await p.waitForLoadState();
  assert((await p.locator('main').innerText()).length > 200);
  if (selector.includes('contacts')) {
   assert.equal(await p.locator('input').first().inputValue(),cases.at(-1).name);
   await p.locator('input').first().fill('Contact card still editable');
   assert.equal(await p.locator('.print-field-value').first().textContent(),'Contact card still editable');
  }
  await p.close();
 }
 assert.deepEqual(errors,[]); await browser.close(); console.log('PASS: ten profiles, ordered contacts, all editable fields, original resources and contact-card helpers. Manual Chrome/Safari printing still requires user verification.');
})().catch(error => { console.error(error); process.exit(1); });

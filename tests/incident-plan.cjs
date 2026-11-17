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
  assert(text.includes('Keep it turned on.')); assert(text.includes('If there is an immediate danger to people, follow emergency safety procedures first.'));
  assert.deepEqual(await popup.locator('.draft-leadership a').evaluateAll(links => links.map(a => a.href)), ['https://www.cisa.gov/report','https://www.ic3.gov/']);
  assert(text.includes('(888) 282-0870')); assert(text.includes('Not every problem needs every report below'));
  const complete = await popup.locator('.draft-complete').innerText();
  if (i === 0) {
   for (const expected of ['Call your external IT provider','In an emergency, call instead','Disconnecting your own computer','Your backups have never been tested. They may not work.']) assert(text.includes(expected), expected);
  }
  if (i === 1) {
   assert(!text.includes('internal IT team') && !text.includes('external IT provider'));
   assert(text.includes('Your manager should arrange help from a trusted IT professional before restoring anything.'));
   assert(text.includes('Your organization has no backups. Ask your manager about other ways to recover.'));
   const recovery = await popup.locator('[data-plan-step="3"]').innerText();
   assert(!/restor\w*.*from backups/i.test(recovery));
   for (const expected of ['Assign a main contact','Choose a backup contact','Arrange trusted IT help']) assert(complete.includes(expected));
  }
  if (i === 2) {
   assert(text.includes('Leadership should get legal advice about who must be told.'));
   for (const expected of ['Call your internal IT team','Your organization has approved steps','They have been tested before','Fill in all phone numbers above before printing.']) assert(text.includes(expected));
   assert(!text.includes('usually reports problems'));
  }
  if (i === 3) {
   assert(!text.includes('Call idk') && !text.includes('your Not Sure'));
   for (const expected of ['Assign a main contact','Confirm a backup contact','Confirm IT support','Identify important systems','Confirm whether backups exist','Confirm approved disconnect steps','Confirm the usual reporting method','Confirm written recovery steps','Confirm how employees','Confirm whether personal']) assert(complete.includes(expected), expected);
  }
  if (i === 4) assert(text.includes('Call your Office Manager') && text.includes('most important system'));
  if (i === 5) assert(text.includes('has not chosen a reporting method') && complete.includes('Choose a usual reporting method'));
  if (i === 6) assert(text.includes('not finished') && text.includes('It is not known whether your backups have been tested'));
  if (i === 7) assert(text.includes('<script>bad()</script>') && text.includes('tell them in person'));
  // All plan blanks are the original editableLine controls. Typing and beforeprint synchronization are exercised.
  assert(await popup.locator('.resource-field input').count() >= 8);
  await popup.locator('.resource-field input').first().fill('Reviewed November 17');
  assert.equal(await popup.locator('.print-field-value').first().textContent(),'Reviewed November 17');
  await popup.locator('.resource-field input').last().fill('Filled <b>as text</b>');
  for (const format of ['Letter','A4']) {
   const file = path.join(output, `case-${i}-${format}.pdf`);
   await popup.pdf({path:file,format,preferCSSPageSize:false,printBackground:true,displayHeaderFooter:false});
   const info = execFileSync('pdfinfo',[file],{encoding:'utf8'});
   const pages = Number(info.match(/Pages:\s+(\d+)/)[1]);
   assert(pages >= 1 && pages <= 2, profile.name + ' ' + format + ': ' + pages + ' pages');
   const pdfText = execFileSync('pdftotext',[file,'-'],{encoding:'utf8'});
   assert(pdfText.includes('Reviewed November 17') && pdfText.includes('Filled <b>as text</b>'));
   assert(pdfText.includes('cisa.gov/report') && pdfText.includes('ic3.gov'));
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
 assert.deepEqual(errors,[]); await browser.close(); console.log('PASS: A–H, original resources and contact-card helpers. Manual Chrome/Safari printing still requires user verification.');
})().catch(error => { console.error(error); process.exit(1); });

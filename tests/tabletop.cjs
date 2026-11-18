const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'antzecure-tabletop-'));
console.log('PDF artifacts: ' + output);
(async () => {
 const browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
 const page = await browser.newPage(); const errors = []; page.on('pageerror',e => errors.push(e.message));
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8000');
 const rules = await page.evaluate(() => {
  const base = {backups:'Yes',reportingMethod:'Phone',criticalSystems:'Email',sensitiveData:'No'};
  const checks = [
   [{backups:'No',reportingMethod:'Email',criticalSystems:'Financial Systems',sensitiveData:'Yes'},'ransomware'],
   [{backups:'Not Sure'},'ransomware'],
   [{reportingMethod:'Email',criticalSystems:'Financial Systems',sensitiveData:'Yes'},'email-takeover'],
   [{criticalSystems:'Financial Systems',sensitiveData:'Yes'},'payment-fraud'],
   [{sensitiveData:'Yes'},'data-exposure'], [{},'phishing']
  ];
  return checks.map(([a,expected]) => [recommendTabletopScenario({...base,...a}).id,expected]);
 }); rules.forEach(([actual,expected]) => assert.equal(actual,expected));
 const profiles = [
  {name:'Small nonprofit',itSupport:'No IT Support',backups:'No',reportingMethod:'Phone',expected:'ransomware',emergencyContact:'Not Assigned'},
  {name:'Small business',itSupport:'External IT Provider',backups:'Yes',backupTesting:'No',reportingMethod:'Email',expected:'email-takeover',emergencyContact:'Office Manager'},
  {name:'Internal IT organization',itSupport:'Internal IT Team',backups:'Yes',backupTesting:'Yes',existingPlan:'Yes',reportingMethod:'Phone',expected:'phishing',emergencyContact:'IT Manager'}
 ];
 const ids = ['ransomware','email-takeover','payment-fraud','data-exposure','phishing'];
 for(const [p,profile] of profiles.entries()) {
  await page.evaluate(profile => {
   const form = document.getElementById('organizationForm');
   for(const select of form.querySelectorAll('select')) select.value = [...select.options].some(o => o.value === 'No') ? 'No' : select.options[1].value;
   document.getElementById('organizationName').value = profile.name;
   document.getElementById('criticalSystems').value = 'Shared Files';
   document.getElementById('emergencyContact').value = profile.emergencyContact;
   for(const [key,value] of Object.entries(profile)) if(document.getElementById(key)) document.getElementById(key).value = value;
   document.getElementById('backups').dispatchEvent(new Event('change'));
   document.getElementById('backupTesting').value = profile.backupTesting || 'Not Applicable';
   form.dispatchEvent(new Event('submit',{cancelable:true}));
  }, profile);
  const before = await page.evaluate(() => JSON.stringify({report:latestAssessmentReport,answers:[...document.querySelectorAll('#organizationForm input, #organizationForm select')].map(e=>e.value),firstSteps:document.getElementById('firstSteps').textContent}));
  const opened = page.waitForEvent('popup'); await page.locator('[data-resource="tabletop"]').click(); const popup = await opened;
  popup.on('pageerror',e => errors.push(e.message)); await popup.waitForLoadState();
  await popup.waitForFunction(() => !document.querySelector('.report-toolbar button').disabled);
  assert.equal(await popup.locator('#tabletopScenario').inputValue(),profile.expected);
  assert.equal(await popup.locator('#tabletopScenario option').count(),5);
  for(const id of ids) {
   await popup.locator('#tabletopScenario').selectOption(id);
   assert.equal(await popup.locator('.tabletop-content').getAttribute('data-scenario'),id);
   assert((await popup.locator('main').innerText()).includes(profile.name));
   const model = await page.evaluate(({id,profile})=>{
    const scenario = tabletopScenarios.find(s=>s.id===id);
    const steps = buildTabletopSteps(latestAssessmentReport.answers,scenario);
    return {title:scenario.title,opening:scenario.opening,development:scenario.development,optional:scenario.optionalDevelopment,question:scenario.decision.situation,recommended:scenario.decision.recommended,steps};
   },{id,profile});
   assert.equal(await popup.locator('.tabletop-opening').textContent(),model.opening);
   assert((await popup.locator('.exercise-complication').textContent()).includes(model.development));
   assert((await popup.locator('.tabletop-optional').textContent()).includes(model.optional));
   assert.equal(await popup.locator('.tabletop-decision').getAttribute('data-decision'),id);
   assert.equal(await popup.locator('.exercise-part').count(),4);
   const minutes = await popup.locator('.exercise-part').evaluateAll(els=>els.map(el=>Number(el.dataset.minutes)));
   assert.deepEqual(minutes,[3,5,7,5]); assert.equal(minutes.reduce((a,b)=>a+b),20);
   assert.equal(await popup.locator('.tabletop-hints').count(),4);
   for(let i=0;i<4;i++) {
    const article = popup.locator('.exercise-part').nth(i);
    assert((await article.locator('.tabletop-questions > li').count()) <= 4);
    const hints = article.locator('.tabletop-hints'); assert(!(await hints.isVisible()));
    const points = await hints.locator('li').count(); assert(points>=2 && points<=4);
    const reveal = article.locator('.tabletop-suggestions button'); assert.equal(await reveal.getAttribute('aria-expanded'),'false');
    await reveal.focus(); await reveal.press('Enter'); assert(await hints.isVisible()); assert.equal(await reveal.getAttribute('aria-expanded'),'true');
    await reveal.press('Space'); assert(!(await hints.isVisible()));
    await reveal.click(); assert(await hints.isVisible()); await reveal.click();
   }
   const choices = popup.locator('.tabletop-choices button'); assert.equal(await choices.count(),3);
   assert(!(await popup.locator('.tabletop-feedback').isVisible()));
   for(let i=0;i<3;i++) {
    await choices.nth(i).focus(); await choices.nth(i).press('Enter');
    assert.equal(await choices.nth(i).getAttribute('aria-pressed'),'true');
    assert.equal(await popup.locator('.tabletop-choices button[aria-pressed="true"]').count(),1);
    assert.equal(await popup.locator('.tabletop-feedback li').count(),3);
    assert((await popup.locator('.tabletop-feedback').innerText()).includes('✓ Recommended answer: '+String.fromCharCode(65+model.recommended)));
   }
   // Print output must not leak opened hints or selected answers beside questions.
   await popup.locator('.tabletop-suggestions button').first().click();
   await popup.emulateMedia({media:'print'});
   assert(!(await choices.first().isVisible())); assert(!(await popup.locator('#tabletopScenario').isVisible()));
   assert(!(await popup.locator('.tabletop-hints').first().isVisible())); assert(!(await popup.locator('.tabletop-feedback').isVisible()));
   assert(await popup.locator('.tabletop-answer-guide').isVisible());
   assert.equal(await popup.locator('.tabletop-paper-choices li').count(),3);
   if(p===0) {
    const file=path.join(output,id+'.pdf');
    await popup.pdf({path:file,format:'Letter',preferCSSPageSize:false,printBackground:true,displayHeaderFooter:false});
    const text=execFileSync('pdftotext',['-layout',file,'-'],{encoding:'utf8'});
    const guide=text.indexOf('Facilitator Answer Guide'); assert(guide>text.indexOf('What We Learned'));
    assert(!text.slice(0,guide).includes('Recommended answer:'));
    assert(!text.slice(0,guide).includes('What a Strong Answer Includes'));
    assert(text.slice(guide).includes('Recommended answer: B'));
    assert(text.includes(model.title) && text.includes(profile.name));
    const sheets=text.split('\f').filter(s=>s.trim());
    const guideSheet=sheets.find(s=>s.includes('Facilitator Answer Guide')); assert(guideSheet.trimStart().startsWith('Facilitator Answer Guide'));
    assert(sheets.every(s=>s.trim().length>100),'no empty printed sheets');
    console.log(id+': '+sheets.length+' PDF pages; answers follow participant worksheet');
   }
   await popup.emulateMedia({media:'screen'});
   await popup.setViewportSize({width:390,height:844}); assert(await popup.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await popup.setViewportSize({width:1280,height:900});
   const summary=await popup.locator('.exercise-context').innerText();
   assert(summary.includes('Shared Files'));
   assert(summary.includes(profile.itSupport==='No IT Support'?'No IT support is listed':profile.itSupport==='External IT Provider'?'external IT provider':'internal IT team'));
   if(p===0) assert(summary.includes('does not currently report having backups') && summary.includes('Not named'));
   if(p===1) assert(summary.includes('not been tested') && summary.includes('trusted phone number'));
   if(p===2) assert(summary.includes('Backups have been tested') && summary.includes('written response plan'));
  }
  // The toolbar still calls the resource window's native print entry point.
  await popup.evaluate(()=>{window.print=()=>{window.printWasRequested=true;};});
  await popup.locator('.report-toolbar button').click(); assert(await popup.evaluate(()=>window.printWasRequested));
  const after=await page.evaluate(()=>JSON.stringify({report:latestAssessmentReport,answers:[...document.querySelectorAll('#organizationForm input, #organizationForm select')].map(e=>e.value),firstSteps:document.getElementById('firstSteps').textContent}));
  assert.equal(after,before,'manual scenarios never mutate assessment, recommendations or First Steps');
  await popup.close();
 }
 // Unknown details and free text remain safe and do not become invented capabilities.
 await page.evaluate(()=>{
  const a={...latestAssessmentReport.answers,organizationName:'<img src=x onerror=alert(1)>',emergencyContact:'<script>notCode()</script>',backups:'Not Sure',backupTesting:'Not Sure',itSupport:'Not Sure',criticalSystems:'Not Sure',existingPlan:'Not Sure',reportingMethod:'Other'};
  latestAssessmentReport={...latestAssessmentReport,organizationName:a.organizationName,answers:a,recommendations:evaluateReadiness(a).recommendations};
 });
 const opened=page.waitForEvent('popup');await page.locator('[data-resource="tabletop"]').click();const popup=await opened;await popup.waitForLoadState();
 assert.equal(await popup.locator('main script, .tabletop-content img').count(),0);
 const text=await popup.locator('.tabletop-content').innerText();
 for(const expected of ['<script>notCode()</script>','Backup availability is unknown','IT support is not confirmed','Written response instructions are not confirmed','Not named']) assert(text.includes(expected),expected);
 assert.equal(await popup.locator('#tabletopScenario').inputValue(),'ransomware');await popup.close();
 for(const selector of ['#downloadReport','[data-resource="contacts"]','[data-resource="incidentPlan"]']) {
  const next=page.waitForEvent('popup');await page.locator(selector).click();const p=await next;await p.waitForLoadState();assert((await p.locator('main').innerText()).length>200);await p.close();
 }
 assert.deepEqual(errors,[]);await browser.close();
 try {const w=await webkit.launch({headless:true});await w.close();console.log('WebKit available; run the manual Safari checklist for native printing.');}
 catch(e) {console.log('Safari/WebKit automation unavailable: '+e.message.split('\n')[0]);}
 console.log('PASS: five scenarios × three profiles, rules, mouse/keyboard controls, print separation, safe text, immutable assessment and existing resources.');
})().catch(error=>{console.error(error);process.exit(1);});

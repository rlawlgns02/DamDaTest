'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {createServer}=require('./preview.cjs');
const fs=require('node:fs/promises');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port+'/DamDaTest/';
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
 const errors=[],unexpectedRequests=[];
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))unexpectedRequests.push(r.url());});
  await page.goto(base);const favicon=await page.locator('link[rel=icon]').getAttribute('href');assert.equal((await page.request.get(new URL(favicon,base).href)).status(),200);await page.evaluate(()=>document.fonts.ready);
  await fs.mkdir('test-results',{recursive:true});
  await page.screenshot({path:'test-results/login.png',fullPage:true});assert.equal(await page.locator('.art-grid').count(),0);assert.match(await page.locator('.art-card-name').textContent(),/^Hello/);for(const width of [320,390,768]){await page.setViewportSize({width,height:844});assert(await page.locator('.art-card').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}await page.screenshot({path:'test-results/login-tablet.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/login-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});
  await page.locator('[name=username]').fill('wrong');await page.locator('[name=password]').fill('1234');await page.locator('#login-form [type=submit]').click();assert.match(await page.locator('#login-error').textContent(),/admin/);
  await page.locator('[data-action=fill-login]').click();await page.locator('#login-form [type=submit]').click();await page.locator('#live-card').waitFor();
  assert.equal(await page.locator('select').count(),0);
  await page.locator('[data-model=name]').fill('디자인 테스트');assert.match(await page.locator('#live-card .front h2').textContent(),/디자인 테스트/);
  await page.locator('[data-preset=minimal]').click();assert.equal(await page.locator('[data-visible=company]').isChecked(),false);
  await page.locator('[data-action=preset-add]').click();await page.locator('#preset-form [name=name]').fill('테스트 프리셋');await page.locator('#preset-form .primary').click();await page.locator('[data-preset="custom-0"]').waitFor();
  await page.locator('[data-action=preset-manage]').click();await page.locator('#preset-name-0').fill('워크');await page.locator('[data-update-preset="0"]').click();await page.locator('[data-action=close-dialog]').click();await page.locator('[data-preset=business]').click();
  await page.locator('#custom-form [name=label]').fill('GitHub');await page.locator('#custom-form button').click();await page.locator('[data-custom="0"]').fill('jiwoo');assert.match(await page.locator('#live-card').textContent(),/jiwoo/);
  await page.locator('[data-tab=design]').click();await page.locator('[data-color=lime]').click();assert(await page.locator('#live-card .front.lime').count());
  const pixels=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=40;c.height=40;const x=c.getContext('2d');x.fillStyle='#c3ef62';x.fillRect(0,0,40,40);return c.toDataURL().split(',')[1];}),'base64');
  await page.locator('#photo-file').setInputFiles({name:'pixel.png',mimeType:'image/png',buffer:pixels});await page.locator('#live-card .card-photo').waitFor();
  await page.locator('[data-choice=photoShape][value=portrait]').check();await page.locator('[data-choice=photoSize][value=large]').check();assert(await page.locator('#live-card .card-photo.portrait.large').count());
  await page.locator('[data-action=remove-photo]').click();
  await page.locator('[data-tab=back]').click();await page.locator('[data-model=backTitle]').fill('반가운 연결');await page.locator('[data-choice=backPattern][value=stripes]').check();await page.locator('#editor-content [data-action=back]').click();assert.match(await page.locator('#live-card .card-rotator').getAttribute('style'),/180deg/);
  await page.locator('[data-action=rotate-reset]').click();const stage=page.locator('#live-card .card-object');await stage.scrollIntoViewIfNeeded();const box=await stage.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+100);await page.mouse.down();await page.mouse.move(box.x+box.width/2+90,box.y+140,{steps:5});await page.mouse.up();assert(!/rotateY\(0deg\)/.test(await page.locator('#live-card .card-rotator').getAttribute('style')));
  await stage.focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');assert.match(await page.locator('#live-card .card-rotator').getAttribute('style'),/15deg/);
  await page.locator('[data-action=export]').first().click();await page.locator('#qr-canvas').waitFor();assert((await page.locator('#qr-canvas').evaluate(c=>c.width))>0);
  for(const action of ['download-front','download-back','download-vcf']){const wait=page.waitForEvent('download');await page.locator('[data-action='+action+']').click();const dl=await wait;assert.equal(await dl.failure(),null);}
  await page.locator('#dialog [data-action=save-card]').click();await page.locator('[data-action=close-dialog]').click();
  await page.locator('a[href="#book"]').click();await page.locator('#search').fill('디자인 테스트');assert.equal(await page.locator('.collection-item').count(),1);await page.locator('.collection-preview').click();await page.locator('#card-group').fill('클라이언트');await page.locator('[data-update-group]').click();assert.match(await page.locator('.filter-tabs').textContent(),/클라이언트/);
  await page.locator('#search').fill('NO MATCH');assert(await page.locator('.empty').count());await page.locator('#search').fill('');
  await page.locator('a[href="#templates"]').click();await page.locator('[data-template=paper]').click();await page.locator('#live-card .front.paper').waitFor();
  await page.locator('[data-action=settings]').click();await page.locator('[data-choice=theme][value=dark]').check();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.locator('[data-choice=language][value=en]').check();assert.equal(await page.locator('html').getAttribute('lang'),'en');await page.locator('[data-choice=motion][value=reduced]').check();await page.keyboard.press('Escape');assert(!await page.locator('#dialog').evaluate(d=>d.open));
  await page.locator('[data-action=settings]').click();await page.locator('[data-choice=theme][value=light]').check();await page.locator('[data-choice=language][value=ko]').check();await page.locator('[data-action=close-dialog]').click();
  await page.locator('[data-action=rotate-reset]').click();await page.locator('[data-tab=profile]').click();
  for(const [width,height] of [[320,740],[390,844],[768,1024],[1024,768],[1366,900],[1920,1080]]){
   await page.setViewportSize({width,height});
   for(const route of ['home','book','templates']){await page.goto(base+'#'+route);await page.locator('.page-heading').waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' overflow at '+width);}
   await page.goto(base+'#home');await page.locator('#live-card').waitFor();await page.screenshot({path:'test-results/workspace-'+width+'.png',fullPage:true});
   await page.locator('[data-action=settings]').click();const d=await page.locator('#dialog').boundingBox();assert(d.x>=0&&d.x+d.width<=width+1);await page.keyboard.press('Escape');
  }
  await page.reload();await page.locator('[data-tab=back]').click();assert.equal(await page.locator('[data-model=backTitle]').inputValue(),'반가운 연결');
  await page.locator('[data-action=logout]').click();await page.locator('#login-form').waitFor();
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));await phone.goto(base);await phone.locator('[data-action=fill-login]').tap();await phone.locator('#login-form [type=submit]').tap();await phone.locator('#live-card').waitFor();
  const mobileStage=phone.locator('#live-card .card-object');await mobileStage.evaluate(el=>el.setPointerCapture=()=>{});await mobileStage.dispatchEvent('pointerdown',{pointerId:10,pointerType:'touch',clientX:100,clientY:300});await mobileStage.dispatchEvent('pointermove',{pointerId:10,pointerType:'touch',clientX:200,clientY:330});await mobileStage.dispatchEvent('pointerup',{pointerId:10,pointerType:'touch',clientX:200,clientY:330});
  assert.match(await phone.locator('#live-card .card-rotator').getAttribute('style'),/60deg/);
  assert.deepEqual(unexpectedRequests,[]);assert.deepEqual(errors,[]);
  console.log('PASS: demo login; local editing and persistence; presets; photos; mouse/touch/keyboard 3D; PNG/VCF/QR; collection; gallery; theme/language; 320–1920px layouts; no external or API requests; no console errors.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

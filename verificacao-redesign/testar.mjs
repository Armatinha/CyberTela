import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = fileURLToPath(new URL('./', import.meta.url));
const results = [], errors = [];
const check = (name, fn) => async () => { await fn(); results.push(name); console.log('PASS',name); };
const browser = await chromium.launch({ executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless:true });
try {
 const page = await browser.newPage({ viewport:{width:1440,height:1000} });
 page.on('pageerror', e => errors.push(e.message));
 await page.goto('http://localhost:4600', {waitUntil:'networkidle'});
 await page.locator('#ck-ess').click();
 await page.locator('#tpl-x').click();
 await check('Dados comerciais e administrativos preservados', async()=>{
   const extract = file => JSON.parse(readFileSync(root+'/'+file,'utf8').match(/id="store-data">([\s\S]*?)<\/script>/)[1]);
   const before=extract('index.antes-do-redesign.html'), after=extract('index.html');
   assert.deepEqual(after.products,before.products); assert.deepEqual(after.categories,before.categories);
   for(const k of Object.keys(before.settings).filter(k=>!['heroTitle','heroHighlight'].includes(k))) assert.deepEqual(after.settings[k], before.settings[k]);
   assert.equal(await page.locator('#grid .card').count(),8);
 })();
 await check('Busca, estado vazio e limpeza', async()=>{
   await page.locator('#q').fill('prompts'); assert.equal(await page.locator('#grid .card').count(),1);
   await page.locator('#q').fill('impossivelxyz'); await page.locator('#q').press('Enter');
   await page.locator('#reset-search').click(); assert.equal(await page.locator('#grid .card').count(),8);
 })();
 await check('Filtro por categoria mantém cartões visíveis', async()=>{
   await page.locator('[data-cat="Ferramentas"]').click(); assert.equal(await page.locator('#grid .card').count(),2);
   await page.locator('#grid').scrollIntoViewIfNeeded(); await page.waitForTimeout(1400);
   assert.equal(await page.locator('#grid .card').first().evaluate(e=>getComputedStyle(e).opacity),'1');
   await page.locator('[data-cat="Todos"]').click();
 })();
 await check('Ordenação por preço e nome', async()=>{
   await page.locator('#sort').selectOption('price-up'); assert.equal(await page.locator('#grid h3').first().textContent(),'E-book Guia de Vendas');
   await page.locator('#sort').selectOption('price-down'); assert.equal(await page.locator('#grid h3').first().textContent(),'Mentoria em Grupo');
   await page.locator('#sort').selectOption('name'); assert.equal(await page.locator('#grid h3').first().textContent(),'Auditoria de Perfil Google');
   await page.locator('#sort').selectOption('featured');
 })();
 await check('Planos, carrinho, quantidade e persistência', async()=>{
   await page.locator('[data-open="p1"]').click();
   await page.locator('#sh-vars input[value="1"]').check(); assert.match(await page.locator('#sh-total').textContent(),/59,90/);
   await page.locator('#sh-add').click(); await page.locator('#sheet-close').click(); await page.locator('#cart-open').click();
   assert.match(await page.locator('#cart-total').textContent(),/59,90/);
   await page.locator('[data-d="1"]').click(); assert.match(await page.locator('#cart-total').textContent(),/119,80/);
   await page.locator('#cart-close').click(); await page.reload({waitUntil:'networkidle'});
   await page.locator('#cart-open').click(); assert.match(await page.locator('#cart-total').textContent(),/119,80/);
   await page.locator('[data-rm]').click(); assert.match(await page.locator('#cart-items').textContent(),/vazio/); await page.locator('#cart-close').click();
 })();
 await check('Checkout ausente não realiza transação', async()=>{
   await page.locator('#catalogo').scrollIntoViewIfNeeded(); await page.locator('[data-open="p1"]').click();
   await page.locator('#sh-buy').click(); assert.match(await page.locator('#toast').textContent(),/não tem link de pagamento/); await page.locator('#sheet-close').click();
 })();
 await check('FAQ, políticas e painel administrativo', async()=>{
   await page.locator('#faq summary').first().click(); assert.equal(await page.locator('#faq details').first().getAttribute('open'),'');
   await page.locator('footer [data-legal="privacidade"]').click(); assert.equal(await page.locator('#modal').isVisible(),true); await page.locator('#modal-close').click();
   await page.locator('a[href="#admin"]').click(); await page.locator('#pw').waitFor(); assert.equal(await page.locator('.adm').isVisible(),true); await page.keyboard.press('Escape');
 })();
 await check('Assinatura revela chave e reverte ao início', async()=>{
   await page.evaluate(()=>{const s=document.querySelector('#como-funciona');document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*.95)});
   await page.waitForTimeout(300); assert.equal(await page.locator('#sig-key-val').textContent(),'CT-DEMO-ACESSO-LIBERADO');
   await page.evaluate(()=>window.scrollTo(0,document.querySelector('#como-funciona').offsetTop)); await page.waitForTimeout(300);
   assert.match(await page.locator('#sig-key-val').textContent(),/•/); assert.equal(await page.locator('#sig-status-txt').textContent(),'ESCOLHENDO O PRODUTO');
 })();
 await check('Sem cortes horizontais em 320, 390, 768 e 1440 px', async()=>{
   for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900}); await page.waitForTimeout(100); const sizes=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);assert.ok(sizes[0]<=sizes[1],JSON.stringify({width,sizes}));}
 })();
 await check('Movimento reduzido exibe conteúdo e acesso final', async()=>{
   const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.goto('http://localhost:4600',{waitUntil:'networkidle'});
   assert.equal(await reduced.locator('#sig-key-val').textContent(),'CT-DEMO-ACESSO-LIBERADO');
   const hidden=await reduced.locator('[data-fx]').evaluateAll(es=>es.filter(e=>getComputedStyle(e).opacity==='0').length); assert.equal(hidden,0);
   assert.equal(await reduced.locator('.fx-palco').evaluate(e=>getComputedStyle(e).position),'static'); await reduced.close();
 })();
 await page.setViewportSize({width:1440,height:1000}); await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(700); await page.screenshot({path:out+'/cybertela-desktop.png'});
 await page.evaluate(()=>document.querySelector('#catalogo').scrollIntoView());await page.waitForTimeout(700);await page.screenshot({path:out+'/cybertela-catalogo.png'});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(500);await page.screenshot({path:out+'/cybertela-mobile.png'});
 assert.deepEqual(errors,[]);
 writeFileSync(out+'/test-results.json',JSON.stringify({results,errors},null,2));
}finally{await browser.close();}

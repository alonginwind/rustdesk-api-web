const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
;(async () => {
 const browser = await chromium.launch({headless:true})
 try {
  for (const readonly of [false,true]) {
   const context = await browser.newContext({viewport:{width:1200,height:900}})
   await context.addInitScript(() => {localStorage.setItem('access_token','fixture-token');localStorage.setItem('lang','ru')})
   let policy={duration:'720h',effective_duration:'720h0m0s',revision:'fixture-v1',writable:!readonly,environment_managed:false}
   const posts=[],errors=[]
   await context.route('**/api/admin/**',async route => {
    const req=route.request(), p=new URL(req.url()).pathname.replace('/api/admin','')
    let data={}
    if(p==='/user/current') data={username:'fixture',is_admin:true,route_names:['*'],token:'fixture-token'}
    else if(p==='/config/admin') data={title:'Synthetic session settings',hello:''}
    else if(p==='/config/app') data={web_client:0,device_address_books:true}
    else if(p==='/config/server') data={}
    else if(p==='/config/session-policy') {
     if(req.method()==='POST') {posts.push(req.postDataJSON());policy={...policy,duration:posts[0].duration,effective_duration:'336h0m0s',revision:'fixture-v2'}}
     data=policy
    } else data={list:[],total:0}
    await route.fulfill({json:{code:0,message:'success',data}})
   })
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
   await page.goto((process.env.UI_URL||'http://127.0.0.1:18888')+'/#/user/sessionSettings')
   const input=page.getByLabel('Срок действия сессии (app.token-expire)',{exact:true})
   await input.waitFor();assert.equal(await input.inputValue(),'720h')
   const save=page.getByRole('button',{name:'Сохранить',exact:true})
   if(readonly){assert.equal(await input.isDisabled(),true);assert.equal(await save.isDisabled(),true);assert.equal(posts.length,0)}
   else {await input.fill('336h');await Promise.all([page.waitForResponse(r=>r.url().endsWith('/config/session-policy')&&r.request().method()==='POST'),save.click()]);assert.deepEqual(posts,[{duration:'336h',revision:'fixture-v1'}]);await page.getByText('336h0m0s',{exact:true}).waitFor()}
   assert.deepEqual(errors,[]);await context.close()
   console.log(JSON.stringify({session_settings:'pass',read_only:readonly,writes:posts.length,page_errors:0}))
  }
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})

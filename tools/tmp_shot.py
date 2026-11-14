import os
from playwright.sync_api import sync_playwright
os.makedirs('shots',exist_ok=True)
U='https://misfits980.github.io/WOWF-helper-/?v=2a8a888'
def go(pg,a,k=''):
    pg.evaluate("([a,k])=>{const b=document.createElement('button');b.dataset.a=a;b.dataset.k=k;document.body.appendChild(b);b.click();b.remove()}",[a,k]);pg.wait_for_timeout(700)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for W,H in [(390,844),(1280,800)]:
        pg=b.new_page(viewport={'width':W,'height':H},is_mobile=W<900,has_touch=W<900,device_scale_factor=2 if W<900 else 1)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(U,wait_until='networkidle');pg.wait_for_timeout(1500)
        print('build',pg.evaluate("()=>typeof BUILD!=='undefined'?BUILD:''"))
        pg.evaluate("()=>{DB.list=[{id:'p',name:'용현',race:'dwarf',cls:'priest',spec:'holy',lv:27,eq:{},fq:{},dq:{},spec2:'shadow-magic'}];DB.cur='p';ui.onb=null;render();qdbLoad()}");pg.wait_for_timeout(4000)
        go(pg,'tab','gear');pg.wait_for_timeout(2500);pg.screenshot(path=f'shots/{W}_gear.png')
        go(pg,'gsel','wrist');pg.wait_for_timeout(2500);pg.screenshot(path=f'shots/{W}_gear_cmp.png')
        go(pg,'bg');go(pg,'tab','quest');go(pg,'qmode','rec');pg.wait_for_timeout(2500);pg.screenshot(path=f'shots/{W}_quest_rec.png',full_page=W<900)
        go(pg,'qmode','atlas');pg.wait_for_timeout(5000);pg.screenshot(path=f'shots/{W}_atlas.png')
        k=pg.evaluate("()=>{const q=[...QDB.values()].find(q=>q.lv>=24&&q.lv<=28&&q.g&&q.r&&q.g[0]===q.r[0]&&/그늘숲/.test(q.z||''));return q&&q.id}")
        if k: go(pg,'mmgo',str(k));pg.wait_for_timeout(5000);pg.screenshot(path=f'shots/{W}_focus.png')
        pg.evaluate("()=>{ui.amq=null;ui.amfull=false;document.body.classList.remove('amfull');render()}")
        go(pg,'tab','class');pg.wait_for_timeout(2500);pg.screenshot(path=f'shots/{W}_class.png')
        go(pg,'tab','home');pg.wait_for_timeout(2500);pg.screenshot(path=f'shots/{W}_home.png',full_page=W<900)
        pg.evaluate("()=>{DB.list=[{id:'w',name:'W',race:'human',cls:'warrior',spec:'protection',lv:47,eq:{},fq:{},dq:{}}];DB.cur='w';render()}")
        go(pg,'tab','gear');pg.wait_for_timeout(2500);pg.screenshot(path=f'shots/{W}_tank.png')
        print(W,'errs',errs[:3])
        pg.close()

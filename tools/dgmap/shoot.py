"""render.html을 헤드리스 크롬으로 열어 그림 저장. 사용: python3 shoot.py <묶음 폴더> <설정 json 문자열> <저장.png>"""
import sys, json, base64, http.server, threading, os, socketserver, functools
from playwright.sync_api import sync_playwright

root = '/home/claude/dgmap'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
def serve():
    h = functools.partial(Q, directory=root)
    s = socketserver.TCPServer(('127.0.0.1', 0), h); threading.Thread(target=s.serve_forever, daemon=True).start()
    return s

def shoot(cfg, out):
    s = serve(); port = s.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost'])
        pg = b.new_page(viewport={'width': 800, 'height': 600})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.goto('http://localhost:%d/render.html' % port)
        url = pg.evaluate('(c)=>run(c)', cfg)
        b.close()
    s.shutdown()
    errs = [e for e in errs if 'favicon' not in e and '404' not in e]
    if errs: print('오류', errs[:3])
    if isinstance(url, dict):
        open(out, 'wb').write(base64.b64decode(url['c'].split(',', 1)[1]))
        open(out[:-4] + '_h.png', 'wb').write(base64.b64decode(url['h'].split(',', 1)[1]))
        if url.get('n'): open(out[:-4] + '_n.png', 'wb').write(base64.b64decode(url['n'].split(',', 1)[1]))
    else:
        open(out, 'wb').write(base64.b64decode(url.split(',', 1)[1]))

if __name__ == '__main__':
    shoot(json.loads(sys.argv[1]), sys.argv[2])

import json,sys
from PIL import Image,ImageDraw,ImageFont
slug=sys.argv[1];fi=int(sys.argv[2]) if len(sys.argv)>2 else 0
R=json.load(open('final/%s.json'%slug));f=R['floors'][fi]
im=Image.open('final/'+f['img'].split('/')[-1]).convert('RGBA');bg=Image.new('RGBA',im.size,(30,30,34,255));bg.alpha_composite(im);dr=ImageDraw.Draw(bg);W,H=im.size
try: font=ImageFont.truetype('/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf',22)
except Exception: font=ImageFont.load_default()
for p in f['mob']['p']:
    x=p[0]/100*W;y=p[1]/100*H;dr.ellipse([x-4,y-4,x+4,y+4],fill=(255,70,70,255))
for p in f['pins']:
    x=p['x']/100*W;y=p['y']/100*H;col=(80,200,255,255) if p['w']==1 else (255,210,60,255)
    dr.ellipse([x-13,y-13,x+13,y+13],fill=col);dr.text((x-8,y-12),p['t'][:3],fill=(0,0,0,255),font=font)
bg.save('/tmp/ov_%s_%d.png'%(slug,fi))

import sys,struct,collections
def entries(path):
    b=open(path,'rb').read()
    o=44
    while o+32<=len(b) and b[o:o+4]==b'XFTH':
        reg,push,uid,th,rid,sz=struct.unpack_from('<iiIIII',b,o+4)
        st=b[o+28]
        yield dict(push=push,th=th,rid=rid,st=st,data=b[o+32:o+32+sz])
        o+=32+sz

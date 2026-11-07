import json,glob,statistics,sys,os
d0=sys.argv[1]
for f in sorted(glob.glob(d0+'/*.json')):
    if 'cuadros' in f: continue
    d=json.load(open(f)); df=[x for _,x in d['diffs']]; ts=[t for t,_ in d['diffs']]
    cuts=[]
    for i,x in enumerate(df):
        vec=df[max(0,i-3):i]+df[i+1:i+4]
        if x>=30 and x>=2.5*statistics.median(vec): cuts.append(ts[i])
    span=ts[-1]; base=statistics.median(df)
    print(f"{os.path.basename(f)[:-5]:16} dur {d['dur']:.0f}s | cortes(pico) {len(cuts):3d} = {len(cuts)/span*60:4.1f}/min, 1 cada {span/max(1,len(cuts)):4.1f}s | movimiento mediano {base} | cortes 0-10s {[c for c in cuts if c<=10]}")

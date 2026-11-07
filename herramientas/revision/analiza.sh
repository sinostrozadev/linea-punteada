#!/bin/bash
# analiza.sh ID etiqueta -> S/an/<etiqueta>.json (diffs) + jpgs de 0,0.7,1.5,3 y cada 10 s
S=${REVISION_DIR:-/tmp/revision-lp}; P=http://127.0.0.1:8777; id=$1; et=$2; mkdir -p $S/an
curl -s --get --data-urlencode "url=https://www.youtube.com/watch?v=$id" $P/ir >/dev/null; sleep 8
curl -s --max-time 200 --get --data-urlencode "js=$(sed 's/60)/180)/' $(dirname "$0")/cortes.js)" $P/eval > $S/an/$et.json
curl -s --max-time 120 --get --data-urlencode "js=$(sed 's/TIEMPOS/[0,0.7,1.5,3,10,30,60,90,120]/' $(dirname "$0")/cuadros.js)" $P/eval > $S/an/$et-cuadros.json
python3 - "$S/an/$et" <<'PY'
import json,sys,base64
b=sys.argv[1]; d=json.load(open(b+'-cuadros.json'))
for t,u in d.items():
    open(f"{b}-{float(t):05.1f}.jpg",'wb').write(base64.b64decode(u.split(',',1)[1]))
PY
python3 - "$S/an/$et.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1])); df=d['diffs']; dur=d['dur']; span=df[-1][0]
fuertes=[t for t,x in df if x>=40]; ev=[t for t,x in df if x>=20]
print(sys.argv[1].split('/')[-1], 'dur',round(dur,1),'medido',span,'s | cambios>=40:',len(fuertes),'(',round(len(fuertes)/span*10,2),'/10s) | eventos>=20:',len(ev),'(',round(len(ev)/span*10,2),'/10s)')
PY

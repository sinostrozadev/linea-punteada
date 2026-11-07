(async()=>{const v=document.querySelector("video");if(!v)return "sin video";v.muted=true;v.pause();
const c=document.createElement("canvas");c.width=48;c.height=86;const g=c.getContext("2d",{willReadFrequently:true});
const seek=t=>new Promise(r=>{const h=()=>{v.removeEventListener("seeked",h);setTimeout(r,60)};v.addEventListener("seeked",h);v.currentTime=t;setTimeout(r,2500)});
const STEP=0.5,D=Math.min(v.duration,60);let prev=null;const diffs=[];
for(let t=0;t<D;t+=STEP){await seek(t);let px;try{g.drawImage(v,0,0,48,86);px=g.getImageData(0,0,48,86).data}catch(e){return "error "+e.message}
if(prev){let s=0;for(let i=0;i<px.length;i+=4){s+=Math.abs(px[i]-prev[i])+Math.abs(px[i+1]-prev[i+1])+Math.abs(px[i+2]-prev[i+2])}diffs.push([+(t.toFixed(1)),Math.round(s/(48*86*3))])}prev=px}
return {dur:v.duration,diffs}})()

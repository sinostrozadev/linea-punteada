(async()=>{const v=document.querySelector("video");v.muted=true;v.pause();
const c=document.createElement("canvas");c.width=270;c.height=480;const g=c.getContext("2d");
const seek=t=>new Promise(r=>{const h=()=>{v.removeEventListener("seeked",h);setTimeout(r,120)};v.addEventListener("seeked",h);v.currentTime=t;setTimeout(r,3000)});
const out={};for(const t of TIEMPOS){await seek(t);g.fillStyle="#000";g.fillRect(0,0,270,480);const ar=v.videoWidth/v.videoHeight;let w=270,h=270/ar;if(h>480){h=480;w=480*ar}g.drawImage(v,(270-w)/2,(480-h)/2,w,h);out[t]=c.toDataURL("image/jpeg",0.8)}return out})()

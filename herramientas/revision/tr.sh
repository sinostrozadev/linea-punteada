#!/bin/bash
# uso: tr.sh VIDEOID -> fecha, duración, vistas, likes, transcripción
P=http://127.0.0.1:8777; id=$1
curl -s --get --data-urlencode "url=https://www.youtube.com/watch?v=$id" $P/ir >/dev/null; sleep 9
curl -s --get --data-urlencode 'js=(()=>{const v=document.querySelector("video");if(v){v.pause();v.muted=true};const e=document.querySelector("#expand");e&&e.click();return 1})()' $P/eval >/dev/null; sleep 2
curl -s --get --data-urlencode 'js=(()=>{const b=[...document.querySelectorAll("button")].find(b=>/transcript|transcripción/i.test(b.innerText));b&&b.click();return !!b})()' $P/eval; echo; sleep 5
curl -s --get --data-urlencode 'js=(()=>{const v=document.querySelector("video");const info=document.querySelector("#info-container, ytd-watch-info-text")?.innerText||"";const likes=document.querySelector("like-button-view-model button, #segmented-like-button button")?.getAttribute("aria-label")||"";const segs=[...document.querySelectorAll("ytd-transcript-segment-renderer, transcript-segment-view-model")].map(s=>s.innerText.replace(/\n+/g," ")) ;return {dur:v&&v.duration,info,likes,n:segs.length,segs}})()' $P/eval

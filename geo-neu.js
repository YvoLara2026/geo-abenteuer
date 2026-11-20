/* geo-neu.js – verbesserte Quiz-Logik für geo.html (läuft NACH dem alten Skript) */
(function(){
'use strict';
const KEY='geoAbenteuerV3',el=id=>document.getElementById(id);

/* Aufgaben mit MEHREREN richtigen Antworten (werden an die Themen angehängt) */
const extra={
0:[{q:"Welche Aussagen stimmen?",opts:["Eine Rotation dauert ungefähr 24 Stunden.","Ein Umlauf um die Sonne dauert ungefähr ein Jahr.","Die Erde braucht für eine Rotation ein Jahr.","Die Erde dreht sich um den Mond."],ok:["Eine Rotation dauert ungefähr 24 Stunden.","Ein Umlauf um die Sonne dauert ungefähr ein Jahr."],expl:"Rotation = ein Tag, Umlauf = ein Jahr.",hint:"Tag = Drehung, Jahr = Umlauf."}],
1:[{q:"Was gilt für Tag und Nacht?",opts:["Sie entstehen durch die Drehung der Erde.","Immer nur eine Erdhälfte wird von der Sonne beleuchtet.","Die Sonne wandert wirklich um die Erde.","Nachts schaltet sich die Sonne aus."],ok:["Sie entstehen durch die Drehung der Erde.","Immer nur eine Erdhälfte wird von der Sonne beleuchtet."],expl:"Die Erde dreht sich, und die Sonne beleuchtet stets nur eine Hälfte.",hint:"Denk an eine Kugel mit einer Lampe."}],
2:[{q:"Warum ist es im Sommer wärmer?",opts:["Die Sonne steht höher am Himmel.","Die Tage sind länger.","Die Erde ist dann immer ganz nah an der Sonne.","Die Erde dreht sich schneller."],ok:["Die Sonne steht höher am Himmel.","Die Tage sind länger."],expl:"Hoher Sonnenstand und lange Tage erwärmen den Boden stärker.",hint:"Es hat nichts mit der Entfernung zu tun."}],
3:[{q:"Welche Punkte liegen an den Enden der Erdachse?",opts:["Nordpol","Südpol","Äquator","Wendekreis"],ok:["Nordpol","Südpol"],expl:"Die Erdachse verbindet Nordpol und Südpol.",hint:"Der Äquator liegt in der Mitte."}],
4:[{q:"Welche beiden sind Ozeane?",opts:["Atlantischer Ozean","Pazifischer Ozean","Europa","Antarktika"],ok:["Atlantischer Ozean","Pazifischer Ozean"],expl:"Europa und Antarktika sind Kontinente.",hint:"Ozeane sind Meere."}],
5:[{q:"Welche Bundesländer sind Stadtstaaten?",opts:["Berlin","Hamburg","Bremen","Dresden","München"],ok:["Berlin","Hamburg","Bremen"],expl:"Berlin, Hamburg und Bremen sind Stadt und Bundesland zugleich.",hint:"Dresden und München sind nur Städte."}],
6:[{q:"Welche Staaten grenzen an Deutschland?",opts:["Polen","Dänemark","Österreich","Italien","Spanien"],ok:["Polen","Dänemark","Österreich"],expl:"Italien und Spanien haben keine Grenze zu Deutschland.",hint:"Schau auf die Karte rund um Deutschland."}],
7:[{q:"Welche sind Zwischenrichtungen?",opts:["Nordosten","Südwesten","Norden","Westen"],ok:["Nordosten","Südwesten"],expl:"Zwischenrichtungen liegen zwischen zwei Hauptrichtungen.",hint:"Hauptrichtungen: N, O, S, W."}],
8:[{q:"Welche Bundesländer grenzen an Polen?",opts:["Sachsen","Brandenburg","Mecklenburg-Vorpommern","Hessen"],ok:["Sachsen","Brandenburg","Mecklenburg-Vorpommern"],expl:"Polen liegt im Osten – Hessen liegt in der Mitte.",hint:"Suche die Ostgrenze."}],
9:[{q:"Welche Nachbarstaaten liegen im Westen?",opts:["Niederlande","Belgien","Polen","Tschechien"],ok:["Niederlande","Belgien"],expl:"Polen und Tschechien liegen im Osten.",hint:"Westen ist links."}]
};
Object.keys(extra).forEach(k=>topics[k].items.push(...extra[k]));

const vmap=[0,1,2,3,4,5,6,7,5,6],vf=window.visualFor;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const norm=it=>Array.isArray(it)?{q:it[0],opts:[it[1],it[2],it[3]],ok:Array.isArray(it[4])?it[4]:[it[4]],expl:it[5],hint:it[6]}:it;
const fresh=r=>({round:r||1,active:0,current:0,order:topics.map(t=>shuffle(t.items.map((_,i)=>i))),progress:topics.map(()=>({score:0,results:{}}))});
const done=i=>Object.keys(state.progress[i].results).length;
const firstOpen=i=>{const n=topics[i].items.length;for(let p=0;p<n;p++)if(!state.progress[i].results[p])return p;return n-1};
const curQ=()=>norm(topics[state.active].items[state.order[state.active][state.current]]);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}};
const say=(k,h)=>{const f=el('feedback');f.className='feedback show '+k;f.innerHTML=h;f.scrollIntoView({block:'nearest',behavior:'smooth'})};
let ui={};

function renderTopics(){
 const box=el('topics');box.innerHTML='';
 topics.forEach((t,i)=>{const d=done(i),n=t.items.length,b=document.createElement('button');
  b.className='topic'+(i===state.active?' active':'')+(d>=n?' done':'');
  b.innerHTML='<strong>'+t.icon+' '+(i+1)+'. '+t.title+(d>=n?' ✅':'')+'</strong><small>'+t.desc+'</small><small>'+d+'/'+n+' Aufgaben · '+state.progress[i].score+' Punkte</small>';
  b.onclick=()=>{state.active=i;state.current=firstOpen(i);render()};box.appendChild(b)});
}

function renderQuestion(){
 const i=state.active,t=topics[i],q=curQ(),p=state.progress[i],multi=q.ok.length>1;
 ui={q,multi,sel:new Set(),locked:new Set(),wrong:new Set(),mistakes:0,solved:false,opts:shuffle(q.opts)};
 el('topicTag').textContent=t.icon+' Thema '+(i+1)+': '+t.title;
 el('countTag').textContent='Aufgabe '+(state.current+1)+' von '+t.items.length;
 el('scoreTag').textContent='Punkte: '+p.score;
 el('topicBar').style.width=(done(i)/t.items.length*100)+'%';
 el('visual').innerHTML=vf(vmap[i]!==undefined?vmap[i]:i);
 el('question').textContent=q.q;
 el('feedback').className='feedback';el('feedback').textContent='';el('hint').textContent='';
 el('checkBtn').disabled=false;el('nextBtn').disabled=true;el('showBtn').style.display='none';
 const area=el('answerArea');area.innerHTML='';
 const ins=document.createElement('div');ins.className='instr'+(multi?' multi':'');
 ins.textContent=multi?'Mehrere Antworten möglich – hier sind '+q.ok.length+' richtig. Wähle alle richtigen aus.':'Wähle eine Antwort.';
 const grid=document.createElement('div');grid.id='answerGrid';grid.className='answers'+(multi?' multi':'');
 ui.opts.forEach((a,j)=>{const b=document.createElement('button');b.type='button';b.className='answer';b.dataset.v=a;
  b.innerHTML='<span class="mark"></span><span class="txt"></span><span class="badge"></span>';
  b.querySelector('.txt').textContent=String.fromCharCode(65+j)+') '+a;
  b.onclick=()=>pick(a);grid.appendChild(b)});
 area.appendChild(ins);area.appendChild(grid);
}

function paint(){
 document.querySelectorAll('#answerGrid .answer').forEach(b=>{const v=b.dataset.v;
  b.classList.remove('chosen','correct','wrong');let badge='';
  if(ui.locked.has(v)){b.classList.add('correct');badge='✅ Richtig'}
  else if(ui.wrong.has(v)){b.classList.add('wrong');badge='❌ Falsch'}
  else if(ui.sel.has(v))b.classList.add('chosen');
  b.querySelector('.badge').textContent=badge;
  b.disabled=ui.solved||ui.locked.has(v)||ui.wrong.has(v);
  b.setAttribute('aria-pressed',ui.sel.has(v)?'true':'false')});
}

function pick(a){
 if(ui.solved||ui.locked.has(a)||ui.wrong.has(a))return;
 if(ui.multi){ui.sel.has(a)?ui.sel.delete(a):ui.sel.add(a)}else{ui.sel.clear();ui.sel.add(a)}
 paint();
}

function solve(how,head){
 const p=state.progress[state.active];ui.solved=true;
 if(!p.results[state.current]){p.results[state.current]=how;if(how==='first')p.score++}
 paint();el('checkBtn').disabled=true;el('nextBtn').disabled=false;el('showBtn').style.display='none';
 say(how==='shown'?'bad':'good','<strong class="head">'+head+'</strong>'+ui.q.expl+(how==='first'?' <b>+1 Punkt</b>':''));
 refresh();
}

function check(){
 if(ui.solved)return;const q=ui.q;
 const pend=[...ui.sel].filter(v=>!ui.locked.has(v));
 if(!pend.length){say('bad','👆 Wähle zuerst '+(ui.multi?'mindestens eine Antwort':'eine Antwort')+' aus.');return}
 let bad=0;
 pend.forEach(v=>{if(q.ok.includes(v))ui.locked.add(v);else{ui.wrong.add(v);ui.sel.delete(v);bad++}});
 if(bad)ui.mistakes++;
 if(q.ok.every(v=>ui.locked.has(v))){
  solve(ui.mistakes?'retry':'first',ui.mistakes?'✅ Jetzt stimmt es!':'🎉 Richtig!');return}
 paint();
 const found=ui.locked.size,miss=q.ok.length-found;let txt='';
 if(ui.multi)txt=(bad?bad+(bad===1?' Antwort ist falsch (rot). ':' Antworten sind falsch (rot). '):'')+(found?found+' richtig gefunden (grün). ':'')+'Es '+(miss===1?'fehlt':'fehlen')+' noch '+miss+'. ';
 else txt='Diese Antwort ist falsch (rot). Probiere eine andere. ';
 say('bad','<strong class="head">❌ Noch nicht richtig</strong>'+txt+'💡 '+q.hint);
 if(ui.mistakes>=2)el('showBtn').style.display='';
}

function refresh(){renderTopics();renderSummary();const i=state.active;
 el('scoreTag').textContent='Punkte: '+state.progress[i].score;
 el('topicBar').style.width=(done(i)/topics[i].items.length*100)+'%';save()}

function renderSummary(){
 const total=topics.reduce((s,t)=>s+t.items.length,0),d=topics.reduce((s,_,i)=>s+done(i),0),sc=state.progress.reduce((s,p)=>s+p.score,0);
 el('overallTag').textContent=d+' von '+total+' Aufgaben';el('overallBar').style.width=(d/total*100)+'%';
 el('stats').innerHTML='<div class="stat"><b>'+sc+'</b>Punkte (1. Versuch richtig)</div><div class="stat"><b>'+d+'/'+total+'</b>Aufgaben geschafft</div><div class="stat"><b>'+Math.round(d/total*100)+'%</b>Gesamtfortschritt</div><div class="stat"><b>'+state.round+'</b>Aufgabenrunde</div>';
 el('summaryDetails').innerHTML=topics.map((t,i)=>'<div style="margin:8px 0;padding:10px;border-radius:12px;background:#f5faff"><strong>'+t.icon+' '+t.title+'</strong> — '+done(i)+'/'+t.items.length+' abgeschlossen · '+state.progress[i].score+' Punkte<div class="progressbar"><span style="width:'+(done(i)/t.items.length*100)+'%"></span></div></div>').join('');
 const all=topics.every((t,i)=>done(i)>=t.items.length);
 el('newRoundBtn').style.display=all?'inline-block':'none';
 el('roundMessage').textContent=all?'Fantastisch! Du hast alle Themen abgeschlossen. Starte jetzt eine neue Runde.':'Du kannst jederzeit ein anderes Thema wählen. Der Fortschritt wird für jedes Thema gespeichert.';
}

function render(){renderTopics();renderQuestion();renderSummary();save()}

/* Knopf „Lösung zeigen“ + Button-Aktionen */
const sb=document.createElement('button');sb.id='showBtn';sb.type='button';sb.className='secondary';sb.textContent='👀 Lösung zeigen';sb.style.display='none';
el('checkBtn').parentNode.insertBefore(sb,el('checkBtn'));
sb.onclick=()=>{ui.q.ok.forEach(v=>{ui.locked.add(v);ui.sel.delete(v)});solve('shown','💡 So ist es richtig')};
el('checkBtn').onclick=check;
el('hintBtn').onclick=()=>{el('hint').textContent='💡 '+ui.q.hint};
el('nextBtn').onclick=()=>{
 if(!ui.solved)return;const i=state.active,n=topics[i].items.length;
 if(state.current<n-1){state.current++;render();return}
 if(done(i)>=n){say('good','<strong class="head">🏆 Thema abgeschlossen!</strong>Du hast '+state.progress[i].score+' von '+n+' Aufgaben gleich beim ersten Versuch richtig gelöst. Wähle oben ein anderes Thema.');el('nextBtn').disabled=true;refresh();return}
 state.current=firstOpen(i);render();
};
el('newRoundBtn').onclick=()=>{state=fresh(state.round+1);render()};
el('resetBtn').onclick=()=>{if(confirm('Möchtest du wirklich alle gespeicherten Ergebnisse löschen?')){try{localStorage.removeItem(KEY)}catch(e){}state=fresh();render()}};

const note=el('overallTag').parentElement.querySelector('.smallnote');
if(note)note.textContent='Wähle frei aus, womit du üben möchtest. Für jede Aufgabe, die du gleich beim ersten Versuch richtig löst, gibt es einen Punkt.';

state=fresh();
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.progress&&s.order&&s.progress.length===topics.length&&s.order.every((o,i)=>o.length===topics[i].items.length))state=s}catch(e){}
render();
})();

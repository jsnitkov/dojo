"use strict";
/* ---------- persistence ---------- */
const LS = "dojo.state.v1";
let store = { rotationIndex:0, program:null, impulse:null, baseCounts:null, sound:1, leadIn:5, history:[] };
let db = null;

function localLoad(){ try{ const r=localStorage.getItem(LS); if(r) Object.assign(store, JSON.parse(r)); }catch(e){} }
function save(){
  try{ localStorage.setItem(LS, JSON.stringify(store)); }catch(e){}
  if(db){ db.doc("ems/state").set(JSON.parse(JSON.stringify(store))).catch(()=>{}); }
}
function connectDb(){
  if(!(window.claude && claude.use)) return;
  claude.use("db").then(d=>{
    if(!d) return; db=d;
    return d.doc("ems/state").get().then(s=>{
      if(s && s.exists && s.data){ Object.assign(store, s.data); normalize(); renderHome(); }
      else save();
    });
  }).catch(()=>{});
}

/* ---------- program ---------- */
function normalize(){
  if(!store.program || !Array.isArray(store.program.days) || !store.program.days.length)
    store.program = JSON.parse(JSON.stringify(BUILTIN));
  const pi = store.program.impulse || {on:6,off:4};
  if(!store.impulse) store.impulse = {on:+pi.on||6, off:+pi.off||4};
  if(store.baseCounts==null){
    const d0=store.program.days[0];
    store.baseCounts = (d0 && d0.baseCounts!=null) ? +d0.baseCounts : 2;
  }
  if(store.rotationIndex>=store.program.days.length) store.rotationIndex=0;
  if(store.sound==null) store.sound=1;
  if(!Array.isArray(store.history)) store.history=[];
  if(store.leadIn==null) store.leadIn=5;
}
function dayTiming(day){
  const g=store.impulse, i=day.impulse||{};
  return { on:(+i.on||g.on), off:(+i.off||g.off),
           base:(day.baseCounts!=null?+day.baseCounts:store.baseCounts) };
}
function dayCounts(day){
  const t=dayTiming(day);
  let counts=0; day.exercises.forEach(e=>{ counts += (+e.counts||0) + t.base; });
  return { counts, secs: counts*(t.on+t.off), t };
}
function mmss(s){ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); }
function framesFor(ex){
  const v=ex.image;
  if(Array.isArray(v) && v.length) return v.filter(x=>typeof x==="string");
  if(typeof v==="string" && v.startsWith("data:")) return [v];
  if(v && IMAGES[v]) return IMAGES[v];
  const norm=t=>String(t||"").toLowerCase().replace(/[^a-z]/g,"");
  const key=Object.keys(IMAGES).find(k=>norm(k)===norm(ex.name));
  return key?IMAGES[key]:null;
}

/* ---------- screens ---------- */
const $=id=>document.getElementById(id);
function show(id){ document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("on",s.id===id)); }

let selectedDay = 0;
function renderHome(){
  normalize();
  selectedDay = Math.min(selectedDay, store.program.days.length-1);
  $("progName").textContent = store.program.name || "Program";
  $("impulseLine").textContent = store.impulse.on+"s on / "+store.impulse.off+"s off";
  $("fOn").value=store.impulse.on; $("fOff").value=store.impulse.off;
  $("fBase").value=store.baseCounts; $("fLead").value=store.leadIn;
  $("fSound").value=String(store.sound?1:0);

  const list=$("dayList"); list.innerHTML="";
  store.program.days.forEach((d,i)=>{
    const info=dayCounts(d);
    const b=document.createElement("button");
    b.className="day"; b.type="button";
    b.setAttribute("aria-pressed", String(i===selectedDay));
    b.innerHTML = '<h3></h3><div class="meta"></div>'+
      (i===store.rotationIndex?'<span class="tag">Next in rotation</span>':'<span class="tag ghost">Day '+(i+1)+'</span>');
    b.querySelector("h3").textContent = d.name || ("Day "+(i+1));
    b.querySelector(".meta").textContent =
      d.exercises.length+(d.exercises.length===1?" exercise · ":" exercises · ")+info.counts+" counts · "+mmss(info.secs);
    b.onclick=()=>{ selectedDay=i; renderHome(); };
    list.appendChild(b);
  });
  const lc=$("logCard"), ll=$("logList");
  if(store.history.length){
    lc.style.display=""; ll.innerHTML="";
    store.history.slice(0,5).forEach(h=>{
      const d=document.createElement("div"); d.className="log";
      const when=new Date(h.ts);
      d.innerHTML='<b></b><span></span>';
      d.querySelector("b").textContent=h.day;
      d.querySelector("span").textContent=
        when.toLocaleDateString(undefined,{month:"short",day:"numeric"})+" · "+mmss(h.secs)+" · "+h.reps+" reps";
      ll.appendChild(d);
    });
  } else lc.style.display="none";
  renderDataNote();

  const sel=store.program.days[selectedDay];
  $("startBtn").textContent = "Start " + (sel.name||("Day "+(selectedDay+1)));
  const info=dayCounts(sel), t=info.t;
  $("timingNote").textContent =
    "One count = "+(t.on+t.off)+"s ("+t.on+" contracting, "+t.off+" resting). "+
    (sel.name||"This day")+" runs "+info.counts+" counts, "+mmss(info.secs)+
    ". Changing these re-times every day; the built-in days were built to land on 20:00 at 6/4.";
}

/* ---------- audio ---------- */
let AC=null;
function beep(freq,dur,vol){
  if(!store.sound) return;
  try{
    if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended") AC.resume();
    const o=AC.createOscillator(), g=AC.createGain(), t=AC.currentTime;
    o.type="sine"; o.frequency.value=freq;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol||.22,t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+dur+.04);
  }catch(e){}
}
const cueOn=()=>beep(784,.16,.26), cueOff=()=>beep(392,.12,.18),
      cueBase=()=>{beep(523,.14,.2); setTimeout(()=>beep(659,.18,.2),150);},
      cueTick=()=>beep(880,.06,.1),
      cueLast=()=>{beep(988,.11,.24); setTimeout(()=>beep(988,.11,.24),165);},
      cueEnd=()=>{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.24,.22),i*170));};

/* ---------- session ---------- */
let S=null, raf=0, lock=null;

function buildTimeline(day){
  const t=dayTiming(day), tl=[]; let acc=0;
  day.exercises.forEach((ex,ei)=>{
    const n=Math.max(1,+ex.counts||1);
    for(let r=1;r<=n;r++){
      tl.push({k:"on", ei, rep:r, reps:n, dur:t.on*1000, at:acc}); acc+=t.on*1000;
      tl.push({k:"off",ei, rep:r, reps:n, dur:t.off*1000, at:acc}); acc+=t.off*1000;
    }
    if(t.base>0){
      const last=ei===day.exercises.length-1;
      for(let c=1;c<=t.base;c++){
        tl.push({k:"base",sub:"on", ei,rep:n,reps:n,bc:c,bn:t.base,last,dur:t.on*1000, at:acc}); acc+=t.on*1000;
        tl.push({k:"base",sub:"off",ei,rep:n,reps:n,bc:c,bn:t.base,last,dur:t.off*1000,at:acc}); acc+=t.off*1000;
      }
    }
  });
  return {tl, total:acc, t};
}

function startSession(di){
  const lead=Math.max(0,+store.leadIn||0);
  if(lead>0){ preroll(di,lead); return; }
  beginSession(di);
}
function preroll(di,lead){
  const day=store.program.days[di], ex=day.exercises[0];
  show("run"); requestWakeLock();
  try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); AC.resume(); }catch(e){}
  $("whereTxt").textContent=(day.name||"Session")+" \u00b7 starting";
  $("clockLeft").textContent=mmss(dayCounts(day).secs);
  $("barFill").style.width="0%";
  $("pWord").className="pword base"; $("pWord").textContent="Ready";
  setRep(ex.name,"start your suit, then this begins"); $("modeTxt").textContent="";
  $("exName").textContent=ex.name||""; $("exKit").textContent=ex.kit||"";
  $("exCue").textContent=ex.setup||ex.cue||""; $("exNext").textContent="Get into position";
  const fr=framesFor(ex), slot=$("imgSlot");
  slot.innerHTML = (fr&&fr.length) ? '<div class="shot single"><img alt=""></div>' : '<div class="ph"></div>';
  if(fr&&fr.length) slot.querySelector("img").src=fr[0]; else slot.firstChild.textContent=ex.name||"";
  $("wave").innerHTML=""; $("playBtn").textContent="Start now"; $("playBtn").classList.remove("paused");
  let left=lead;
  const paint=()=>{ $("pSec").textContent=left; if(left<=3&&left>0) cueTick(); };
  paint();
  const go=()=>{ clearInterval(PRE.iv); PRE.iv=0; beginSession(di); };
  PRE.go=go;
  PRE.iv=setInterval(()=>{ left--; if(left<=0){ go(); return; } paint(); },1000);
}
const PRE={iv:0,go:null};
function beginSession(di){
  const day=store.program.days[di];
  const {tl,total,t}=buildTimeline(day);
  S={ di, day, tl, total, t, elapsed:0, running:true, anchor:performance.now(),
      segIdx:-1, lastSec:-1, lastWord:null, lastCls:null, lastEx:-1, waveEx:-1, waveKey:null, frames:null, frameIdx:0, exStarts:exStartMap(tl), baseStarts:baseStartMap(tl) };
  show("run"); requestWakeLock();
  try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); AC.resume(); }catch(e){}
  $("playBtn").textContent="Pause"; $("playBtn").classList.remove("paused");
  tick(performance.now()); loop();
}
function exStartMap(tl){ const m={}; tl.forEach(s=>{ if(m[s.ei]===undefined && s.k==="on") m[s.ei]=s.at; }); return m; }
function baseStartMap(tl){ const m={}; tl.forEach(s=>{ if(m[s.ei]===undefined && s.k==="base") m[s.ei]=s.at; }); return m; }

function loop(){ raf=requestAnimationFrame(ts=>{ tick(ts); loop(); }); }
function tick(ts){
  if(!S) return;
  if(S.running){ S.elapsed = Math.min(S.total, ts - S.anchor); }
  if(S.elapsed>=S.total){ finish(); return; }
  render();
}

function segAt(ms){
  const tl=S.tl; let lo=0, hi=tl.length-1, r=tl.length-1;
  while(lo<=hi){ const m=(lo+hi)>>1; if(tl[m].at<=ms){ r=m; lo=m+1; } else hi=m-1; }
  return r;
}

function phaseInfo(seg,into,left){
  const ceil=ms=>Math.max(0,Math.ceil(ms/1000));
  if(seg.k==="base") return {word:seg.last?"Relax":"Move", cls:"base", secs:ceil(left)};
  const mode=(S.day.exercises[seg.ei].mode)||"dynamic";
  if(seg.k==="on"){
    if(mode==="dynamic"){
      const half=seg.dur/2;
      return into<half ? {word:"Down", cls:"", secs:ceil(half-into)}
                       : {word:"Up",   cls:"", secs:ceil(left)};
    }
    return {word: mode==="squeeze"?"Squeeze":"Hold", cls:"", secs:ceil(left)};
  }
  return {word: mode==="dynamic"?"Reset" : mode==="squeeze"?"Lower" : "Release",
          cls:"off", secs:ceil(left)};
}
function dispIdx(seg){
  return (seg.k==="base" && !seg.last && seg.ei+1<S.day.exercises.length) ? seg.ei+1 : seg.ei;
}
function render(){
  const i=segAt(S.elapsed), seg=S.tl[i], into=S.elapsed-seg.at, left=seg.dur-into;
  const day=S.day, ex=day.exercises[seg.ei], disp=dispIdx(seg);

  if(i!==S.segIdx){
    S.segIdx=i;
    if(seg.k==="on") cueOn();
    else if(seg.k==="off"){ (seg.reps>1 && seg.rep===seg.reps-1) ? cueLast() : cueOff(); }
    else if(seg.sub==="on"){ (seg.last && seg.bc===1) ? cueEnd() : cueBase(); }
    if(disp!==S.lastEx){ S.lastEx=disp; paintExercise(seg); }
    const wk=(seg.k==="base"?"b":"e")+seg.ei;
    if(wk!==S.waveKey){ S.waveKey=wk; drawWave(seg); }
    setFrame(seg.k==="on" ? 1 : 0);
  }

  const ph=phaseInfo(seg,into,left);
  if(ph.word!==S.lastWord || ph.cls!==S.lastCls){
    S.lastWord=ph.word; S.lastCls=ph.cls;
    const w=$("pWord"); w.className="pword"+(ph.cls?" "+ph.cls:""); w.textContent=ph.word;
  }
  if(ph.secs!==S.lastSec){
    S.lastSec=ph.secs; $("pSec").textContent=ph.secs;
    if(seg.k==="base" && seg.sub==="off" && seg.bc===seg.bn && !seg.last && ph.secs<=3 && ph.secs>0) cueTick();
  }

  if(seg.k==="base"){
    setRep('base count <b>'+seg.bc+'</b> of '+seg.bn,
      seg.last ? 'all '+seg.reps+' reps done — session ending'
               : seg.reps+' of '+seg.reps+' done, next exercise coming up');
  }else{
    const doneReps = seg.k==="off" ? seg.rep : seg.rep-1, togo=seg.reps-doneReps;
    setRep('rep <b>'+seg.rep+'</b> of '+seg.reps,
      togo===0?'exercise complete':togo===1?'last rep':togo+' to go');
  }

  $("clockLeft").textContent = mmss((S.total-S.elapsed)/1000);
  $("barFill").style.width = (S.elapsed/S.total*100).toFixed(2)+"%";
  paintWave(seg);
}

function setRep(main,sub){
  const m=$("repMain"); if(m.innerHTML!==main) m.innerHTML=main;
  const b=$("repSub");  if(b.textContent!==sub) b.textContent=sub;
}
function paintExercise(seg){
  const day=S.day, exs=day.exercises, showIdx=dispIdx(seg);
  const ex=exs[showIdx];
  $("whereTxt").textContent=(day.name||"Session")+" · exercise "+(showIdx+1)+" of "+exs.length;
  $("exName").textContent=ex.name||"Exercise";
  $("exKit").textContent=ex.kit||"";
  $("exCue").textContent=ex.cue||ex.setup||"";
  const nx=exs[showIdx+1];
  $("modeTxt").textContent = {dynamic:"Dynamic rep — 3s down, 3s up",
    squeeze:"Peak squeeze — hold 6s, lower slowly",
    iso:"Isometric hold"}[ex.mode||"dynamic"];
  $("exNext").textContent = seg.k==="base"&&!seg.last ? "Get into position"
    : nx ? "Next: "+(nx.name||"") : "Last exercise";
  const fr=framesFor(ex), slot=$("imgSlot");
  if(fr && fr.length){
    slot.innerHTML='<div class="shot'+(fr.length<2?' single':'')+'"></div>';
    const box=slot.firstChild;
    S.frames=fr.map((src,i)=>{
      const im=document.createElement("img");
      im.src=src; im.alt=(ex.name||"")+(i?" — working position":" — start position");
      if(i===0) im.className="show";
      box.appendChild(im); return im;
    });
  }else{
    S.frames=null;
    slot.innerHTML='<div class="ph"></div>';
    slot.firstChild.textContent=(ex.setup||ex.name||"No photo for this exercise");
  }
  S.frameIdx=0;
}

function setFrame(i){
  if(!S || !S.frames || S.frames.length<2) return;
  if(i===S.frameIdx) return;
  S.frameIdx=i;
  S.frames.forEach((im,j)=>im.classList.toggle("show", j===i));
}

/* ---------- square-wave pulse train ---------- */
let WAVE=null;
function drawWave(seg){
  if(!S||!seg) return;
  const isBase=seg.k==="base", ei=isBase?seg.ei:dispIdx(seg);
  const n=isBase?seg.bn:Math.max(1,+S.day.exercises[ei].counts||1), t=S.t, cyc=t.on+t.off, W=1000, H=100, hi=16, lo=H-16;
  let d="M0,"+lo;
  for(let r=0;r<n;r++){
    const x0=(r*cyc)/(n*cyc)*W, x1=((r*cyc)+t.on)/(n*cyc)*W, x2=((r+1)*cyc)/(n*cyc)*W;
    d+=" L"+x0.toFixed(1)+","+lo+" L"+x0.toFixed(1)+","+hi+" L"+x1.toFixed(1)+","+hi+
       " L"+x1.toFixed(1)+","+lo+" L"+x2.toFixed(1)+","+lo;
  }
  const svg=$("wave");
  svg.setAttribute("viewBox","0 0 "+W+" "+H);
  svg.innerHTML='<defs><clipPath id="cp"><rect id="cpr" x="0" y="0" width="0" height="'+H+'"/></clipPath></defs>'+
    '<path class="track" d="'+d+'"/><g clip-path="url(#cp)"><path class="live'+(isBase?' b':'')+'" d="'+d+'"/></g>'+
    '<line class="head" id="hd" x1="0" y1="2" x2="0" y2="'+(H-2)+'"/>';
  WAVE={W,n,cyc,exStart:(isBase?S.baseStarts[ei]:S.exStarts[ei])||0,dur:n*cyc*1000,
        cpr:svg.querySelector("#cpr"), hd:svg.querySelector("#hd")};
}
function paintWave(seg){
  if(!WAVE) return;
  const p = Math.max(0,Math.min(1,(S.elapsed-WAVE.exStart)/WAVE.dur));
  const x=p*WAVE.W;
  WAVE.cpr.setAttribute("width",x.toFixed(1));
  WAVE.hd.setAttribute("x1",x.toFixed(1)); WAVE.hd.setAttribute("x2",x.toFixed(1));
}

/* ---------- controls ---------- */
function setRunning(r){
  if(!S) return;
  S.running=r; if(r) S.anchor=performance.now()-S.elapsed;
  $("playBtn").textContent=r?"Pause":"Resume";
  $("playBtn").classList.toggle("paused",!r);
  if(r) requestWakeLock(); else releaseWakeLock();
}
function seek(ms){
  S.elapsed=Math.max(0,Math.min(S.total,ms));
  S.anchor=performance.now()-S.elapsed;
  S.segIdx=-1; S.lastSec=-1; S.lastWord=null; S.lastCls=null; S.lastEx=-1; S.waveKey=null;
  render();
}
function onStarts(){
  if(!S._ons) S._ons=S.tl.filter(x=>x.k==="on"||(x.k==="base"&&x.sub==="on")).map(x=>x.at);
  return S._ons;
}
function syncNow(){
  if(!S) return;
  const a=onStarts(); if(!a.length) return;
  let best=a[0];
  for(const t of a) if(Math.abs(t-S.elapsed)<Math.abs(best-S.elapsed)) best=t;
  const shift=Math.round((best-S.elapsed)/100)/10;
  if(!S.running) setRunning(true);
  seek(best); cueOn();
  toast(shift===0?"Synced":"Synced "+(shift>0?"+":"")+shift.toFixed(1)+"s");
}
function toast(msg){
  const t=$("syncMsg"); t.textContent=msg; t.style.opacity="1";
  clearTimeout(toast._t); toast._t=setTimeout(()=>{t.style.opacity="0";},1600);
}
function jump(dir){
  if(!S) return;
  const cur=S.tl[Math.max(0,S.segIdx)];
  let target;
  if(dir<0){
    const st=S.exStarts[cur.ei];
    target = (S.elapsed - st > 2500 || cur.ei===0) ? st : S.exStarts[cur.ei-1];
  }else{
    target = S.exStarts[cur.ei+1];
    if(target===undefined){ finish(); return; }
  }
  seek(target);
}
function finish(){
  cancelAnimationFrame(raf); releaseWakeLock();
  const day=S.day, exs=day.exercises.length;
  const reps=day.exercises.reduce((a,e)=>a+(+e.counts||0),0);
  const stim=day.exercises.reduce((a,e)=>a+(+e.counts||0),0)*S.t.on;
  store.history.unshift({ts:Date.now(), day:day.name||("Day "+(S.di+1)),
    secs:Math.round(S.total/1000), reps, ex:exs, on:S.t.on, off:S.t.off});
  if(store.history.length>60) store.history.length=60;
  store.rotationIndex=(S.di+1)%store.program.days.length; save();
  $("doneTitle").textContent=(day.name||"Session")+" done";
  const nxt=store.program.days[store.rotationIndex];
  $("doneSub").textContent="Next in rotation: "+(nxt.name||"Day "+(store.rotationIndex+1));
  $("doneStats").innerHTML=
    '<div class="stat"><b>'+mmss(S.total/1000)+'</b><span>elapsed</span></div>'+
    '<div class="stat"><b>'+reps+'</b><span>'+(reps===1?'rep':'reps')+'</span></div>'+
    '<div class="stat"><b>'+exs+'</b><span>'+(exs===1?'exercise':'exercises')+'</span></div>'+
    '<div class="stat"><b>'+mmss(stim)+'</b><span>under stimulation</span></div>';
  S=null; selectedDay=store.rotationIndex; renderHome(); show("done"); cueEnd();
}
function quit(){ if(PRE.iv){clearInterval(PRE.iv);PRE.iv=0;} cancelAnimationFrame(raf); releaseWakeLock(); S=null; renderHome(); show("home"); }

/* ---------- wake lock ---------- */
async function requestWakeLock(){
  try{ if("wakeLock" in navigator && !lock){ lock=await navigator.wakeLock.request("screen");
       lock.addEventListener("release",()=>{lock=null;}); } }catch(e){}
}
function releaseWakeLock(){ try{ if(lock){ lock.release(); lock=null; } }catch(e){} }
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible" && S && S.running) requestWakeLock();
});

/* ---------- import / export ---------- */
function validate(p){
  if(!p||typeof p!=="object") throw new Error("That is not a JSON object.");
  if(!Array.isArray(p.days)||!p.days.length) throw new Error("Needs a \u201cdays\u201d array with at least one day.");
  p.days.forEach((d,i)=>{
    if(!Array.isArray(d.exercises)||!d.exercises.length)
      throw new Error("Day "+(i+1)+" has no \u201cexercises\u201d array.");
    d.exercises.forEach((e,j)=>{
      if(!e||typeof e.name!=="string"||!e.name.trim())
        throw new Error("Day "+(i+1)+", exercise "+(j+1)+" is missing a name.");
      if(!(+e.counts>0))
        throw new Error("\u201c"+e.name+"\u201d (day "+(i+1)+") needs counts greater than 0.");
    });
  });
  return p;
}
function template(){
  return JSON.stringify({name:"My program",impulse:{on:6,off:4},days:[
    {name:"Day 1 - Upper",baseCounts:2,exercises:[
      {name:"Goblet Squat",counts:8,kit:"KB at chest",cue:"Hold the bottom for the full 6s",image:"Goblet Squat"},
      {name:"Overhead Press",counts:8,kit:"Band underfoot",cue:"Lock out and hold"}]},
    {name:"Day 2 - Lower",baseCounts:2,impulse:{on:8,off:4},exercises:[
      {name:"Romanian Deadlift",counts:10,kit:"Dumbbells",cue:"Hinge over the 8s"}]}
  ]},null,1);
}
function loadProgram(txt){
  const msg=$("importMsg");
  try{
    const p=validate(JSON.parse(txt));
    store.program=p; store.rotationIndex=0; store.impulse=null; store.baseCounts=null;
    normalize(); save(); selectedDay=0; renderHome();
    msg.className="msg ok";
    msg.textContent="Loaded \u201c"+(p.name||"program")+"\u201d — "+p.days.length+" day"+(p.days.length>1?"s":"")+".";
    setTimeout(()=>show("home"),700);
  }catch(e){
    msg.className="msg err";
    msg.textContent = (e instanceof SyntaxError) ? "That is not valid JSON: "+e.message : e.message;
  }
}
function downloadFile(fn,txt){
  try{
    const url=URL.createObjectURL(new Blob([txt],{type:"application/json"}));
    const a=document.createElement("a"); a.href=url; a.download=fn;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000); return true;
  }catch(e){ return false; }
}
function stamp(){ const d=new Date(); const z=n=>String(n).padStart(2,"0");
  return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); }
async function saveBackup(){
  const txt=JSON.stringify({app:"Dojo",format:1,savedAt:new Date().toISOString(),state:store},null,1);
  const fn="dojo-backup-"+stamp()+".json";
  let dl=null; try{ if(window.claude&&claude.use) dl=await claude.use("downloads"); }catch(e){}
  if(dl){ try{ await dl.save({filename:fn,data:txt}); note("Backup saved."); return; }catch(e){} }
  note(downloadFile(fn,txt) ? "Backup saved to your device." : "Could not write the file here.");
}
function restoreBackup(txt){
  try{
    const b=JSON.parse(txt);
    const st=(b && b.state) ? b.state : b;
    if(!st || !st.program || !Array.isArray(st.program.days)) throw new Error("no program in that file");
    store=Object.assign({rotationIndex:0,impulse:null,baseCounts:null,sound:1,history:[]},st);
    normalize(); save(); selectedDay=store.rotationIndex; renderHome();
    note("Restored. "+(store.history.length)+" session"+(store.history.length===1?"":"s")+" in the log.");
  }catch(e){ note("That file could not be read: "+e.message,true); }
}
function note(msg,bad){ const n=$("dataNote");
  n.textContent=msg; n.style.color=bad?"var(--bad)":"var(--on)";
  clearTimeout(note._t); note._t=setTimeout(()=>{ n.style.color=""; renderDataNote(); },5000); }
function renderDataNote(){
  $("dataNote").textContent="Your rotation, timing and session log live in this browser's storage. "+
    "Save a backup file now and then \u2014 if you clear the browser or switch device, restoring it brings everything back.";
}

async function exportProgram(){
  const txt=JSON.stringify(store.program,null,1);
  const fn=(store.program.name||"program").replace(/[^\w\- ]+/g,"").trim().replace(/\s+/g,"-")+".json";
  let dl=null; try{ if(window.claude&&claude.use) dl=await claude.use("downloads"); }catch(e){}
  if(dl){ try{ await dl.save({filename:fn,data:txt}); return; }catch(e){} }
  if(downloadFile(fn,txt)) return;
  $("jsonBox").value=txt; $("importMsg").className="msg";
  $("importMsg").textContent="Saving files is not available here, so the program is in the box above — copy it out.";
  show("import");
}

/* ---------- wiring ---------- */
$("startBtn").onclick=()=>startSession(selectedDay);
$("playBtn").onclick=()=>{ if(PRE.iv){ PRE.go(); return; } setRunning(!S.running); };
$("prevBtn").onclick=()=>{ if(!PRE.iv) jump(-1); };
$("syncBtn").onclick=syncNow;
$("nextBtn").onclick=()=>jump(1);
$("exitBtn").onclick=quit;
$("doneHome").onclick=()=>{ show("home"); };
$("importBtn").onclick=()=>{ $("importMsg").textContent=""; $("jsonBox").value=""; show("import"); };
$("cancelImport").onclick=()=>show("home");
$("tmplBtn").onclick=()=>{ $("jsonBox").value=template(); $("importMsg").textContent=""; };
$("builtinBtn").onclick=()=>loadProgram(JSON.stringify(BUILTIN));
$("loadBtn").onclick=()=>loadProgram($("jsonBox").value);
$("exportBtn").onclick=exportProgram;
$("backupBtn").onclick=saveBackup;
$("doneBackup").onclick=saveBackup;
$("restoreBtn").onclick=()=>$("restoreIn").click();
$("restoreIn").onchange=e=>{ const f=e.target.files[0]; if(!f) return;
  const r=new FileReader(); r.onload=()=>{ restoreBackup(r.result); e.target.value=""; }; r.readAsText(f); };
$("fileBtn").onclick=()=>$("fileIn").click();
$("fileIn").onchange=e=>{ const f=e.target.files[0]; if(!f) return;
  const r=new FileReader(); r.onload=()=>{ $("jsonBox").value=r.result; loadProgram(r.result); }; r.readAsText(f); };
$("fLead").onchange=()=>{ store.leadIn=Math.max(0,Math.round(+$("fLead").value||0)); save(); renderHome(); };
["fOn","fOff","fBase"].forEach(id=>$(id).onchange=()=>{
  const on=+$("fOn").value||6, off=+$("fOff").value||4, b=Math.max(0,Math.round(+$("fBase").value||0));
  store.impulse={on:Math.max(.5,on), off:Math.max(.5,off)}; store.baseCounts=b;
  store.program.days.forEach(d=>{ d.baseCounts=b; });
  save(); renderHome();
});
$("fSound").onchange=()=>{ store.sound=+$("fSound").value; save(); };
document.addEventListener("keydown",e=>{
  if(!S) return;
  if(e.code==="Space"){ e.preventDefault(); setRunning(!S.running); }
  if(e.code==="KeyS"){ e.preventDefault(); syncNow(); }
  if(e.code==="ArrowRight") jump(1);
  if(e.code==="ArrowLeft") jump(-1);
  if(e.code==="Escape") quit();
});

localLoad(); normalize(); renderHome(); connectDb();

/* SW:start (removed by tools/build_standalone.py) */
if ("serviceWorker" in navigator && window.isSecureContext && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(()=>{});
}
/* SW:end */

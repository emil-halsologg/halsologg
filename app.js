'use strict';
const KEY='halsologg_v1', START='2026-11-09';
const ex=(n,s='3×10–12')=>({n,s});
const DEFAULT={
 proteinGoal:200,waterGoal:8,
 supplements:['Blodtrycksmedicin','Magnesium','Järn','D-vitamin'],
 morning:[{n:'Proteinshake 1',p:28},{n:'Proteinshake 2',p:28},{n:'Hemgjord shot (honung m.m.)',p:0}],
 meals:['Lunch (proteinrik)','Middag (proteinrik)','Mellanmål'],
 cycle:[
  {name:'Mage + Bröst',cardio:'PW + 5 km',ex:[ex('Crunches','3×15–20'),ex('Benlyft hängande','3×10–12'),ex('Plankan','3×45 s'),ex('Ryska vridningar','3×20'),ex('Cykelcrunches','3×20'),ex('Kabelcrunch','3×12–15'),ex('Bänkpress skivstång','4×8–10'),ex('Lutande hantelpress','3×10–12'),ex('Hantelflyes','3×12'),ex('Kabelcross','3×12–15'),ex('Dips (bröstfokus)','3×max'),ex('Armhävningar','3×max')]},
  {name:'Rygg + Biceps',cardio:'PW + PW',ex:[ex('Latsdrag','4×10–12'),ex('Skivstångsrodd','4×8–10'),ex('Sittande kabelrodd','3×10–12'),ex('Enarms hantelrodd','3×10'),ex('Pull-ups / assisterade','3×max'),ex('Ryggresningar','3×12–15'),ex('Skivstångscurl','3×10'),ex('Hantelcurl','3×10–12'),ex('Hammercurl','3×12'),ex('Koncentrationscurl','3×10'),ex('Kabelcurl','3×12–15'),ex('Lutande hantelcurl','3×10')]},
  {name:'Mage + Axlar + Triceps',cardio:'PW + 10 km',ex:[ex('Crunches','3×15–20'),ex('Omvända crunches','3×15'),ex('Sidoplanka','3×30 s/sida'),ex('Ab wheel / utrullning','3×10'),ex('Mountain climbers','3×30 s'),ex('Dead bug','3×12'),ex('Axelpress hantlar','4×8–10'),ex('Sidolyft','3×12–15'),ex('Omvända flyes','3×12–15'),ex('Triceps pushdown kabel','3×12'),ex('Fransk press','3×10'),ex('Dips (triceps)','3×max')]},
  {name:'Ben',cardio:'PW',ex:[ex('Knäböj','4×8–10'),ex('Benpress','4×10–12'),ex('Rumänsk marklyft','3×10'),ex('Utfallssteg','3×10/ben'),ex('Bensträck','3×12–15'),ex('Lårcurl','3×12–15'),ex('Bulgarisk splitböj','3×10/ben'),ex('Höftlyft','3×12'),ex('Vadpress stående','4×15'),ex('Adduktor/abduktor maskin','3×15')]},
  {name:'Vila',cardio:'PW + 5 km',ex:[]}
 ]};
let db=load(), cur=today(), tab='idag';
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.settings)return d}catch(e){}return{settings:JSON.parse(JSON.stringify(DEFAULT)),days:{},measures:[]}}
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function today(){return iso(new Date())}
function addDays(s,n){const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)}
function diff(a,b){return Math.round((new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/864e5)}
function cycleIndex(s){const n=db.settings.cycle.length;return((diff(s,START)%n)+n)%n}
function pass(s){return db.settings.cycle[cycleIndex(s)]}
window.trainingDayName=s=>pass(s).name;
function day(s){return db.days[s]||(db.days[s]={c:{},p:{},ex:{},cardio:[],water:0})}
function dayRO(s){return db.days[s]||{c:{},p:{},ex:{},cardio:[],water:0}}
function protein(s){const d=dayRO(s),S=db.settings;let t=0;S.morning.forEach((m,i)=>{if(d.c['m'+i])t+=+(d.p['m'+i]??m.p)||0});S.meals.forEach((m,i)=>{t+=+(d.p['meal'+i])||0});return t}
function streak(s){let n=0,x=s;if(!dayRO(x).c.kvall)x=addDays(x,-1);while(dayRO(x).c.kvall){n++;x=addDays(x,-1)}return n}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const V=document.getElementById('view');
const DN=['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'],MN=['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
function fmt(s){const d=new Date(s+'T12:00:00');return DN[d.getDay()]+' '+d.getDate()+' '+MN[d.getMonth()]}
function chk(id,label,sub=''){const d=dayRO(cur);return`<div class="row"><label><input type="checkbox" data-c="${id}" ${d.c[id]?'checked':''}><span class="${d.c[id]?'done':''}">${esc(label)}</span></label>${sub}</div>`}
function num(id,val,ph='g'){return`<input class="num" type="number" inputmode="decimal" data-p="${id}" value="${val??''}" placeholder="${ph}">`}

function renderIdag(){const S=db.settings,d=dayRO(cur),p=protein(cur),ps=pass(cur);
 return`<div class="card"><h2>Protein</h2><div class="big">${p} / ${S.proteinGoal} g</div><div class="bar"><div style="width:${Math.min(100,p/S.proteinGoal*100)}%"></div></div></div>
 <div class="card"><h2>Medicin & tillskott</h2>${S.supplements.map((n,i)=>chk('s'+i,n)).join('')}</div>
 <div class="card"><h2>Morgon</h2>${S.morning.map((m,i)=>chk('m'+i,m.n,m.p||d.p['m'+i]?num('m'+i,d.p['m'+i]??m.p):'')).join('')}</div>
 <div class="card"><h2>Måltider</h2>${S.meals.map((m,i)=>chk('meal'+i,m,num('meal'+i,d.p['meal'+i]))).join('')}<small style="color:var(--mut)">Fyll i ungefärligt protein (g) per måltid.</small></div>
 <div class="card"><h2>Dagens pass</h2><span class="pill">${esc(ps.name)}</span> <small style="color:var(--mut)">Kardio: ${esc(ps.cardio)}</small><div style="margin-top:8px">${ps.ex.length?`${Object.values(d.ex||{}).filter(e=>e.done).length} / ${ps.ex.length} övningar klara`:'Vilodag – vila musklerna 🙂'}</div><button class="btn sec" style="margin-top:10px;width:100%" onclick="go('traning')">Öppna träning</button></div>
 <div class="card"><h2>Kvällskoll</h2>${chk('kvall','Inget godis/chips ikväll 🍫🚫')}<div>🔥 Svit: <b>${streak(cur)}</b> kvällar</div></div>
 <div class="card"><h2>Vatten</h2><div class="stepper"><button data-w="-1">−</button><span class="big">${d.water||0}</span><button data-w="1">+</button><span style="color:var(--mut)">av ${S.waterGoal} glas</span></div></div>
 <div class="card"><h2>Sömn (Oura)</h2><div class="grid">${fld('sleep','Sömnpoäng')}${fld('ready','Readiness')}${fld('hours','Timmar sömn')}</div></div>
 <div class="card"><h2>Blodtryck (valfritt)</h2><div class="grid">${fld('sys','Systoliskt')}${fld('dia','Diastoliskt')}</div></div>
 <div class="card"><h2>Anteckning</h2><textarea data-f="note" style="min-height:70px">${esc(d.note||'')}</textarea></div>`}
function fld(k,l){return`<label>${l}<input type="number" inputmode="decimal" data-f="${k}" value="${dayRO(cur)[k]??''}"></label>`}

function renderTraning(){const ps=pass(cur),d=dayRO(cur);
 let h=`<div class="card"><h2>Pass – dag ${cycleIndex(cur)+1} av ${db.settings.cycle.length}</h2><div class="big">${esc(ps.name)}</div></div>`;
 if(ps.ex.length)h+=`<div class="card"><h2>Övningar</h2>${ps.ex.map((e,i)=>{const r=(d.ex||{})[i]||{};return`<div class="row"><label><input type="checkbox" data-ex="${i}" ${r.done?'checked':''}><span class="${r.done?'done':''}">${esc(e.n)}<br><small>${esc(e.s)}</small></span></label><input class="num" type="number" inputmode="decimal" data-exkg="${i}" value="${r.kg??''}" placeholder="kg"></div>`}).join('')}</div>`;
 h+=`<div class="card"><h2>Kardio – mål: ${esc(ps.cardio)}</h2>${(d.cardio||[]).map((c,i)=>`<div class="row"><span style="flex:1">${esc(c.type)} · ${c.km||0} km · ${c.min||0} min</span><button class="btn sec" data-delc="${i}">✕</button></div>`).join('')}
 <div class="grid" style="margin-top:10px"><label>Typ<select id="ctype"><option>Powerwalk</option><option>Jogg</option><option>Annat</option></select></label><label>Km<input id="ckm" type="number" inputmode="decimal"></label><label>Minuter<input id="cmin" type="number" inputmode="numeric"></label><label>&nbsp;<button class="btn" id="cadd">Logga</button></label></div></div>`;
 return h}

function renderHistorik(){let rows='';for(let i=6;i>=0;i--){const s=addDays(cur,-i),d=dayRO(s),ps=pass(s),done=Object.values(d.ex||{}).filter(e=>e.done).length,km=(d.cardio||[]).reduce((a,c)=>a+(+c.km||0),0);
  rows+=`<tr><td>${fmt(s).slice(0,3)} ${s.slice(8)}</td><td>${protein(s)}</td><td>${ps.ex.length?done+'/'+ps.ex.length:'Vila'}</td><td>${km?km.toFixed(1):'–'}</td><td>${d.sleep??'–'}</td><td>${d.c.kvall?'✅':'–'}</td></tr>`}
 const M=[...db.measures].sort((a,b)=>a.date<b.date?-1:1);
 return`<div class="card"><h2>Senaste 7 dagarna</h2><table><tr><th>Dag</th><th>Protein</th><th>Pass</th><th>Km</th><th>Sömn</th><th>Kväll</th></tr>${rows}</table><div style="margin-top:8px">🔥 Kvällssvit: <b>${streak(cur)}</b></div></div>
 <div class="card"><h2>Vikt & midja (veckovis)</h2><div class="grid"><label>Datum<input id="mdate" type="date" value="${cur}"></label><label>Vikt (kg)<input id="mw" type="number" inputmode="decimal"></label><label>Midja (cm)<input id="mwa" type="number" inputmode="decimal"></label><label>&nbsp;<button class="btn" id="madd">Spara</button></label></div>
 ${chart(M,'weight','Vikt kg','#2563eb')}${chart(M,'waist','Midja cm','#16a34a')}
 ${M.slice().reverse().map(m=>`<div class="row"><span style="flex:1">${m.date}: ${m.weight??'–'} kg · ${m.waist??'–'} cm</span><button class="btn sec" data-delm="${m.date}">✕</button></div>`).join('')}</div>`}
function chart(M,k,t,col){const P=M.filter(m=>m[k]!=null&&m[k]!=='');if(P.length<2)return`<p style="color:var(--mut)">${t}: kurvan visas när du har minst 2 mätningar.</p>`;
 const W=340,H=150,pad=28,vs=P.map(p=>+p[k]),mn=Math.min(...vs)-1,mx=Math.max(...vs)+1,x=i=>pad+i*(W-pad-8)/(P.length-1),y=v=>H-20-(v-mn)/(mx-mn)*(H-35);
 return`<svg viewBox="0 0 ${W} ${H}" width="100%" style="margin-top:10px"><text x="0" y="12">${t}</text><text x="0" y="${y(mx-1)+3}">${(mx-1).toFixed(0)}</text><text x="0" y="${y(mn+1)+3}">${(mn+1).toFixed(0)}</text><polyline fill="none" stroke="${col}" stroke-width="3" points="${P.map((p,i)=>x(i)+','+y(+p[k])).join(' ')}"/>${P.map((p,i)=>`<circle cx="${x(i)}" cy="${y(+p[k])}" r="4" fill="${col}"/>`).join('')}<text x="${pad}" y="${H-4}">${P[0].date.slice(5)}</text><text x="${W-40}" y="${H-4}">${P[P.length-1].date.slice(5)}</text></svg>`}

function renderInst(){const S=db.settings;
 return`<div class="card"><h2>Mål</h2><div class="grid"><label>Proteinmål (g)<input data-s="proteinGoal" type="number" value="${S.proteinGoal}"></label><label>Vattenmål (glas)<input data-s="waterGoal" type="number" value="${S.waterGoal}"></label></div></div>
 <div class="card"><h2>Medicin & tillskott (en per rad)</h2><textarea id="tsup">${esc(S.supplements.join('\n'))}</textarea></div>
 <div class="card"><h2>Morgon (namn;protein g)</h2><textarea id="tmorn">${esc(S.morning.map(m=>m.n+';'+m.p).join('\n'))}</textarea></div>
 <div class="card"><h2>Måltider (en per rad)</h2><textarea id="tmeal">${esc(S.meals.join('\n'))}</textarea></div>
 ${S.cycle.map((c,i)=>`<div class="card"><h2>Dag ${i+1}</h2><div class="grid"><label>Namn<input id="cn${i}" type="text" value="${esc(c.name)}"></label><label>Kardiomål<input id="cc${i}" type="text" value="${esc(c.cardio)}"></label></div><label style="font-size:14px;color:var(--mut)">Övningar (namn;set×reps)</label><textarea id="ce${i}">${esc(c.ex.map(e=>e.n+';'+e.s).join('\n'))}</textarea></div>`).join('')}
 <button class="btn" id="ssave" style="width:100%;margin-bottom:12px">Spara inställningar</button>
 <div class="card"><h2>Säkerhetskopia</h2><p style="color:var(--mut);font-size:14px">Data sparas bara i den här telefonen. Exportera då och då.</p><button class="btn" id="exp">Exportera (JSON)</button> <button class="btn sec" id="imp">Importera</button><input type="file" id="impf" accept="application/json,.json" hidden></div>
 <div class="card"><h2>Schema</h2><p style="color:var(--mut);font-size:14px">Löpande ${S.cycle.length}-dagarscykel som startar måndag 9 nov 2026 (dag 1).</p><button class="btn sec" id="reset">Återställ standardinställningar</button></div>`}

function render(){document.getElementById('datelbl').innerHTML=fmt(cur)+(cur===today()?' · Idag':'')+`<small>${esc(pass(cur).name)}</small>`;
 V.innerHTML={idag:renderIdag,traning:renderTraning,historik:renderHistorik,installningar:renderInst}[tab]();
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab))}
window.go=t=>{tab=t;render();scrollTo(0,0)};
document.getElementById('tabs').onclick=e=>{const b=e.target.closest('button');if(b)go(b.dataset.tab)};
document.getElementById('prev').onclick=()=>{cur=addDays(cur,-1);render()};
document.getElementById('next').onclick=()=>{cur=addDays(cur,1);render()};
V.addEventListener('change',e=>{const t=e.target,d=day(cur),D=t.dataset;
 if(D.c!==undefined){d.c[D.c]=t.checked;if(D.c.startsWith('meal')&&!t.checked);}
 else if(D.p!==undefined){d.p[D.p]=t.value===''?undefined:+t.value;const box=document.querySelector(`[data-c="${D.p}"]`);if(t.value&&box&&!box.checked){box.checked=true;d.c[D.p]=true}}
 else if(D.f!==undefined)d[D.f]=t.value===''?undefined:(D.f==='note'?t.value:+t.value);
 else if(D.ex!==undefined){(d.ex[D.ex]||(d.ex[D.ex]={})).done=t.checked}
 else if(D.exkg!==undefined){(d.ex[D.exkg]||(d.ex[D.exkg]={})).kg=t.value===''?undefined:+t.value}
 else if(D.s!==undefined){db.settings[D.s]=+t.value}
 else return;
 save();if(t.type==='checkbox'||D.p!==undefined)render()});
V.addEventListener('click',e=>{const t=e.target,D=t.dataset,d=()=>day(cur);
 if(D.w){d().water=Math.max(0,(d().water||0)+ +D.w);save();render()}
 else if(t.id==='cadd'){const km=+document.getElementById('ckm').value||0,min=+document.getElementById('cmin').value||0;d().cardio.push({type:document.getElementById('ctype').value,km,min});save();render()}
 else if(D.delc){d().cardio.splice(+D.delc,1);save();render()}
 else if(t.id==='madd'){const date=document.getElementById('mdate').value,w=document.getElementById('mw').value,wa=document.getElementById('mwa').value;if(!date||(!w&&!wa))return alert('Fyll i vikt eller midja');db.measures=db.measures.filter(m=>m.date!==date);db.measures.push({date,weight:w?+w:null,waist:wa?+wa:null});save();render()}
 else if(D.delm){if(confirm('Ta bort mätningen?')){db.measures=db.measures.filter(m=>m.date!==D.delm);save();render()}}
 else if(t.id==='ssave'){const S=db.settings,L=id=>document.getElementById(id).value.split('\n').map(s=>s.trim()).filter(Boolean);
  S.supplements=L('tsup');S.meals=L('tmeal');S.morning=L('tmorn').map(l=>{const[a,b]=l.split(';');return{n:a.trim(),p:+b||0}});
  S.cycle.forEach((c,i)=>{c.name=document.getElementById('cn'+i).value;c.cardio=document.getElementById('cc'+i).value;c.ex=L('ce'+i).map(l=>{const[a,b]=l.split(';');return{n:a.trim(),s:(b||'').trim()}})});
  save();alert('Sparat!');render()}
 else if(t.id==='exp'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,1)],{type:'application/json'}));a.download='halsologg-'+today()+'.json';a.click()}
 else if(t.id==='imp')document.getElementById('impf').click();
 else if(t.id==='reset'){if(confirm('Återställa inställningar? (Loggad data behålls)')){db.settings=JSON.parse(JSON.stringify(DEFAULT));save();render()}}});
V.addEventListener('change',e=>{if(e.target.id!=='impf')return;const f=e.target.files[0];if(!f)return;f.text().then(t=>{const d=JSON.parse(t);if(!d.settings||!d.days)throw 0;if(confirm('Ersätta all data med filens innehåll?')){db=d;save();render();alert('Importerat!')}}).catch(()=>alert('Ogiltig fil'))});
render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});

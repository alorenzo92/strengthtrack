'use strict';
const $=s=>document.querySelector(s),slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const pad=n=>String(n).padStart(2,'0'),iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,pd=s=>new Date(s+'T00:00:00');
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DAYS=['Mon','Tue','Wed','Thu','Fri'],DN=['Upper Strength','Lower Strength','Push / Hypertrophy','Pull / Arms','Lower / Posterior'];
const dnm=d=>(S.dn&&S.dn[d])||DN[d];
const MGS=['Chest','Back','Shoulders','Quads','Hamstrings','Glutes','Calves','Triceps','Biceps','Abs'];
const LIB=`Barbell Bench Press|Chest|BB|5|180|4|6
Incline Dumbbell Press|Chest|DB|5|120|8|12
Dumbbell Bench Press|Chest|DB|5|120|8|12
Chest Press Machine|Chest|MC|10|90|8|12
Pec Deck Fly|Chest|MC|5|75|10|15
Cable Fly|Chest|CB|2.5|75|10|15
Bent-Over Barbell Row|Back|BB|5|150|5|8
Lat Pulldown|Back|CB|5|120|8|12
Neutral-Grip Lat Pulldown|Back|CB|5|120|8|12
Chest-Supported Row|Back|MC|5|120|8|12
Seated Cable Row|Back|CB|5|120|8|12
Pull-Up|Back|BW|2.5|150|5|10
One-Arm Dumbbell Row|Back|DB|5|90|8|12
T-Bar Row|Back|BB|5|120|8|12
Conventional Deadlift|Back|BB|5|180|3|5
Overhead Press|Shoulders|BB|2.5|150|5|8
Dumbbell Shoulder Press|Shoulders|DB|5|120|8|12
Dumbbell Lateral Raise|Shoulders|DB|2.5|60|12|20
Cable Lateral Raise|Shoulders|CB|2.5|60|12|20
Reverse Pec Deck|Shoulders|MC|5|60|12|20
Face Pull|Shoulders|CB|2.5|60|12|20
Barbell Back Squat|Quads|BB|5|180|4|6
Leg Press|Quads|MC|10|120|8|12
Hack Squat|Quads|MC|10|150|6|10
Leg Extension|Quads|MC|5|75|10|15
Front Squat|Quads|BB|5|180|5|8
Bulgarian Split Squat|Quads|DB|5|120|8|12
Walking Lunge|Quads|DB|5|120|8|12
Romanian Deadlift|Hamstrings|BB|5|150|6|10
Seated Leg Curl|Hamstrings|MC|5|75|8|12
Lying Leg Curl|Hamstrings|MC|5|75|8|12
Good Morning|Hamstrings|BB|5|150|6|10
Barbell Hip Thrust|Glutes|BB|10|120|8|12
Cable Pull-Through|Glutes|CB|5|90|10|15
Standing Calf Raise|Calves|MC|10|75|10|15
Seated Calf Raise|Calves|MC|5|75|10|15
Cable Triceps Pushdown|Triceps|CB|2.5|75|10|15
Overhead Cable Triceps Extension|Triceps|CB|2.5|75|10|15
Skull Crusher|Triceps|BB|2.5|90|8|12
Close-Grip Bench Press|Triceps|BB|5|150|6|10
Dip|Triceps|BW|2.5|120|6|12
EZ-Bar Curl|Biceps|BB|2.5|75|8|12
Incline Dumbbell Curl|Biceps|DB|2.5|75|10|15
Hammer Curl|Biceps|DB|2.5|75|8|12
Cable Curl|Biceps|CB|2.5|75|10|15
Cable Crunch|Abs|CB|5|60|10|15
Hanging Leg Raise|Abs|BW|0|60|8|15`;
const PLAN=['Barbell Bench Press|3|4|6;Bent-Over Barbell Row|3|5|8;Overhead Press|2|5|8;Lat Pulldown|3|8|12;Incline Dumbbell Press|2|8|12;Cable Triceps Pushdown|2|10|15',
'Barbell Back Squat|3|4|6;Romanian Deadlift|3|6|10;Leg Press|2|8|12;Seated Leg Curl|2|8|12;Standing Calf Raise|3|10|15;Cable Crunch|2|10|15',
'Incline Dumbbell Press|3|8|12;Dumbbell Shoulder Press|2|8|12;Chest Press Machine|2|8|12;Dumbbell Lateral Raise|3|12|20;Overhead Cable Triceps Extension|2|10|15;Pec Deck Fly|2|10|15',
'Chest-Supported Row|3|8|12;Neutral-Grip Lat Pulldown|3|8|12;Seated Cable Row|2|8|12;Reverse Pec Deck|2|12|20;EZ-Bar Curl|2|8|12;Incline Dumbbell Curl|2|10|15',
'Conventional Deadlift|2|3|5;Hack Squat|3|6|10;Barbell Hip Thrust|3|8|12;Leg Extension|2|10|15;Lying Leg Curl|2|8|12;Seated Calf Raise|3|10|15'];
function fresh(){const ex={};LIB.split('\n').forEach(l=>{const[n,mg,eq,inc,rest,lo,hi]=l.split('|');ex[slug(n)]={id:slug(n),name:n,mg,eq,inc:+inc,rest:+rest,lo:+lo,hi:+hi}});
 return{app:'StrengthTrack',v:1,unit:'lb',cyc:1,start:iso(new Date()),weeks:12,ex,plan:PLAN.map(d=>d.split(';').map(x=>{const[n,s,lo,hi]=x.split('|');return{ex:slug(n),sets:+s,lo:+lo,hi:+hi}})),sessions:{},timer:null}}
let PL,PK,S,cur,tab='today',M=null,P={mg:'All',ex:'',rng:0},ED=0,dbp;
// ---- storage (IndexedDB) ----
const db=()=>dbp||(dbp=new Promise((res,rej)=>{const q=indexedDB.open('strengthtrack',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}));
const kvg=async k=>{const d=await db();return new Promise(r=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)})};
const kvs=async(k,v)=>{try{const d=await db();d.transaction('kv','readwrite').objectStore('kv').put(JSON.parse(JSON.stringify(v)),k)}catch(e){toast('Save failed!')}};
const load=()=>kvg('p:'+PK),save=()=>kvs('p:'+PK,S),saveMeta=()=>kvs('meta',{PL,PK});
// ---- math ----
const e1=(w,r)=>{w=+w;r=+r;return w>0&&r>=1?(r===1?w:w*(1+r/30)):0};
const K=0.45359,U=()=>S.unit,fw=w=>w===''||w==null?'':S.unit==='kg'?Math.round(w*K*10)/10:Math.round(w*100)/100,pw=v=>S.unit==='kg'?Math.round(v/K*100)/100:+v;
const eqL=e=>({BB:'Barbell',DB:'Dumbbell',CB:'Cable',MC:'Machine',BW:'Bodyweight'}[e.eq]||e.eq)+(e.eq==='DB'?` · ${U()} per dumbbell`:'');
const BAR=()=>(S.bar&&S.bar[S.unit])||(S.unit==='kg'?20:45),PLS=()=>(S.pl&&S.pl[S.unit])||(S.unit==='kg'?[25,20,15,10,5,2.5,1.25]:[45,35,25,10,5,2.5]);
const PM=e=>!!e&&e.eq==='BB'&&S.pm!==0,barLb=e=>e.bar||(S.unit==='kg'?BAR()/K:BAR()),wv=(w,e)=>w===''||w==null?'':fw(PM(e)?Math.max(0,w-barLb(e)):w);
function plateTxt(w,e){if(e.eq!=='BB'||!(+w>0))return'';const t=fw(+w),bar=e.bar?fw(e.bar):BAR();if(t<bar-1e-9)return'';let per=Math.round((t-bar)/2*1000)/1000;if(per<=0)return'Bar only';const o=[];for(const p of PLS())while(per>=p-1e-9){o.push(p);per=Math.round((per-p)*1000)/1000}const s=o.join(' + ')+' per side';return per>0?`${s} → loads ${Math.round((bar+2*o.reduce((a,b)=>a+b,0))*100)/100} ${U()} (exact weight not possible)`:s}
function plateSub(w,e){if(e.eq!=='BB'||!(+w>0))return'';const t=fw(+w),bar=e.bar?fw(e.bar):BAR();if(t<bar-1e-9)return'';let per=Math.round((t-bar)/2*1000)/1000,sum=0;for(const p of PLS())while(per>=p-1e-9){sum+=p;per=Math.round((per-p)*1000)/1000}const pl=Math.round(sum*2*100)/100;return `Bar ${bar} + plates ${pl} = ${Math.round((bar+pl)*100)/100} ${U()}`}
const pct=(a,b)=>b>0?((a-b)/b*100).toFixed(1)+'%':'—';
const mon=()=>{const d=pd(S.start);return addD(d,-((d.getDay()+6)%7))},dateOf=(w,d)=>addD(mon(),(w-1)*7+d);
function curPos(){const n=Math.round((pd(iso(new Date()))-mon())/864e5);if(n<0)return{w:1,d:0,i:0};let w=Math.floor(n/7)+1,d=n%7;if(d>4){w++;d=0}return{w:Math.min(w,S.weeks),d,i:0}}
function sess(w,d){const k=`${S.cyc}-${w}-${d}`;if(!S.sessions[k])S.sessions[k]={k,cyc:S.cyc,w,d,date:iso(dateOf(w,d)),fin:0,items:S.plan[d].map(p=>({ex:p.ex,n:p.sets,lo:p.lo,hi:p.hi,sets:Array.from({length:p.sets},()=>({w:'',r:'',rpe:'',wu:0,done:0}))}))};return S.sessions[k]}
const touched=s=>s.fin||s.items.some(i=>i.sets.some(x=>x.done||x.w!==''||x.r!==''));
const planChanged=d=>{for(const k in S.sessions){const s=S.sessions[k];if(s.cyc===S.cyc&&s.d===d&&!touched(s))delete S.sessions[k]}};
function hist(id,skip){const o=[];for(const s of Object.values(S.sessions)){if(s.k===skip)continue;for(const it of s.items)if(it.ex===id){const ws=it.sets.filter(x=>x.done&&!x.wu&&+x.w>0&&+x.r>=1);if(ws.length)o.push({o:s.cyc*1e4+s.w*10+s.d,date:s.date,sets:ws})}}return o.sort((a,b)=>a.o-b.o)}
function stats(id,skip){const h=hist(id,skip);if(!h.length)return null;const pts=h.map(x=>({d:x.date,v:Math.max(...x.sets.map(s=>e1(s.w,s.r))),m:Math.max(...x.sets.map(s=>+s.w)),vol:x.sets.reduce((a,s)=>a+s.w*s.r,0)}));let b=0;pts.forEach((p,i)=>{if(p.v>=pts[b].v)b=i});return{pts,h,best:pts[b].v,prev:Math.max(0,...pts.slice(0,b).map(p=>p.v)),first:pts[0].v,maxW:Math.max(...pts.map(p=>p.m)),vol:pts.reduce((a,p)=>a+p.vol,0)}}
function rec(id,it,skip){const h=hist(id,skip),e=S.ex[id];if(!h.length)return{w:0,t:`No history for this exercise yet. Pick a load you can lift ~${it.lo} times with 2+ reps in reserve.`};
 const l=h[h.length-1],tw=Math.max(...l.sets.map(s=>+s.w)),all=l.sets.length>=it.n&&l.sets.every(s=>s.r>=it.hi),rp=l.sets.map(s=>+s.rpe).filter(x=>x>0),hard=rp.length&&Math.max(...rp)>9,p=h[h.length-2],cons=!p||p.sets.every(s=>s.r>=it.hi-2);
 const v=h.slice(-3).map(x=>Math.max(...x.sets.map(s=>e1(s.w,s.r)))),dec=v.length===3&&v[0]>v[1]&&v[1]>v[2],reps=l.sets.map(s=>s.r).join('/');
 if(dec)return{w:tw,t:`⚠ Est. 1RM fell 3 sessions in a row. Holding ${fw(tw)} ${U()}; review sleep, food, form or deload.`};
 if(all&&hard)return{w:tw,t:`All sets hit ${it.hi}+ but RPE was above 9. Hold ${fw(tw)} ${U()} until it feels easier.`};
 if(all&&!cons)return{w:tw,t:`Top of range hit, but the session before was well short. Repeat ${fw(tw)} ${U()} once to confirm it isn't a fluke.`};
 if(all)return{w:tw+e.inc,t:`All ${it.n} sets reached ${it.hi}+ reps at ${fw(tw)} ${U()} (effort OK). Add ${fw(e.inc)} ${U()}.`};
 return{w:tw,t:`Keep ${fw(tw)} ${U()} and add reps. Last: ${reps}. Increase after all ${it.n} sets reach ${it.hi}.`}}
// ---- timer ----
const mmss=s=>{const t=Math.ceil(s-1e-9);return`${Math.floor(t/60)}:${pad(t%60)}`};
function startT(s){S.timer={end:Date.now()+s*1e3,tot:s,p:0,fired:0}}
function beep(){try{const c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator();o.connect(c.destination);o.frequency.value=880;o.start();setTimeout(()=>o.stop(),400)}catch(e){}navigator.vibrate&&navigator.vibrate([200,100,200])}
function tick(){const t=S&&S.timer,b=$('#tb');if(!t){b.hidden=true;return}b.hidden=false;const rem=t.p||Math.max(0,t.end-Date.now());$('#tt').textContent=mmss(rem/1e3);$('#tbar').style.width=(100-rem/(t.tot*10))+'%';if(!t.p&&rem<=0&&!t.fired){t.fired=1;save();beep()}}
const ask=(msg,def,btns)=>new Promise(res=>{const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;background:#000c;z-index:30;display:flex;align-items:center;justify-content:center;padding:16px';d.innerHTML=`<div class="card" style="width:100%;max-width:420px"><p>${esc(msg)}</p>${def!=null?`<input id="dgi" style="text-align:left;font-size:18px" value="${esc(def)}">`:''}<div class="flex" style="margin-top:10px">${btns.map((b,i)=>`<button class="${i===btns.length-1?'pri':''}" data-i="${i}">${esc(b)}</button>`).join('')}</div></div>`;document.body.append(d);const i=d.querySelector('input');i&&i.focus();d.onclick=e=>{const b=e.target.closest('button[data-i]');if(!b)return;const v=i?i.value:'';d.remove();res({i:+b.dataset.i,v})}});
const askText=async(m,def)=>{const x=await ask(m,def,['Cancel','OK']);return x.i===1?x.v.trim():''},askYes=async(m,b)=>(await ask(m,null,['Cancel',b||'OK'])).i===1;
function toast(m){const d=document.createElement('div');d.id='toast';d.textContent=m;document.body.append(d);setTimeout(()=>d.remove(),1800)}
// ---- views ----
const curS=()=>sess(cur.w,cur.d);
const comp=s=>s.fin,nDone=()=>Object.values(S.sessions).filter(s=>s.cyc===S.cyc&&comp(s)).length;
const dr=(a,l)=>[Math.sin(a*Math.PI/180)*l,-Math.cos(a*Math.PI/180)*l],ad=(P,d)=>[P[0]+d[0],P[1]+d[1]],ST=[180,180];
const po=(h,t,a,l,bar,x)=>({h,t,a,l,bar,...x}),
RACK='<line x1="9" y1="14" x2="9" y2="55.5" stroke="#475569" stroke-width="2.2"/><line x1="9" y1="21" x2="15" y2="21" stroke="#475569" stroke-width="2"/><line x1="9" y1="55" x2="20" y2="55" stroke="#475569" stroke-width="2"/>',
BN2='<rect x="9" y="46.2" width="38" height="3.4" rx="1.7" fill="#475569"/><line x1="15" y1="49" x2="15" y2="55.5" stroke="#475569" stroke-width="2"/><line x1="41" y1="49" x2="41" y2="55.5" stroke="#475569" stroke-width="2"/>',
SEAT='<rect x="12" y="41.5" width="17" height="3" rx="1.5" fill="#475569"/><line x1="19" y1="42" x2="19.5" y2="26" stroke="#475569" stroke-width="3.5" stroke-linecap="round"/><line x1="16" y1="44.5" x2="16" y2="55.5" stroke="#475569" stroke-width="2"/>',
BN3='<rect x="3" y="46" width="19" height="3.4" rx="1.7" fill="#475569"/><line x1="7" y1="49" x2="7" y2="55.5" stroke="#475569" stroke-width="2"/><line x1="18" y1="49" x2="18" y2="55.5" stroke="#475569" stroke-width="2"/>',
HACK='<line x1="8" y1="19.6" x2="32" y2="54" stroke="#475569" stroke-width="2"/><line x1="10" y1="22.5" x2="23.5" y2="42" stroke="#64748b" stroke-width="4" stroke-linecap="round"/><rect x="31" y="54" width="17" height="2.2" rx="1" fill="#64748b"/>',
LPD='<line x1="34" y1="55.5" x2="58" y2="33.8" stroke="#475569" stroke-width="2.4"/><line x1="24.3" y1="49" x2="8.7" y2="40" stroke="#475569" stroke-width="4.2" stroke-linecap="round"/><line x1="24" y1="49" x2="24" y2="55.5" stroke="#475569" stroke-width="2"/><rect x="20" y="48.6" width="10" height="2.6" rx="1.3" fill="#475569"/>',
CRD='<rect x="16" y="53.8" width="22" height="2.2" rx="1.1" fill="#475569"/>',
HLD='<line x1="14" y1="3.5" x2="56" y2="3.5" stroke="#94a3b8" stroke-width="2.4" stroke-linecap="round"/><line x1="14" y1="3.5" x2="14" y2="55.5" stroke="#475569" stroke-width="2"/><line x1="56" y1="3.5" x2="56" y2="55.5" stroke="#475569" stroke-width="2"/>',
PECD='<rect x="20" y="45.8" width="17" height="3" rx="1.5" fill="#475569"/><line x1="23.5" y1="44" x2="23.5" y2="24" stroke="#475569" stroke-width="4" stroke-linecap="round"/><line x1="27" y1="48.8" x2="27" y2="55.5" stroke="#475569" stroke-width="2"/>',
BLK='<rect x="25" y="54" width="18" height="2.2" rx="1" fill="#64748b"/>';
const PAT={curl:[po([32,34],0,[175,178],ST,'W'),po([32,34],0,[175,15],ST,'W')],
ohp:[po([32,34],0,[130,0],ST,'W'),po([32,34],0,[8,8],ST,'W')],
tri:[po([32,34],0,[178,92],ST,'W'),po([32,34],0,[178,178],ST,'W')],
raise:[po([32,34],0,[178,178],ST,'W'),po([32,34],0,[100,100],ST,'W')],
squat:[po([32,34],0,[100,100],ST,'S'),po([26,42],35,[100,100],[100,190],'S')],
hinge:[po([32,34],0,[178,178],ST,'W'),po([26,34.5],72,[180,180],[170,185],'W')],
row:[po([28,34.5],68,[180,180],[170,185],'W'),po([28,34.5],68,[245,190],[170,185],'W')],
press:[po([18,44],90,[165,0],[285,180],'W'),po([18,44],90,[0,0],[285,180],'W')],
pull:[po([32,40],0,[3,3],[100,185],'W'),po([32,40],0,[165,15],[100,185],'W')],
legx:[po([24,40],-8,[150,170],[95,185],'A'),po([24,40],-8,[150,170],[95,95],'A')],
legc:[po([24,40],-8,[150,170],[95,100],'A'),po([24,40],-8,[150,170],[95,185],'A')],
thrust:[po([26.5,50],296,[116,116],[58,168],'H'),po([27.5,44],270,[90,90],[90,180],'H')],
hack:[po([25,37],-35,[160,160],[148,148],'S'),po([29.8,44],-35,[160,160],[95,204],'S')],
legpress:[po([26,46],-60,[110,100],[55,60],0,{pl:48,ft:-42}),po([26,46],-60,[110,100],[8,149],0,{pl:48,ft:-42})],
crunch:[po([30,42],10,null,[180,270],0,{hand:[36.5,20],hs:-1,ft:270}),po([30,42],95,null,[180,270],0,{hand:[54,39.5],hs:-1,ft:270})],
lraise:[po([32,33.5],0,null,[180,180],0,{hand:[32,3.5]}),po([32,33.5],0,null,[88,90],0,{hand:[32,3.5]})],
pec:[po([28,44],0,[215,60],[95,185],'W'),po([28,44],0,[95,95],[95,185],'W')],
calf:[po([32,34],0,[175,175],ST,0,{ft:90}),po([32,30.5],0,[175,175],ST,0,{ft:150})]};
const META={curl:['arm',{}],ohp:['sh',{}],tri:['arm',{hd:1,bar:0,cab:[30,4]}],raise:['sh',{}],squat:['quad',{d:RACK}],hinge:['glute',{}],row:['back',{}],press:['chest',{d:BN2}],pull:['back',{hd:1,bar:0,cab:[36,3]}],legx:['quad',{d:SEAT}],legc:['quad',{d:SEAT}],calf:['calf',{d:BLK}],hack:['quad',{d:HACK}],pec:['chest',{d:PECD}],legpress:['quad',{d:LPD}],crunch:['abs',{d:CRD,cab:[40,2],hd:1}],lraise:['abs',{d:HLD}],thrust:['glute',{d:BN3}]};
Object.entries(META).forEach(([k,[m,x]])=>PAT[k].forEach(f=>Object.assign(f,{m},x)));
const ik=(S,T,s)=>{const v=[T[0]-S[0],T[1]-S[1]],l=Math.min(Math.hypot(v[0],v[1]),15.9),a1=(Math.atan2(v[0],-v[1])+s*Math.acos(l/16))*180/Math.PI,E=ad(S,dr(a1,8));return[a1,Math.atan2(T[0]-E[0],-(T[1]-E[1]))*180/Math.PI]};
function fig(p){const H=p.h,S=ad(H,dr(p.t,14)),Hd=ad(S,dr(p.t,7)),ar=p.hand?ik(S,p.hand,p.hs||1):p.a,E=ad(S,dr(ar[0],8)),W=ad(E,dr(ar[1],8)),K=ad(H,dr(p.l[0],10)),Ak=ad(K,dr(p.l[1],10)),F=ad(Ak,dr(p.ft||90,4.5)),Pp=p.pl?ad(Ak,dr(p.pl,3.5)):0,
f=q=>q.map(v=>v.toFixed(1)).join(','),L=(c,w,...q)=>`<polyline points="${q.map(f).join(' ')}" fill="none" stroke="${c}" stroke-width="${w}"/>`,
C=(P,r,fl,x)=>`<circle cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="${r}" fill="${fl}" ${x||''}/>`,mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],
M={arm:mid(S,E),chest:ad(H,dr(p.t,11)),back:ad(H,dr(p.t,8)),sh:S,quad:mid(H,K),calf:mid(K,Ak),glute:H,abs:ad(H,dr(p.t,5))}[p.m],B={W,S,A:Ak,H}[p.bar],lim=(c)=>L(c,2.8,S,E,W)+L(c,3,H,K,Ak)+L(c==='#e2e8f0'?'#f8fafc':'#94a3b8',3.6,Ak,F),
eye=p.t>80&&p.t<100?'':C(ad(Hd,dr(p.t+75,1.9)),.7,'#e2e8f0');
return`${p.d||''}<g transform="translate(-2.2,.8)" opacity=".5" stroke-linecap="round" stroke-linejoin="round">${lim('#94a3b8')}</g><g stroke-linecap="round" stroke-linejoin="round">${L('#94a3b8',5.2,H,S)}${L('#e2e8f0',3,H,S)}${lim('#e2e8f0')}${M?C(M,4.6,'#ff4b4b','opacity=".4"'):''}${C(E,1.3,'#64748b')}${C(K,1.3,'#64748b')}${C(W,2,'#fcd34d')}${C(Hd,3.4,'#111827','stroke="#e2e8f0" stroke-width="1.6"')}${eye}</g>${p.cab?C(p.cab,2.2,'#111827','stroke="#94a3b8" stroke-width="1"')+L('#64748b',.8,p.cab,W):''}${p.pl?L('#64748b',3.4,ad(Pp,dr(p.pl-90,9)),ad(Pp,dr(p.pl+90,9)))+C(ad(Pp,dr(p.pl+90,9)),4.2,'#ef4444')+C(ad(Pp,dr(p.pl+90,9)),1.8,'#7f1d1d'):''}${p.hd?L('#fca5a5',2.4,[W[0]-3.5,W[1]],[W[0]+3.5,W[1]]):''}${B?C(B,5,'#ef4444')+C(B,2.3,'#7f1d1d')+C(B,.8,'#fca5a5'):''}`}
const FRONT={fpec:[{a:[90,0],sit:1,pad:1,m:'chest'},{a:[215,0],sit:1,pad:1,m:'chest'}],
frpec:[{a:[215,0],sit:1,pad:1,m:'sh'},{a:[90,0],sit:1,pad:1,m:'sh'}],
fcfly:[{a:[105,80],cab:[[6,4],[58,4]],m:'chest'},{a:[200,340],cab:[[6,4],[58,4]],m:'chest'}],
flat:[{a:[175,175],db:1,m:'sh'},{a:[95,95],db:1,m:'sh'}],
fclat:[{a:[175,175],cab:[[20,54],[44,54]],m:'sh'},{a:[95,95],cab:[[20,54],[44,54]],m:'sh'}],
ffpull:[{a:[190,330],cab:[[32,3]],m:'sh'},{a:[75,330],cab:[[32,3]],m:'sh'}]};
function ffig(p){const hy=p.sit?42.5:35.5,sy=hy-13.5,SL=[26.5,sy],SR=[37.5,sy],f=q=>q.map(v=>v.toFixed(1)).join(','),L=(c,w,...q)=>`<polyline points="${q.map(f).join(' ')}" fill="none" stroke="${c}" stroke-width="${w}"/>`,C=(P,r,fl,x)=>`<circle cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="${r}" fill="${fl}" ${x||''}/>`,
arm=(S,sg)=>{const E=ad(S,dr(sg*p.a[0],8)),W=ad(E,dr(sg*p.a[1],8));return[E,W]},[EL,WL]=arm(SL,-1),[ER,WR]=arm(SR,1),
leg=sg=>{const hip=[32+sg*2.5,hy],K=p.sit?[32+sg*6,hy+2]:ad(hip,dr(180+sg*3,10)),A=p.sit?[32+sg*6,hy+13]:ad(K,dr(180+sg*3,10));return L('#e2e8f0',3,hip,K,A)+L('#f8fafc',3.6,A,[A[0]+sg*4.5,A[1]])},
sd=p.sit?`<rect x="20" y="${hy+1}" width="24" height="3" rx="1.5" fill="#475569"/><rect x="27" y="${sy-4}" width="10" height="${hy-sy+4}" rx="3" fill="#475569"/><line x1="32" y1="${hy+4}" x2="32" y2="55.5" stroke="#475569" stroke-width="2"/>`:'',
lm=(S,E,W)=>L('#e2e8f0',2.8,S,E,W)+C(E,1.3,'#64748b')+(p.pad?L('#ef4444',4.4,E,W):'')+(p.db?`<rect x="${(W[0]-4).toFixed(1)}" y="${(W[1]-1.7).toFixed(1)}" width="8" height="3.4" rx="1.3" fill="#ef4444"/>`:'')+C(W,p.db?0:2,'#fcd34d'),
mu=p.m==='chest'?C([32,sy+4.5],5,'#ff4b4b','opacity=".4"'):C(SL,3.8,'#ff4b4b','opacity=".5"')+C(SR,3.8,'#ff4b4b','opacity=".5"'),
cb=p.cab?(p.cab.length>1?L('#64748b',.8,p.cab[0],WL)+L('#64748b',.8,p.cab[1],WR):L('#64748b',.8,p.cab[0],WL)+L('#64748b',.8,p.cab[0],WR))+p.cab.map(q=>C(q,2.2,'#111827','stroke="#94a3b8" stroke-width="1"')).join(''):'';
return`${sd}<g stroke-linecap="round" stroke-linejoin="round">${leg(-1)}${leg(1)}<rect x="27" y="${sy-1.5}" width="10" height="${hy-sy+3}" rx="3.5" fill="#cbd5e1"/>${L('#e2e8f0',3,SL,SR)}${mu}${lm(SL,EL,WL)}${lm(SR,ER,WR)}${C([32,sy-6.5],3.6,'#111827','stroke="#e2e8f0" stroke-width="1.6"')}${C([30.8,sy-6.8],.7,'#e2e8f0')}${C([33.2,sy-6.8],.7,'#e2e8f0')}</g>${cb}${p.cab?C(WL,1.8,'#fca5a5')+C(WR,1.8,'#fca5a5'):''}`}
function picKey(n){n=n.toLowerCase();return/cable lateral/.test(n)?'fclat':/lateral raise/.test(n)?'flat':/face pull/.test(n)?'ffpull':/reverse pec/.test(n)?'frpec':/cable fly/.test(n)?'fcfly':/pec deck|fly/.test(n)?'fpec':/hip thrust/.test(n)?'thrust':/leg press/.test(n)?'legpress':/crunch/.test(n)?'crunch':/leg raise/.test(n)?'lraise':/hack squat/.test(n)?'hack':/leg curl/.test(n)?'legc':/leg extension/.test(n)?'legx':/calf/.test(n)?'calf':/pulldown|pull-up/.test(n)?'pull':/overhead press|shoulder press/.test(n)?'ohp':/triceps|skull|dip/.test(n)?'tri':/lateral raise|reverse pec|face pull/.test(n)?'raise':/pec deck|fly/.test(n)?'pec':/curl/.test(n)?'curl':/squat|leg press|lunge/.test(n)?'squat':/deadlift|good morning|pull-through/.test(n)?'hinge':/row/.test(n)?'row':/press|fly|pec deck/.test(n)?'press':''}
const FB={Chest:'press',Back:'row',Shoulders:'ohp',Quads:'squat',Hamstrings:'hinge',Glutes:'thrust',Calves:'calf',Triceps:'tri',Biceps:'curl',Abs:'crunch'};
function pic(e){const k=picKey(e.name)||FB[e.mg];if(!k)return'';const f=FRONT[k]?FRONT[k].map(ffig):PAT[k].map(fig);return`<div class="pic" style="flex:0 0 80px"><svg viewBox="0 0 64 60"><rect x="0" y="55.5" width="64" height="4.5" fill="#1e293b"/><line x1="0" y1="55.5" x2="64" y2="55.5" stroke="#334155"/><g class="fa">${f[0]}</g><g class="fb">${f[1]}</g></svg></div>`}
function vToday(){const s=curS(),it=s.items[cur.i]||s.items[0],i=s.items.indexOf(it),e=S.ex[it.ex],rc=rec(it.ex,it,s.k),st=stats(it.ex,s.k);const tot=s.items.reduce((a,x)=>a+x.n,0),dn=s.items.reduce((a,x)=>a+x.sets.filter(y=>y.done&&!y.wu).length,0);
 const last=st?st.h[st.h.length-1]:null;let c=0;
 const rows=it.sets.map((x,j)=>{if(!x.wu)c++;let pj=-1;for(let q=j-1;q>=0;q--)if(!!it.sets[q].wu===!!x.wu){pj=q;break}return`<div class="row ${x.done?'ok':''}"><button class="lb ${x.wu?'wu':''}" data-a="wu" data-j="${j}">${x.wu?'W':c}</button><input inputmode="decimal" data-f="w" data-j="${j}" value="${wv(x.w,e)}" placeholder="${rc.w?wv(rc.w,e):U()}"><input inputmode="numeric" data-f="r" data-j="${j}" value="${x.r}" placeholder="${it.lo}-${it.hi}"><input inputmode="decimal" data-f="rpe" data-j="${j}" value="${x.rpe}" placeholder="–"><button class="ck" data-a="chk" data-j="${j}">✓</button>${pj>=0?`<button class="cp" title="Copy previous" aria-label="Copy previous" data-a="cp" data-j="${j}" data-k="${pj}">⧉</button>`:'<span></span>'}<small class="e" id="e${j}">${eText(x,e)}</small></div>`}).join('');
 return`<div class="flex"><button data-a="day" data-n="-1">‹</button><div style="flex:3;text-align:center"><b>Week ${cur.w} · ${DAYS[cur.d]}</b>${s.fin?' <span class="fin-b">✓ finished</span>':''}<br><small>${dnm(cur.d)} · ${s.date}</small></div><button data-a="day" data-n="1">›</button></div>
 <div class="pb" style="margin:8px 0"><i style="width:${dn/tot*100}%"></i></div><small>${dn}/${tot} working sets · ${nDone()}/${S.weeks*5} workouts done</small>
 <div class="dots" style="margin:8px 0">${s.items.map((x,q)=>`<button class="${q===i?'on':''} ${x.sets.filter(y=>!y.wu).every(y=>y.done)?'dn':''}" data-a="ex" data-i="${q}">${q+1}</button>`).join('')}</div>
 <div class="card"><div class="flex"><div style="flex:3"><h2>${esc(e.name)}</h2><small>${e.mg} · ${eqL(e)} <span class="tag">${it.n}×${it.lo}–${it.hi}</span></small></div>${pic(e)}<button data-a="sw">Swap</button></div>
 <p class="m">Last: ${last?last.sets.map(x=>fw(x.w)+'×'+x.r).join(' · ')+' ('+last.date+(PM(e)?', total incl. bar':'')+')':'—'}</p>
 <p>${rc.w?`<b style="font-size:22px">Today: ${fw(rc.w)} ${U()}${PM(e)?' total':''}</b><br>${PM(e)?`<small>Enter ${wv(rc.w,e)} ${U()} (plates only)</small><br>`:''}${plateTxt(rc.w,e)?`<b style="color:var(--ac)">${plateTxt(rc.w,e)}</b><br><small>${plateSub(rc.w,e)}</small><br>`:''}`:''}<small>${rc.t}</small></p>
 ${st?`<small>Best est. 1RM ${fw(st.best.toFixed(1))} ${U()} · prev PR ${st.prev?fw(st.prev.toFixed(1)):'—'} · vs prev ${pct(st.best,st.prev)} · vs baseline ${pct(st.best,st.first)}</small>`:''}</div>
 <div class="card tbl">${PM(e)?`<p class="cap" style="margin:0 0 8px">Barbell: enter the plate weight only (both sides together). The ${fw(barLb(e))} ${U()} bar is added for you.</p>`:''}<div class="th"><span>SET</span><span>${PM(e)?'PLATES':'WEIGHT'} (${U()})</span><span>REPS</span><span>RPE</span><span>STATUS</span><span>COPY PREV</span></div>${rows}</div><div class="tb3"><button data-a="addw">+ Warm-up</button><button data-a="adds">+ Set</button><button data-a="dels">− Set</button></div>
 <p class="cap">ⓘ Est. 1RM = Epley (w×(1+reps/30)); 1 rep = actual weight; above 10 reps it is unreliable. Never attempt a true max from an estimate alone.</p>
 <div class="flex" style="margin-top:10px"><button data-a="ex" data-i="${Math.max(0,i-1)}">‹ Prev</button><button class="${i<s.items.length-1?'':'pri'}" data-a="${i<s.items.length-1?'ex':'fin'}" data-i="${i+1}">${i<s.items.length-1?'Next ›':'Finish workout'}</button></div>`}
const eText=(x,e)=>{const v=e1(x.w,x.r),pt=e?plateTxt(x.w,e):'';return (pt?pt+' · '+plateSub(x.w,e)+(v?' · ':''):'')+(v?(+x.r===1?`Actual 1RM ${fw(x.w)} ${U()}`:`Est. 1RM ${fw(Math.round(v*10)/10)} ${U()}${x.r>10?' ⚠ low reliability':''}`):'')};
function vProg(){const now=iso(new Date());let g=`<div class="card"><b>${nDone()} / ${S.weeks*5}</b> workouts completed · cycle ${S.cyc}</div>`;
 for(let w=1;w<=S.weeks;w++){g+=`<div class="wk"><b>W${w}</b>`+DAYS.map((n,d)=>{const s=S.sessions[`${S.cyc}-${w}-${d}`],dt=iso(dateOf(w,d)),cl=s&&s.fin?'fin':s&&touched(s)?'part':dt<now?'miss':'';return`<button class="${cl} ${dt===now?'td':''}" data-a="open" data-w="${w}" data-d="${d}">${n}<br>${dt.slice(5)}</button>`}).join('')+'</div>'}
 const pd_=S.plan[ED];
 return`<h2>Program</h2>${g}<div class="flex"><button data-a="addwk">+ Week</button><button class="bad" data-a="restart">Restart</button></div><small>Green = finished, amber = partial, gray dashed = missed. Restart begins a new cycle; history is kept.</small>
 <div class="card"><label class="m">Program start date<input type="date" id="st" value="${S.start}"></label></div>
 <h3>Edit routine (applies to all future weeks)</h3><div class="flex" style="margin-bottom:8px"><b style="flex:3">${esc(dnm(ED))}</b><button data-a="renday">Rename day</button></div><div class="dots">${DAYS.map((n,d)=>`<button class="${d===ED?'on':''}" data-a="eday" data-d="${d}">${n}</button>`).join('')}</div>
 ${pd_.map((p,q)=>`<div class="card"><b>${esc(S.ex[p.ex].name)}</b><div class="flex" style="margin:6px 0"><input data-pf="sets" data-q="${q}" value="${p.sets}" inputmode="numeric"><input data-pf="lo" data-q="${q}" value="${p.lo}" inputmode="numeric"><input data-pf="hi" data-q="${q}" value="${p.hi}" inputmode="numeric"></div><small>sets · min reps · max reps</small><div class="flex"><button data-a="psw" data-q="${q}">Replace</button><button class="bad" data-a="prm" data-q="${q}">Remove</button></div></div>`).join('')}<button class="pri" data-a="padd" style="width:100%">+ Add exercise</button>`}
const lib=(q,a)=>Object.values(S.ex).filter(e=>(e.name+' '+e.mg).toLowerCase().includes(q.toLowerCase())).sort((x,y)=>x.name.localeCompare(y.name)).map(e=>`<button class="li" data-a="${a}" data-id="${e.id}"><b>${esc(e.name)}</b><small>${e.mg} · ${eqL(e)} · +${fw(e.inc)} ${U()} · rest ${e.rest}s</small></button>`).join('');
const vEx=()=>`<h2>Exercises</h2><div class="flex"><input id="q" placeholder="Search…" style="text-align:left;font-size:17px"><button class="pri" data-a="newex" style="flex:0 0 auto">+ Custom</button></div><div id="ll">${lib('','edex')}</div>`;
function allStats(){return Object.values(S.ex).filter(e=>P.mg==='All'||e.mg===P.mg).map(e=>({e,s:stats(e.id)})).filter(x=>x.s)}
const line=(p,t)=>{if(p.length<2)return'<p class="m">Need 2+ sessions for a trend.</p>';const W=340,H=130,v=p.map(x=>x.v),lo=Math.min(...v),hi=Math.max(...v),sp=hi-lo||1,c=p.map((x,i)=>[10+i*(W-20)/(p.length-1),H-18-(x.v-lo)/sp*(H-36)]);return`<svg viewBox="0 0 ${W} ${H}"><polyline points="${c.map(q=>q.join(',')).join(' ')}" fill="none" stroke="#ff4b4b" stroke-width="3"/>${c.map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="3.5" fill="#ff4b4b"/>`).join('')}<text x="4" y="12" fill="#8a96a3" font-size="11">${t} high ${fw(hi.toFixed(1))}</text><text x="4" y="${H-2}" fill="#8a96a3" font-size="11">low ${fw(lo.toFixed(1))}</text></svg>`};
function vProgress(){const co=Date.now()-P.rng*864e5*7,L=allStats().map(x=>({...x,s:{...x.s,pts:x.s.pts.filter(p=>!P.rng||pd(p.d)>=co)}})).filter(x=>x.s.pts.length);const sel=P.ex&&L.find(x=>x.e.id===P.ex)||L[0];
 const wk={};L.forEach(x=>x.s.pts.forEach(p=>{const k=iso(addD(pd(p.d),-((pd(p.d).getDay()+6)%7)));wk[k]=(wk[k]||0)+p.vol}));const ks=Object.keys(wk).sort().slice(-12),mx=Math.max(1,...ks.map(k=>wk[k]));
 const fin=Object.values(S.sessions).filter(s=>s.fin).length,started=Object.values(S.sessions).filter(touched).length;
 return`<h2>Progress</h2><div class="flex"><select data-p="mg"><option>All</option>${MGS.map(m=>`<option ${m===P.mg?'selected':''}>${m}</option>`).join('')}</select><select data-p="rng">${[[0,'All time'],[4,'4 weeks'],[12,'12 weeks']].map(([v,t])=>`<option value="${v}" ${v==P.rng?'selected':''}>${t}</option>`).join('')}</select></div>
 <div class="card"><small>Workouts finished ${fin} · started ${started} · consistency this cycle ${nDone()}/${S.weeks*5}</small></div>
 ${sel?`<div class="card"><select data-p="ex" style="width:100%">${L.map(x=>`<option value="${x.e.id}" ${x.e.id===sel.e.id?'selected':''}>${esc(x.e.name)}</option>`).join('')}</select><h3>Estimated 1RM per session</h3>${line(sel.s.pts,'est.')}<small>Estimates, not lifted weights. Higher-rep estimates are less reliable.</small></div>`:'<div class="card m">No completed working sets yet. Log a workout on the Today tab.</div>'}
 <div class="card"><h3>Weekly volume (${U()}×reps)</h3>${ks.length?`<svg viewBox="0 0 340 110">${ks.map((k,i)=>{const h=wk[k]/mx*85,w=300/ks.length;return`<rect x="${10+i*w}" y="${95-h}" width="${w-4}" height="${h}" rx="3" fill="#ff4b4b"/><text x="${10+i*w}" y="108" fill="#8a96a3" font-size="9">${k.slice(5)}</text>`}).join('')}</svg><small>Peak week ${fw(Math.round(mx))} ${U()}</small>`:'<p class="m">No volume yet.</p>'}</div>
 <div class="card"><table><tr><th>Exercise</th><th>Best est.</th><th>Prev PR</th><th>Δ prev</th><th>Δ base</th><th>Max lift</th></tr>${L.map(x=>`<tr><td>${esc(x.e.name)}${x.e.eq==='DB'?'<small> (per DB)</small>':''}</td><td>${fw(x.s.best.toFixed(1))}</td><td>${x.s.prev?fw(x.s.prev.toFixed(1)):'—'}</td><td>${pct(x.s.best,x.s.prev)}</td><td>${pct(x.s.best,x.s.first)}</td><td>${fw(x.s.maxW)}</td></tr>`).join('')}</table><small>Best est. = estimated 1RM; Max lift = actual heaviest weight. Total volume ${fw(Math.round(L.reduce((a,x)=>a+x.s.vol,0)))} ${U()}.</small></div>`}
const vSet=()=>`<h2>Settings</h2><details class="card"><summary><b>⚠ Keep your data safe</b></summary>${safeHTML}</details><div class="card"><h3>Person: ${esc(PL.find(p=>p.id===PK).name)}</h3><div class="flex"><button data-a="renp">Rename</button><button class="bad" data-a="delp">Delete</button></div><small>Each person has their own program, exercises, units and history. Backups export the selected person only.</small></div><div class="card"><label class="m">Units<select data-p="unit" style="width:100%"><option value="lb" ${S.unit==='lb'?'selected':''}>Pounds (lb)</option><option value="kg" ${S.unit==='kg'?'selected':''}>Kilograms (kg)</option></select></label><small>Data is stored in lb internally; kg is display/input conversion.</small></div>
 <div class="card"><label class="m">Program start date<input type="date" id="st" value="${S.start}"></label><small>Week 1 starts on the Monday of this date's week. Until then, Today shows Week 1 Monday. Changing it keeps any workouts you've already logged.</small></div>
 <button class="pri" data-a="help" style="width:100%">How to use StrengthTrack</button>
 <div class="card"><h3>Share</h3><div class="flex"><button class="pri" data-a="shareLink">Share app link</button><button data-a="shareFile">Share my program</button></div><small>The link opens the app for anyone (works best from a self-hosted copy). "Share my program" sends this person's program and history as a backup file; the receiver restores it in Settings → Restore.</small></div>
 <div class="card"><h3>Plates (${U()})</h3><label class="m">Barbell entry<select data-p="pm" style="width:100%"><option value="1" ${S.pm!==0?'selected':''}>Plates only (bar added automatically)</option><option value="0" ${S.pm===0?'selected':''}>Total weight on the bar</option></select></label><label class="m">Default bar weight<input data-s="bar" inputmode="decimal" value="${BAR()}"></label><label class="m">Plates per side, comma separated<input data-s="pl" value="${PLS().join(', ')}" style="text-align:left;font-size:18px"></label><small>Barbell exercises show what to load on each side. Set a different bar (e.g. EZ-bar) per exercise on the Exercises tab.</small></div>
 <div class="card"><h3>Backup</h3><small>Last backup: ${S.lb?new Date(S.lb).toLocaleDateString():'never'}</small><label class="m">Offer a backup after finishing a workout<select data-p="bp" style="width:100%"><option value="always" ${(S.bp||'always')==='always'?'selected':''}>Every workout</option><option value="week" ${S.bp==='week'?'selected':''}>Once a week</option><option value="off" ${S.bp==='off'?'selected':''}>Never</option></select></label><div class="flex"><button class="pri" data-a="xj">Export JSON</button><button data-a="xc">Export CSV</button></div><p><label class="m">Restore from JSON backup<input type="file" id="imp" accept=".json,application/json" style="min-height:0;padding:10px"></label></p><small>Your data lives only in this browser's IndexedDB on this device. Export a backup weekly and before iOS updates. To move devices: export, send the file (AirDrop/Files), import on the other device. Restoring first downloads a backup of what is currently there.</small></div>
 <div class="card"><small>Edit rest time, increments and rep targets per exercise on the Exercises tab. Progression: double progression, +increment only after all sets reach the top of the range with RPE ≤ 9 and a consistent previous session.</small></div>`;
const pbar=()=>`<div class="top"><div class="chips">${PL.map(p=>`<button class="chip ${p.id===PK?'on':''}" data-a="prof" data-id="${p.id}">${esc(p.name)}</button>`).join('')}</div><button class="ib" title="Add person" data-a="newp">+</button><button class="ib" title="Share" data-a="shareLink">↗</button><button class="ib" title="Help" data-a="help">?</button></div>`;
const safeHTML=`<p class="m">Your workouts are stored only on this device, in your browser. There is no account, cloud copy or sync, so lost data cannot be recovered unless you saved a backup. The app is provided as-is, without any guarantee against data loss.</p>
<p><b>1. Install it.</b> Open the link in Safari, tap Share, then Add to Home Screen, and always open it from that icon. The Home Screen app and a Safari tab keep separate data, so switching between them can look like your workouts vanished.</p>
<p><b>2. Never clear it by accident.</b> Do not use Settings → Safari → Clear History and Website Data, and do not delete the Home Screen app, until you have saved a backup. Private browsing keeps nothing.</p>
<p><b>3. Back up often.</b> After you tap Finish workout, the app offers to save a backup: tap Save backup, then Save to Files (ideally iCloud Drive). You can also do it anytime from Settings → Share my program (or Export JSON). Change how often it asks under Settings → Backup. Do it after your last workout of the week and before any phone or iOS update.</p>
<p><b>4. Keep the same link.</b> Your data belongs to that exact web address. If the address changes, the app opens empty until you restore a backup.</p>
<p><b>5. To restore or move phones:</b> Settings → Restore from JSON backup, and choose your saved file. To switch phones, export on the old one, send the file, and restore it on the new one.</p>
<p class="m">Estimates and recommendations are general guidance, not medical or coaching advice. Train within your limits.</p>`;
const warnHTML=()=>`<div><h2>Before you start</h2><div class="card">${safeHTML}</div><button class="pri" data-a="ack" style="width:100%;margin:12px 0 24px">I understand</button></div>`;
const helpHTML=()=>`<div><button data-a="x">Close</button><h2>How to use</h2>
<h3>Quick start</h3><p class="m">1) Settings → set your start date. 2) Today → tap an exercise's weight and reps, then ✓ after each set. 3) Rest timer starts automatically. 4) Tap Finish workout at the end. Everything saves instantly on your phone.</p>
<h3>What the short words mean</h3>
<p><b>Sets × reps (e.g. 3×4–6):</b> 3 working sets of 4 to 6 reps each.</p>
<p><b>Working set:</b> a hard set that counts. <b>W = warm-up set:</b> lighter set; tap the set number to toggle W. Warm-ups never count toward progression, records or volume.</p>
<p><b>RPE (Rate of Perceived Exertion):</b> how hard a set felt, from 1 to 10. Enter it right after the set. It is optional, so leave it blank if you are unsure.<br><b>10</b> = max effort, nothing left, you could not do another rep<br><b>9</b> = 1 more rep possible<br><b>8</b> = 2 more reps<br><b>7</b> = 3 more reps<br><b>6 or below</b> = easy, 4 or more reps left<br>Aim for about 7 to 9 on most working sets, and use 10 only when you truly gave everything. It does not need to be exact; being off by one is fine. If you enter above 9, the app holds your weight instead of recommending an increase. Use the same standard every session so the comparison is fair.</p>
<p><b>RIR (Reps In Reserve):</b> how many more reps you could have done. RPE = 10 − RIR (2 RIR = RPE 8). The box is labeled RPE, so enter 10 − RIR.</p>
<p><b>1RM (One-Rep Max):</b> the heaviest weight you can lift once. <b>Est. 1RM:</b> a calculated guess using the Epley formula, weight × (1 + reps ÷ 30). One rep shows your actual weight. Above 10 reps it is less reliable (⚠). Never try a true max based only on this number.</p>
<p><b>PR (Personal Record):</b> your best est. 1RM for that exercise. <b>Prev PR</b> = the best you had before your current best. <b>Δ prev</b> = % change from Prev PR. <b>Δ base</b> = % change from your very first logged session. <b>Max lift</b> = the heaviest weight actually lifted (not estimated).</p>
<p><b>Volume:</b> weight × reps added up across working sets.</p>
<p><b>Equipment:</b> BB = Barbell, DB = Dumbbell, CB = Cable, MC = Machine, BW = Bodyweight.</p>
<p><b>per DB:</b> dumbbell weights mean ONE dumbbell, not the pair. <b>Per side:</b> plates to put on each end of the barbell (bar not included). The line under it shows bar weight + total plate weight = total weight. For barbell lifts you enter only the plate weight (both sides together) and the bar is added automatically; change this in Settings → Barbell entry.</p>
<p><b>Double progression:</b> keep the same weight and add reps each session; once every working set reaches the top of the rep range (and effort is OK), add the exercise's weight increment. The reason is shown on each exercise. Tap the weight box to override.</p>
<p><b>lb / kg:</b> change in Settings. Data is stored in lb and converted for display.</p>
<h3>Today tab</h3>
<p><b>‹ ›</b> move to the previous or next workout day. The bar shows working sets done. <b>Numbered buttons</b> jump between exercises (outlined = finished). <b>Swap</b> replaces the exercise, for this workout only or all future weeks; each exercise keeps its own history. <b>Last</b> = your previous results. <b>Today</b> = recommended weight, with its plates and the reason.</p>
<p>Each set is one row of the table: <b>SET</b> (tap the number to toggle a warm-up, shown as W) · <b>WEIGHT</b> (<b>PLATES</b> for barbell lifts) · <b>REPS</b> · <b>RPE</b> · <b>STATUS</b>, where ✓ marks the set complete and starts the rest timer. <b>COPY PREV</b> (⧉) copies the weight and reps from the set above into that set. It is not shown on the first set. The small grey line under a set shows plates and est. 1RM. The small line shows est. 1RM and plates. <b>+ Warm-up / + Set / − Set</b> add or remove sets (only an empty last set can be removed). <b>Prev / Next</b> change exercise; <b>Finish workout</b> marks the day complete.</p>
<p><b>Rest timer</b> (bar above the menu): <b>⏯</b> pause/resume, <b>↺</b> restart, <b>Skip</b> dismiss. Rest length is set per exercise.</p>
<h3>Program tab</h3>
<p>The 12-week calendar: green = finished, amber = partly done, gray dashed = missed, white outline = today. Tap a day to open it. <b>+ Week</b> adds a week. <b>Restart</b> begins a new cycle and keeps history. <b>Start date</b> sets when Week 1 begins. <b>Edit routine</b>: pick a day, change sets/min/max reps, <b>Replace</b> or <b>Remove</b> exercises, <b>+ Add exercise</b>, or <b>Rename day</b>.</p>
<h3>Exercises tab</h3>
<p>Search the library (47 built in). Tap one to edit its name, muscle group, equipment, weight increment, rest seconds, rep range and bar weight. <b>+ Custom</b> adds your own. Renaming never erases history.</p>
<h3>Progress tab</h3>
<p>Filter by muscle group and time range. The line chart shows est. 1RM per session for the chosen exercise (estimates, not lifted weights). The bar chart shows weekly volume. The table lists best est. 1RM, Prev PR, the two % changes and max lift for each exercise.</p>
<h3>Settings tab</h3>
<p><b>Units</b>, <b>start date</b>, <b>person</b> (rename/delete), <b>Share</b>, <b>plates</b> (bar weight and plates your gym has), <b>Backup</b> (Export JSON/CSV, Restore). Restoring downloads a backup of your current data first.</p>
<h3>Person tabs (top)</h3>
<p>Tap a name to switch, tap the selected name again to rename, <b>+</b> adds a person, <b>↗</b> shares, <b>?</b> opens this guide. Each person has their own program and history.</p>
<h3>Protect your data (important)</h3>${safeHTML}
<button class="pri" data-a="x" style="width:100%;margin:12px 0 24px">Close</button></div>`;
function r(){const v={today:vToday,program:vProg,exercises:vEx,progress:vProgress,settings:vSet}[tab];$('#m').innerHTML=pbar()+v();
 $('#nv').innerHTML=[['today','Today'],['program','Program'],['exercises','Exercises'],['progress','Progress'],['settings','Settings']].map(([t,n])=>`<button class="${t===tab?'on':''}" data-a="tab" data-t="${t}">${n}</button>`).join('');
 const md=$('#md');if(M){md.hidden=false;md.innerHTML=M.t==='pick'?`<div><button data-a="x">Close</button><h3>Choose exercise</h3><input id="q2" placeholder="Search…" style="text-align:left;font-size:17px"><div id="ll">${lib('','pickex')}</div></div>`:M.t==='help'?helpHTML():M.t==='warn'?warnHTML():edForm()}else{md.hidden=true;md.innerHTML=''}tick()}
function edForm(){const e=S.ex[M.id]||{name:'',mg:'Chest',eq:'BB',inc:5,rest:120,lo:8,hi:12},f=(k,l,t='number')=>`<label class="m">${l}<input id="f-${k}" type="${t==='number'?'text':t}" ${t==='number'?'inputmode="decimal"':''} value="${esc(e[k])}"></label>`;
 return`<div><h3>${M.id?'Edit':'New'} exercise</h3>${f('name','Name','text')}<label class="m">Muscle group<select id="f-mg" style="width:100%">${MGS.map(m=>`<option ${m===e.mg?'selected':''}>${m}</option>`).join('')}</select></label><label class="m">Equipment<select id="f-eq" style="width:100%">${[['BB','Barbell'],['DB','Dumbbell'],['CB','Cable'],['MC','Machine'],['BW','Bodyweight']].map(([v,t])=>`<option value="${v}" ${v===e.eq?'selected':''}>${t}</option>`).join('')}</select></label>${f('inc','Weight increment (lb)')}${f('rest','Rest (seconds)')}${f('lo','Min reps')}${f('hi','Max reps')}<label class="m">Bar weight, ${U()} (barbell only; blank = default)<input id="f-bar" inputmode="decimal" value="${e.bar?fw(e.bar):''}"></label><div class="flex" style="margin-top:10px"><button data-a="x">Cancel</button><button class="pri" data-a="saveex">Save</button></div></div>`}
// ---- actions ----
function dl(n,t,m){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:m}));a.download=n;a.click()}
const xj=()=>{dl(`strengthtrack-${iso(new Date())}.json`,JSON.stringify(S),'application/json');S.lb=Date.now();save()};
function xc(){const o=['date,week,day,exercise_id,exercise,set,type,weight_lb,reps,rpe,completed,est_1rm_lb'];for(const s of Object.values(S.sessions))for(const it of s.items){let c=0;it.sets.forEach(x=>{if(!x.wu)c++;if(x.w!==''||x.r!=='')o.push([s.date,s.w,DAYS[s.d],it.ex,'"'+S.ex[it.ex].name+'"',x.wu?'W':c,x.wu?'warmup':'working',x.w,x.r,x.rpe,x.done?1:0,x.wu||!x.done?'':e1(x.w,x.r).toFixed(1)].join(','))})}dl(`strengthtrack-${iso(new Date())}.csv`,o.join('\n'),'text/csv')}
async function pick(id){const p=M;M=null;if(p.k==='plan'){const pl=S.plan[p.d];if(p.q==null)pl.push({ex:id,sets:S.ex[id].hi>12?2:3,lo:S.ex[id].lo,hi:S.ex[id].hi});else pl[p.q].ex=id;planChanged(p.d)}
 else{const s=curS(),it=s.items[cur.i];if(it.sets.some(x=>x.done||x.w!==''||x.r!==''))return toast('Clear logged sets first, or swap in next workout'),r();const a=await ask('Replace this exercise…',null,['Cancel','This workout only','All future weeks']);if(!a.i)return r();const perm=a.i===2;it.ex=id;it.lo=S.ex[id].lo;it.hi=S.ex[id].hi;if(perm){S.plan[cur.d][cur.i].ex=id;S.plan[cur.d][cur.i].lo=it.lo;S.plan[cur.d][cur.i].hi=it.hi;planChanged(cur.d)}}save();r()}
const A={auto:()=>{const s=curS(),it=s.items[cur.i],h=hist(it.ex,s.k),rc=rec(it.ex,it,s.k),ls=h.length?h[h.length-1].sets:[];let k=0,n=0;it.sets.forEach(x=>{if(x.wu||x.done)return;const p=ls.length?ls[Math.min(k,ls.length-1)]:null;k++;if(x.w===''&&x.r===''){if(p){x.w=p.w;x.r=p.r}else if(rc.w){x.w=rc.w;x.r=it.lo}else return;n++}});if(!n)return toast('No empty sets to fill');save();r()},ack:async()=>{await kvs('ack',1);M=null;r()},help:()=>{M={t:'help'};r()},shareLink:async()=>{const u=location.href.split('#')[0];try{if(navigator.share){await navigator.share({title:'StrengthTrack',text:'StrengthTrack: offline strength tracker',url:u});return}}catch(e){if(e.name==='AbortError')return}try{await navigator.clipboard.writeText(u);toast('Link copied')}catch(e){ask('Copy this link:',u,['Close'])}},
 shareFile:async()=>{const f=new File([JSON.stringify(S)],`strengthtrack-${iso(new Date())}.json`,{type:'application/json'});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'StrengthTrack backup'});S.lb=Date.now();save();toast('Backup shared ✔');r();return}}catch(e){if(e.name==='AbortError')return}xj()},
 renday:async()=>{const n=await askText('Workout name',dnm(ED));if(!n)return;S.dn=S.dn||{};S.dn[ED]=n;save();r()},prof:async D=>{if(D.id===PK)return A.renp();PK=D.id;await saveMeta();S=await load()||fresh();cur=curPos();M=null;r()},
 newp:async()=>{const n=await askText('Name for the new person?','');if(!n)return;const id='p'+Date.now().toString(36);PL.push({id,name:n});PK=id;await saveMeta();S=fresh();await save();cur=curPos();tab='today';r()},
 renp:async()=>{const p=PL.find(p=>p.id===PK),n=await askText('Rename',p.name);if(!n)return;p.name=n;await saveMeta();r()},
 delp:async()=>{if(PL.length<2)return toast('Keep at least one person');if(!await askYes('Delete this person and ALL their data? Export a backup first.','Delete'))return;const d=await db();d.transaction('kv','readwrite').objectStore('kv').delete('p:'+PK);PL=PL.filter(p=>p.id!==PK);PK=PL[0].id;await saveMeta();S=await load()||fresh();cur=curPos();r()},
 tab:D=>{tab=D.t;r()},x:()=>{M=null;r()},
 day:D=>{let n=(cur.w-1)*5+cur.d+ +D.n;n=Math.max(0,Math.min(S.weeks*5-1,n));cur={w:Math.floor(n/5)+1,d:n%5,i:0};r()},
 ex:D=>{cur.i=+D.i;r()},open:D=>{cur={w:+D.w,d:+D.d,i:0};tab='today';r()},
 chk:D=>{const s=curS(),it=s.items[cur.i],x=it.sets[D.j];if(x.done)x.done=0;else{if(x.w===''){const q=rec(it.ex,it,s.k);if(q.w)x.w=q.w}if(!(+x.w>0&&+x.r>=1))return toast('Enter weight and reps (≥1)');x.done=1;startT(x.wu?60:S.ex[it.ex].rest)}save();r()},
 cp:D=>{const it=curS().items[cur.i],x=it.sets[D.j],p=it.sets[D.k];if(!p||(p.w===''&&p.r===''))return toast('Fill in the previous set first');x.w=p.w;x.r=p.r;save();r()},
 wu:D=>{const x=curS().items[cur.i].sets[D.j];x.wu=x.wu?0:1;save();r()},
 addw:()=>{curS().items[cur.i].sets.unshift({w:'',r:'',rpe:'',wu:1,done:0});save();r()},
 adds:()=>{const it=curS().items[cur.i];it.sets.push({w:'',r:'',rpe:'',wu:0,done:0});save();r()},
 dels:()=>{const a=curS().items[cur.i].sets,x=a[a.length-1];if(x&&!x.done&&x.w===''&&x.r==='')a.pop();else toast('Only an empty last set can be removed');save();r()},
 fin:async()=>{const s=curS();s.fin=1;S.timer=null;save();toast('Workout saved ✔');r();const m=S.bp||'always';if(m==='always'||(m==='week'&&(!S.lb||Date.now()-S.lb>6048e5))){const a=await ask('Workout saved on this phone. Save a backup copy to your Files app now? You will tap "Save to Files" on the next screen.',null,['Not now','Save backup']);if(a.i===1)A.shareFile()}},
 sw:()=>{M={t:'pick',k:'s'};r()},pickex:D=>pick(D.id),
 psw:D=>{M={t:'pick',k:'plan',d:ED,q:+D.q};r()},padd:()=>{M={t:'pick',k:'plan',d:ED,q:null};r()},
 prm:async D=>{if(S.plan[ED].length>1&&await askYes('Remove from routine? Logged history is kept.','Remove')){S.plan[ED].splice(+D.q,1);planChanged(ED);save();r()}},
 eday:D=>{ED=+D.d;r()},addwk:()=>{S.weeks++;save();r()},
 restart:async()=>{if(await askYes('Start a new program cycle? Existing history is kept.','Restart')){S.cyc++;S.start=iso(new Date());cur=curPos();save();r()}},
 tp:()=>{const t=S.timer;if(!t)return;if(t.p){t.end=Date.now()+t.p;t.p=0}else t.p=Math.max(0,t.end-Date.now());save();tick()},
 tr:()=>{const t=S.timer;if(t){t.end=Date.now()+t.tot*1e3;t.p=0;t.fired=0;save()}},ts:()=>{S.timer=null;save();tick()},
 xj,xc,newex:()=>{M={t:'ed',id:''};r()},edex:D=>{M={t:'ed',id:D.id};r()},
 saveex:()=>{const g=k=>$('#f-'+k).value.trim(),n=g('name'),inc=+g('inc'),rest=+g('rest'),lo=+g('lo'),hi=+g('hi');if(!n||!(inc>=0)||!(rest>=0)||!(lo>=1)||!(hi>=lo))return toast('Check name, numbers and rep range');const id=M.id||'c-'+slug(n)+'-'+Date.now().toString(36);const bv=+g('bar');S.ex[id]={id,name:n,mg:g('mg'),eq:g('eq'),inc,rest,lo,hi,bar:bv>0?pw(bv):undefined};M=null;save();r()}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&A[b.dataset.a])A[b.dataset.a](b.dataset)});
document.addEventListener('input',e=>{const t=e.target;if(t.id==='q'||t.id==='q2')$('#ll').innerHTML=lib(t.value,t.id==='q'?'edex':'pickex')});
document.addEventListener('change',e=>{const t=e.target,D=t.dataset;
 if(D.f){const it=curS().items[cur.i],x=it.sets[D.j],v=t.value.trim();let n=v===''?'':D.f==='w'?pw(v)+(PM(S.ex[it.ex])?barLb(S.ex[it.ex]):0):+v;if(v!==''&&(isNaN(n)||n<0||(D.f==='w'&&+v<0)||(D.f==='r'&&!Number.isInteger(n))||(D.f==='rpe'&&n>10))){t.value=D.f==='w'?wv(x.w,S.ex[it.ex]):x[D.f];return toast('Invalid value')}x[D.f]=n;if(x.done&&!(+x.w>0&&+x.r>=1))x.done=0;save();const el=$('#e'+D.j);if(el)el.innerHTML=eText(x,S.ex[it.ex])}
 else if(D.s==='bar'){const v=+t.value;if(v>=0)(S.bar=S.bar||{})[S.unit]=v;save();r()}
 else if(D.s==='pl'){const a=t.value.split(/[ ,]+/).map(Number).filter(x=>x>0).sort((p,q)=>q-p);if(a.length)(S.pl=S.pl||{})[S.unit]=a;save();r()}
 else if(D.pf){const p=S.plan[ED][+D.q],n=Math.floor(+t.value);if(!(n>=1)){t.value=p[D.pf];return}p[D.pf]=n;if(p.hi<p.lo)p.hi=p.lo;planChanged(ED);save();r()}
 else if(D.p){if(D.p==='unit')S.unit=t.value;else if(D.p==='rng')P.rng=+t.value;else if(D.p==='pm')S.pm=+t.value;else if(D.p==='bp')S.bp=t.value;else P[D.p]=t.value;if(D.p==='mg')P.ex='';save();r()}
 else if(t.id==='st'&&t.value){S.start=t.value;for(const k in S.sessions)if(S.sessions[k].cyc===S.cyc&&!touched(S.sessions[k]))delete S.sessions[k];cur=curPos();save();r()}
 else if(t.id==='imp'&&t.files[0]){t.files[0].text().then(async tx=>{let o;try{o=JSON.parse(tx)}catch(_){return toast('Not valid JSON')}
  if(!(o&&o.app==='StrengthTrack'&&o.v===1&&o.ex&&typeof o.ex==='object'&&Array.isArray(o.plan)&&o.plan.length===5&&o.sessions&&typeof o.sessions==='object'&&Object.values(o.sessions).every(s=>s&&Array.isArray(s.items)&&s.items.every(i=>o.ex[i.ex]&&Array.isArray(i.sets)))))return toast('Invalid backup. Nothing changed.');
  if(!await askYes(`Replace ALL current data with this backup (${Object.keys(o.sessions).length} workouts, ${Object.keys(o.ex).length} exercises)? A backup of current data will download first.`,'Restore'))return;xj();S=o;cur=curPos();save();r();toast('Backup restored')})}});
(async()=>{let m=await kvg('meta');if(!m){const old=await kvg('state');PK='p1';m={PL:[{id:'p1',name:'Me'}],PK};if(old)await kvs('p:p1',old);await kvs('meta',m)}PL=m.PL;PK=m.PK;S=await load()||fresh();if(!(await kvg('ack')))M={t:'warn'};cur=curPos();navigator.storage&&navigator.storage.persist&&navigator.storage.persist();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});r();setInterval(tick,300)})();

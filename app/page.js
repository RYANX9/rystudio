'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const BUILTIN = [
  { id: 'study', label: 'Study', mark: 'S', color: '#9080F0', fg: '#111' },
  { id: 'prayer', label: 'Prayer', mark: 'P', color: '#4DBDAB', fg: '#111' },
  { id: 'Wasting', label: 'Wasting', mark: '!', color: '#D05848', fg: '#f7f5ef' },
  { id: 'sleep', label: 'Sleep', mark: 'Z', color: '#BDB39E', fg: '#111' },
  { id: 'food', label: 'Food', mark: 'F', color: '#EDD03A', fg: '#111' },
  { id: 'other', label: 'Other', mark: '·', color: '#C0BAB2', fg: '#111' },
];
const CUSTOM_COLORS = ['#E88B50', '#64C8E0', '#A8D860', '#D888CC'];

const styleText = [
  '*{box-sizing:border-box}',
  'html,body{margin:0;background:#eceae4;color:#111;overscroll-behavior:none}',
  'button,input,textarea,select{font:inherit}',
  'button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #111;outline-offset:2px}',
  '::-webkit-scrollbar{width:0;height:0}',
  '@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
  '.anim{animation:up .28s ease both}',
  '.tap{transition:transform .12s,opacity .12s}',
  '.tap:active{transform:scale(.97);opacity:.8}',
  '@media (prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}'
].join('');

function localDay(date) {
  const d = date || new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function shiftDay(day, amount) {
  const d = new Date(day + 'T12:00:00');
  d.setDate(d.getDate() + amount);
  return localDay(d);
}
function startWeek(day) {
  const d = new Date(day + 'T12:00:00');
  const n = d.getDay() || 7;
  d.setDate(d.getDate() - n + 1);
  return localDay(d);
}
function days(from, to) {
  const out = [], d = new Date(from + 'T12:00:00'), end = new Date(to + 'T12:00:00');
  while (d <= end) { out.push(localDay(d)); d.setDate(d.getDate() + 1); }
  return out;
}
function minutesLabel(value) {
  const m = Math.max(0, Math.round(Number(value) || 0));
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60), r = m % 60;
  return r ? h + 'h ' + r + 'm' : h + 'h';
}
function offset() { return -new Date().getTimezoneOffset(); }
function readLocal(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try { const value = JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; } catch { return fallback; }
}
function writeLocal(key, value) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
}
const input = { width:'100%', height:48, borderRadius:14, border:'1px solid rgba(17,17,17,.12)', background:'#fffdf8', padding:'0 13px', color:'#111' };

function Button({ children, onClick, primary, small, title, disabled }) {
  return <button disabled={disabled} title={title} onClick={onClick} className="tap" style={{
    minHeight: small ? 38 : 48, padding: small ? '0 14px' : '0 18px', borderRadius:999,
    background: primary ? '#111' : 'rgba(17,17,17,.08)', color: primary ? '#f4f1e9' : '#111',
    fontWeight:800, cursor:disabled ? 'not-allowed' : 'pointer', opacity:disabled ? .45 : 1
  }}>{children}</button>;
}
function Card({ title, action, children, dark }) {
  return <section className="anim" style={{background:dark?'#111':'#f5f2eb',color:dark?'#f5f2eb':'#111',border:'1px solid rgba(17,17,17,.08)',borderRadius:24,padding:20}}>
    {(title || action) && <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}><h2 style={{fontSize:15,margin:0}}>{title}</h2>{action}</div>}
    {children}
  </section>;
}
function Stat({ label, value }) {
  return <div style={{background:'#111',color:'#f5f2eb',borderRadius:18,padding:15}}><div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.12em',opacity:.5}}>{label}</div><div style={{fontSize:28,fontWeight:900,marginTop:5}}>{value}</div></div>;
}

function QuickLog({ cats, defaultTag, onSave, onClose }) {
  const [tag,setTag]=useState(defaultTag || cats[0].id);
  const [mins,setMins]=useState('');
  const [activity,setActivity]=useState('');
  const [saving,setSaving]=useState(false);
  const cat=cats.find(x=>x.id===tag) || cats[0];
  async function submit(e) {
    e.preventDefault();
    if (!Number(mins) || saving) return;
    setSaving(true);
    await onSave({tag:tag,duration_minutes:Number(mins),activity:activity.trim() || cat.label});
    setSaving(false); onClose();
  }
  return <div role="dialog" aria-modal="true" className="anim" style={{position:'fixed',inset:0,zIndex:50,background:'rgba(17,17,17,.45)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
    <form onSubmit={submit} style={{width:'min(720px,100%)',background:'#f5f2eb',borderRadius:'28px 28px 0 0',padding:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2 style={{margin:0}}>Quick log</h2><Button small onClick={onClose}>Close</Button></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))',gap:7,marginTop:18}}>{cats.map(c=><button type="button" key={c.id} onClick={()=>setTag(c.id)} style={{padding:'12px 7px',borderRadius:15,border:0,background:c.color,color:c.fg,fontWeight:800,opacity:tag===c.id?1:.5}}>{c.label}</button>)}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',gap:9,marginTop:10}}>
        <input autoFocus value={mins} onChange={e=>setMins(e.target.value)} type="number" min="1" inputMode="numeric" placeholder="Minutes" style={input}/>
        <input value={activity} onChange={e=>setActivity(e.target.value)} placeholder="What were you doing?" style={input}/>
      </div>
      <button disabled={saving} style={{width:'100%',height:54,borderRadius:999,background:'#111',color:'#f5f2eb',fontWeight:900,marginTop:12}}>{saving?'Saving…':'Save entry'}</button>
    </form>
  </div>;
}

function Timer({ cats, running, setRunning, onFinish }) {
  const saved=readLocal('chronicle_timer',null);
  const [tag,setTag]=useState(saved?.tag || cats[0].id);
  const [started,setStarted]=useState(saved?.started || null);
  const [elapsed,setElapsed]=useState(saved?.started ? Math.floor((Date.now()-saved.started)/1000) : 0);
  useEffect(()=>{ if(!running || !started)return; const id=setInterval(()=>setElapsed(Math.floor((Date.now()-started)/1000)),1000); return()=>clearInterval(id); },[running,started]);
  function start(){const now=Date.now();setStarted(now);setElapsed(0);setRunning(true);writeLocal('chronicle_timer',{started:now,tag:tag});}
  async function finish(){const mins=Math.max(1,Math.round(elapsed/60));const startedAt=new Date(started).toISOString();setRunning(false);setStarted(null);setElapsed(0);localStorage.removeItem('chronicle_timer');await onFinish({tag:tag,duration_minutes:mins,activity:(cats.find(x=>x.id===tag)||cats[0]).label,started_at:startedAt});}
  const h=String(Math.floor(elapsed/3600)).padStart(2,'0'),m=String(Math.floor((elapsed%3600)/60)).padStart(2,'0'),s=String(elapsed%60).padStart(2,'0');
  return <Card title="Live session" action={running?<Button small primary onClick={finish}>Finish</Button>:<Button small primary onClick={start}>Start timer</Button>}>
    <div style={{fontSize:48,fontWeight:900,fontVariantNumeric:'tabular-nums'}}>{h+':'+m+':'+s}</div>
    <div style={{display:'flex',gap:7,overflowX:'auto',marginTop:12}}>{cats.map(c=><button type="button" disabled={running} key={c.id} onClick={()=>setTag(c.id)} style={{padding:'9px 13px',borderRadius:999,border:0,background:c.color,color:c.fg,fontWeight:800,opacity:tag===c.id?1:.5}}>{c.label}</button>)}</div>
    <div style={{fontSize:11,opacity:.5,marginTop:9}}>{running?'Persistent timer: navigation and refresh are safe.':'Use the timer when you want accurate session durations.'}</div>
  </Card>;
}

function Timeline({ entries, cats, onDelete }) {
  if(!entries.length)return <div style={{padding:'28px 8px',textAlign:'center',opacity:.5,fontSize:13}}>Nothing logged for this day.</div>;
  return <div>{entries.map(e=>{const c=cats.find(x=>x.id===e.tag)||{label:e.tag,color:'#aaa',fg:'#111'};return <div key={e.id} style={{display:'grid',gridTemplateColumns:'8px 1fr auto auto',gap:12,alignItems:'center',padding:'11px 0',borderBottom:'1px solid rgba(17,17,17,.07)'}}>
    <div style={{height:40,borderRadius:99,background:c.color}}/><div><b style={{fontSize:13}}>{e.activity||c.label}</b><div style={{fontSize:10,opacity:.5}}>{new Date(e.started_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · {c.label}</div></div><b style={{fontSize:12}}>{minutesLabel(e.duration_minutes)}</b><button aria-label="Delete entry" onClick={()=>onDelete(e.id)} style={{background:'transparent',fontSize:18,opacity:.4}}>×</button>
  </div>})}</div>;
}

function Bars({ data }) {
  const max=Math.max(1,...data.map(x=>x.value));
  return <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6,height:130,alignItems:'end'}}>{data.map(x=><div key={x.day} title={x.day+' · '+minutesLabel(x.value)} style={{height:130,display:'flex',flexDirection:'column',justifyContent:'flex-end',gap:6}}><div style={{height:Math.max(3,Math.round(x.value/max*105)),background:'#111',borderRadius:7}}/><div style={{fontSize:9,textAlign:'center',opacity:.5}}>{new Date(x.day+'T12:00:00').toLocaleDateString('en',{weekday:'short'}).slice(0,1)}</div></div>)}</div>;
}

function Analytics({ stats, day }) {
  const week=days(shiftDay(day,-6),day);
  const totals=week.map(d=>({day:d,value:(stats[d]||[]).reduce((s,r)=>s+Number(r.total_minutes||0),0)}));
  const total=totals.reduce((s,x)=>s+x.value,0);
  const active=totals.filter(x=>x.value>0).length;
  const cats={};
  Object.values(stats).forEach(rows=>rows.forEach(r=>cats[r.tag]=(cats[r.tag]||0)+Number(r.total_minutes||0)));
  const mix=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,6);
  return <div style={{display:'grid',gap:14}}>
    <Card title="Seven-day trend"><Bars data={totals}/><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginTop:14}}><Stat label="Total" value={minutesLabel(total)}/><Stat label="Average" value={minutesLabel(active?total/active:0)}/><Stat label="Active days" value={active}/></div></Card>
    <Card title="Category intelligence">{mix.length?mix.map(([tag,m])=>{const c=BUILTIN.find(x=>x.id===tag)||{label:tag,color:'#aaa'};return <div key={tag} style={{marginBottom:11}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12,fontWeight:800}}><span>{c.label}</span><span>{minutesLabel(m)}</span></div><div style={{height:8,background:'rgba(17,17,17,.08)',borderRadius:99,marginTop:5}}><div style={{height:'100%',width:(total?m/total*100:0)+'%',background:c.color,borderRadius:99}}/></div></div>}):<div style={{opacity:.5,fontSize:13}}>Log more time to unlock patterns.</div>}</Card>
  </div>;
}

function Palette({ close, actions }) {
  const [q,setQ]=useState('');
  const list=actions.filter(a=>a.label.toLowerCase().includes(q.toLowerCase()));
  return <div role="dialog" aria-modal="true" onClick={close} style={{position:'fixed',inset:0,zIndex:60,background:'rgba(17,17,17,.4)',backdropFilter:'blur(7px)',padding:'12vh 18px'}}>
    <div onClick={e=>e.stopPropagation()} style={{maxWidth:600,margin:'auto',background:'#f5f2eb',borderRadius:22,overflow:'hidden'}}><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search actions…" style={{width:'100%',height:58,border:0,borderBottom:'1px solid rgba(17,17,17,.1)',padding:'0 18px',background:'transparent',outline:0}}/>{list.map(a=><button key={a.label} onClick={()=>{a.run();close()}} style={{display:'block',width:'100%',textAlign:'left',padding:15,border:0,background:'transparent',fontWeight:700}}>{a.label}<span style={{float:'right',opacity:.35}}>↵</span></button>)}</div>
  </div>;
}

function Settings({ cats, setCats, close }) {
  const [label,setLabel]=useState('');
  const [reduced,setReduced]=useState(readLocal('chronicle_settings',{reducedMotion:false}).reducedMotion);
  function add(){if(!label.trim())return;const c={id:'x_'+Date.now(),label:label.trim(),mark:label.trim()[0].toUpperCase(),color:CUSTOM_COLORS[cats.length%CUSTOM_COLORS.length],fg:'#111'};const next=cats.concat(c);setCats(next);writeLocal('chronicle_customs',next.filter(x=>x.id.indexOf('x_')===0));setLabel('');}
  function save(){writeLocal('chronicle_settings',{reducedMotion:reduced});close();}
  return <div className="anim" style={{position:'fixed',inset:0,zIndex:40,background:'#eceae4',overflow:'auto'}}><div style={{maxWidth:760,margin:'0 auto',padding:'30px 18px 70px'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.15em',opacity:.45}}>Settings</div><h1 style={{fontSize:40,margin:'4px 0 0'}}>Control room</h1></div><Button onClick={close}>Done</Button></div>
    <div style={{display:'grid',gap:14,marginTop:24}}>
      <Card title="Accessibility"><label style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center'}}><span><b>Reduce motion</b><br/><small style={{opacity:.5}}>Keep transitions calm.</small></span><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/></label></Card>
      <Card title="Categories"><div style={{display:'flex',gap:8}}><input value={label} onChange={e=>setLabel(e.target.value)} placeholder="New category" style={{...input,flex:1}}/><Button primary onClick={add}>Add</Button></div><div style={{display:'flex',flexWrap:'wrap',gap:7,marginTop:12}}>{cats.map(c=><span key={c.id} style={{padding:'8px 12px',borderRadius:999,background:c.color,fontWeight:800}}>{c.label}</span>)}</div></Card>
      <Card title="Data"><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><Button onClick={()=>location.href='/api/export?from='+shiftDay(localDay(),-30)+'&to='+localDay()+'&tz='+offset()}>Export 30 days</Button><Button onClick={()=>{localStorage.removeItem('chronicle_queue');localStorage.removeItem('chronicle_timer');location.reload()}}>Clear local state</Button></div></Card>
      <Button primary onClick={save}>Save settings</Button>
    </div>
  </div></div>;
}

export default function Home() {
  const today=localDay();
  const [day,setDay]=useState(today);
  const [view,setView]=useState('today');
  const [entries,setEntries]=useState([]);
  const [stats,setStats]=useState({});
  const [goals,setGoals]=useState([]);
  const [cats,setCats]=useState(BUILTIN.concat(readLocal('chronicle_customs',[])));
  const [loading,setLoading]=useState(true);
  const [online,setOnline]=useState(true);
  const [queue,setQueue]=useState(readLocal('chronicle_queue',[]));
  const [log,setLog]=useState(false);
  const [palette,setPalette]=useState(false);
  const [settings,setSettings]=useState(false);
  const [running,setRunning]=useState(!!readLocal('chronicle_timer',null));

  const refresh=useCallback(async()=>{
    setLoading(true);
    try {
      const from=shiftDay(day,-29);
      const result=await Promise.all([
        fetch('/api/entries?date='+day+'&tz='+offset(),{cache:'no-store'}).then(r=>r.json()),
        fetch('/api/budgets',{cache:'no-store'}).then(r=>r.json()),
        fetch('/api/stats?from='+from+'&to='+day+'&tz='+offset(),{cache:'no-store'}).then(r=>r.json())
      ]);
      const grouped={}; (Array.isArray(result[2])?result[2]:[]).forEach(r=>(grouped[String(r.date).slice(0,10)]??=[]).push(r));
      setEntries(Array.isArray(result[0])?result[0]:[]);
      setGoals(Array.isArray(result[1])?result[1].filter(x=>Number(x.daily_minutes)>0):[]);
      setStats(grouped);setOnline(true);
    } catch { setOnline(false); }
    setLoading(false);
  },[day]);
  useEffect(()=>{refresh()},[refresh]);
  useEffect(()=>{
    const onlineNow=()=>{setOnline(true);syncQueue()};
    const offlineNow=()=>setOnline(false);
    window.addEventListener('online',onlineNow);window.addEventListener('offline',offlineNow);
    const key=e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPalette(true)}
      if(e.key==='Escape'){setPalette(false);setLog(false);setSettings(false)}
      if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&e.key.toLowerCase()==='l')setLog(true);
    };
    window.addEventListener('keydown',key);return()=>{window.removeEventListener('online',onlineNow);window.removeEventListener('offline',offlineNow);window.removeEventListener('keydown',key)};
  },[]);
  async function syncQueue(){
    const q=readLocal('chronicle_queue',[]); if(!q.length)return;
    const left=[];
    for(const item of q){try{const r=await fetch('/api/entries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)});if(!r.ok)left.push(item)}catch{left.push(item)}}
    setQueue(left);writeLocal('chronicle_queue',left);if(!left.length)refresh();
  }
  async function saveEntry(payload){
    const item={...payload,tz:offset(),started_at:payload.started_at || new Date(Date.now()-payload.duration_minutes*60000).toISOString()};
    try{const r=await fetch('/api/entries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)});if(!r.ok)throw new Error();await refresh();}
    catch{const q=readLocal('chronicle_queue',[]).concat(item);writeLocal('chronicle_queue',q);setQueue(q);setOnline(false);}
  }
  async function deleteEntry(id){
    const previous=entries;setEntries(previous.filter(x=>x.id!==id));
    try{const r=await fetch('/api/entries?id='+id,{method:'DELETE'});if(!r.ok)throw new Error();}catch{setEntries(previous)}
  }

  const bycat=useMemo(()=>{const m={};entries.forEach(e=>m[e.tag]=(m[e.tag]||0)+Number(e.duration_minutes||0));return m},[entries]);
  const total=Object.values(bycat).reduce((a,b)=>a+b,0);
  const goalMap=Object.fromEntries(goals.map(g=>[g.tag,g]));
  const week=days(shiftDay(day,-6),day);
  const weekTotal=week.reduce((s,d)=>s+(stats[d]||[]).reduce((a,r)=>a+Number(r.total_minutes||0),0),0);
  const bars=week.map(d=>({day:d,value:(stats[d]||[]).reduce((a,r)=>a+Number(r.total_minutes||0),0)}));
  const top=Object.entries(bycat).sort((a,b)=>b[1]-a[1])[0];
  const actions=[
    {label:'Log time',run:()=>setLog(true)},
    {label:'Start timer',run:()=>setRunning(true)},
    {label:'Previous day',run:()=>setDay(x=>shiftDay(x,-1))},
    {label:'Next day',run:()=>setDay(x=>shiftDay(x,1))},
    {label:'Today',run:()=>setDay(today)},
    {label:'Analytics',run:()=>setView('analytics')},
    {label:'Settings',run:()=>setSettings(true)},
    {label:'Refresh',run:refresh}
  ];

  return <main style={{minHeight:'100dvh',fontFamily:'ui-sans-serif,system-ui,-apple-system,sans-serif'}}><style>{styleText}</style>
    <div style={{maxWidth:1180,margin:'0 auto',padding:'24px 18px 60px'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:15,marginBottom:20,flexWrap:'wrap'}}>
        <div><div style={{fontSize:10,letterSpacing:'.16em',textTransform:'uppercase',opacity:.45}}>Chronicle · personal time intelligence</div><h1 style={{fontSize:'clamp(34px,6vw,60px)',letterSpacing:'-.055em',margin:'5px 0 0',lineHeight:.92}}>Your day, understood.</h1></div>
        <div style={{display:'flex',gap:7}}><Button small title="Command palette" onClick={()=>setPalette(true)}>⌘K</Button><Button small onClick={()=>setSettings(true)}>Settings</Button></div>
      </header>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:13}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}><Button small onClick={()=>setDay(shiftDay(day,-1))}>←</Button><div style={{textAlign:'center',minWidth:180}}><b>{day===today?'Today':new Date(day+'T12:00:00').toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})}</b><div style={{fontSize:10,opacity:.4}}>{day}</div></div><Button small onClick={()=>setDay(shiftDay(day,1))}>→</Button>{day!==today&&<Button small onClick={()=>setDay(today)}>Today</Button>}</div>
        <div style={{display:'flex',gap:7}}>{['today','analytics'].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:'9px 13px',border:0,borderRadius:999,background:view===v?'#111':'rgba(17,17,17,.07)',color:view===v?'#fff':'#111',fontWeight:800}}>{v==='today'?'Today':'Analytics'}</button>)}</div>
      </div>

      <div style={{display:'flex',gap:7,alignItems:'center',fontSize:11,marginBottom:13}}><span style={{width:8,height:8,borderRadius:'50%',background:online?'#4DBDAB':'#D05848'}}/>{online?'Synced':'Offline'}{queue.length?' · '+queue.length+' queued':''}</div>

      {view==='analytics'?<Analytics stats={stats} day={day}/>:<div style={{display:'grid',gridTemplateColumns:'minmax(0,1.7fr) minmax(290px,1fr)',gap:14,alignItems:'start'}}>
        <div style={{display:'grid',gap:14}}>
          <Card dark title="Today at a glance" action={<Button small onClick={()=>setLog(true)}>+ Log</Button>}>
            <div style={{fontSize:'clamp(56px,9vw,92px)',fontWeight:900,letterSpacing:'-.07em',lineHeight:.9}}>{minutesLabel(total)}</div>
            <div style={{fontSize:12,opacity:.55,marginTop:8}}>{entries.length} entries · {top?(cats.find(c=>c.id===top[0])||{label:top[0]}).label+' is your largest block':'Start logging to build your timeline'}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginTop:18}}><Stat label="This week" value={minutesLabel(weekTotal)}/><Stat label="Categories" value={Object.keys(bycat).length}/><Stat label="Study goal" value={goalMap.study?minutesLabel(goalMap.study.daily_minutes):'—'}/></div>
          </Card>
          <Timer cats={cats} running={running} setRunning={setRunning} onFinish={saveEntry}/>
          <Card title="Timeline" action={<Button small onClick={()=>setLog(true)}>Quick add</Button>}><Timeline entries={entries} cats={cats} onDelete={deleteEntry}/></Card>
        </div>
        <div style={{display:'grid',gap:14}}>
          <Card title="Categories"><div style={{display:'grid',gap:8}}>{cats.map(c=>{const m=bycat[c.id]||0,g=goalMap[c.id],pct=g?Math.min(100,m/g.daily_minutes*100):0;return <div key={c.id} style={{padding:13,borderRadius:17,background:c.color,color:c.fg}}><div style={{display:'flex',justifyContent:'space-between',fontWeight:900}}><span>{c.label}</span><span>{minutesLabel(m)}</span></div>{g&&<><div style={{height:6,background:'rgba(0,0,0,.12)',borderRadius:99,marginTop:8}}><div style={{height:'100%',width:pct+'%',background:'rgba(255,255,255,.5)',borderRadius:99}}/></div><div style={{fontSize:9,opacity:.55,marginTop:5}}>{Math.round(pct)}% of {minutesLabel(g.daily_minutes)}</div></>}</div>})}</div></Card>
          <Card title="Weekly rhythm"><Bars data={bars}/><div style={{fontSize:10,opacity:.45,marginTop:8}}>A simple seven-day view makes consistency visible without hiding the raw timeline.</div></Card>
          <Card title="Focus signal"><div style={{fontSize:34,fontWeight:900}}>{top?minutesLabel(top[1]):'0m'}</div><div style={{fontSize:12,opacity:.5,marginTop:4}}>{top?(cats.find(c=>c.id===top[0])||{label:top[0]}).label+' · largest category today':'No dominant category yet'}</div></Card>
        </div>
      </div>}

      <footer style={{fontSize:10,opacity:.38,marginTop:22,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}><span>L = quick log · ⌘/Ctrl K = command palette · Esc = close</span><span>Offline queue · persistent timer · export</span></footer>
    </div>
    {log&&<QuickLog cats={cats} defaultTag={top?.[0]} onSave={saveEntry} onClose={()=>setLog(false)}/>}
    {palette&&<Palette actions={actions} close={()=>setPalette(false)}/>}
    {settings&&<Settings cats={cats} setCats={setCats} close={()=>setSettings(false)}/>}
  </main>;
}

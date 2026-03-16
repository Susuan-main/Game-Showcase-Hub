import { useRef, useState, useCallback } from "react";
import { useCanvas } from "./useCanvas";
import { GameUI, Btn, HUD } from "./GameUI";
import { Overlay } from "./games-1to5";

interface Props { name: string; accent: string; }
export default function Games21to25({ name, accent }: Props) {
  if (name === "ForestArcher") return <ForestArcher accent={accent} />;
  if (name === "MechStorm") return <MechStorm accent={accent} />;
  if (name === "RogueDice") return <RogueDice accent={accent} />;
  if (name === "BlossomFarm") return <BlossomFarm accent={accent} />;
  return <ThunderStrike accent={accent} />;
}

/* ── 21. Forest Archer (archery) ─────────────────── */
function ForestArcher({ accent }: { accent: string }) {
  const state=useRef({angle:45,power:70,targets:[] as {x:number;y:number;r:number;vx:number}[],arrow:null as null|{x:number;y:number;vx:number;vy:number},score:0,misses:0,over:false,started:false,aiming:false,charging:false,chargeT:0,spawnT:0,t:0,wind:0});
  const [ui,setUi]=useState({score:0,misses:0,over:false,started:false,angle:45,power:70,wind:0});
  const reset=useCallback(()=>{const s=state.current;Object.assign(s,{angle:45,power:70,targets:[],arrow:null,score:0,misses:0,over:false,started:true,aiming:false,charging:false,chargeT:0,spawnT:0,t:0,wind:(Math.random()-0.5)*30});setUi({score:0,misses:0,over:false,started:true,angle:45,power:70,wind:Math.round(state.current.wind)});},[]);
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt;
    if(s.charging){s.chargeT=Math.min(1,s.chargeT+dt*0.8);s.power=Math.floor(30+s.chargeT*70);setUi(u=>({...u,power:s.power}));}
    if(s.arrow){s.arrow.vx+=s.wind*dt*0.8;s.arrow.vy+=500*dt;s.arrow.x+=s.arrow.vx*dt;s.arrow.y+=s.arrow.vy*dt;let hit=false;s.targets=s.targets.filter(t=>{if(Math.hypot(t.x-s.arrow!.x,t.y-s.arrow!.y)<t.r+6){s.score+=Math.ceil(20/t.r*10);setUi(u=>({...u,score:s.score}));hit=true;return false;}return true;});if(hit||s.arrow.y>H+20||s.arrow.x>W+20){if(!hit){s.misses++;setUi(u=>({...u,misses:s.misses}));if(s.misses>=5){s.over=true;setUi(u=>({...u,over:true}));}}s.arrow=null;}}
    s.spawnT-=dt;
    if(s.spawnT<=0){const r=15+Math.random()*15;s.targets.push({x:W-50,y:60+Math.random()*(H-120),r,vx:-(20+Math.random()*40+s.score*0.3)});s.spawnT=Math.max(0.7,2-s.t*0.03);}
    for(const t of s.targets){t.x+=t.vx*dt;if(t.x<-50){s.misses++;setUi(u=>({...u,misses:s.misses}));if(s.misses>=5){s.over=true;setUi(u=>({...u,over:true}));}t.x=-9999;}}
    s.targets=s.targets.filter(t=>t.x>-9998);
    // BG
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#1a2e0a");sky.addColorStop(1,"#0d1a05");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // Trees
    for(let i=0;i<8;i++){const tx=50+i*80,th=60+i%3*30;ctx.fillStyle="#1a3d0a";ctx.beginPath();ctx.moveTo(tx,H-20);ctx.lineTo(tx-25,H-20-th);ctx.lineTo(tx+25,H-20-th);ctx.closePath();ctx.fill();}
    ctx.fillStyle="#2d5a1b";ctx.fillRect(0,H-20,W,20);
    // Wind indicator
    const windDir=s.wind>0?"→":"←";ctx.fillStyle="#fff";ctx.font="12px sans-serif";ctx.fillText(`Wind: ${windDir} ${Math.abs(Math.round(s.wind))}`,W-120,20);
    // Targets (deer circles)
    for(const t of s.targets){ctx.fillStyle="#8b4513";ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle="rgba(255,255,255,0.3)";ctx.beginPath();ctx.arc(t.x,t.y,t.r*0.5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(t.x,t.y,t.r*0.15,0,Math.PI*2);ctx.fill();}
    // Archer
    ctx.fillStyle="#6b3a2a";ctx.fillRect(30,H-80,18,60);ctx.fillStyle="#fbbf24";ctx.beginPath();ctx.arc(39,H-88,14,0,Math.PI*2);ctx.fill();
    // Bow & arrow preview
    const rad=s.angle*(Math.PI/180);ctx.strokeStyle="#8b6914";ctx.lineWidth=3;const bowR=30;ctx.beginPath();ctx.arc(48,H-70,bowR,-Math.PI/2-0.8,-Math.PI/2+0.8);ctx.stroke();if(!s.arrow){const px=48+Math.cos(-rad)*bowR,py=(H-70)+Math.sin(-rad)*bowR;ctx.strokeStyle="#c4a44a";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(48,H-70);ctx.lineTo(px+Math.cos(-rad)*s.power*0.5,py+Math.sin(-rad)*s.power*0.5);ctx.stroke();}
    // Arrow in flight
    if(s.arrow){const ang=Math.atan2(s.arrow.vy,s.arrow.vx);ctx.save();ctx.translate(s.arrow.x,s.arrow.y);ctx.rotate(ang);ctx.strokeStyle="#c4a44a";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(12,0);ctx.stroke();ctx.fillStyle="#c4a44a";ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(6,-4);ctx.lineTo(6,4);ctx.closePath();ctx.fill();ctx.restore();}
    // Power bar
    ctx.fillStyle="#1e1e2e";ctx.fillRect(10,H-12,100,8);ctx.fillStyle="#f59e0b";ctx.fillRect(10,H-12,s.power,8);
  },(canvas)=>{
    const s=state.current;
    const kd=(e:KeyboardEvent)=>{if(!s.started||s.over)return;if(e.key==="ArrowUp")s.angle=Math.min(80,s.angle+3);if(e.key==="ArrowDown")s.angle=Math.max(10,s.angle-3);setUi(u=>({...u,angle:s.angle}));if(e.key===" "&&!s.charging&&!s.arrow){s.charging=true;s.chargeT=0;}};
    const ku=(e:KeyboardEvent)=>{if(e.key===" "&&s.charging){const rad=s.angle*(Math.PI/180);const spd=s.power*5;s.arrow={x:48,y:canvas.height-70,vx:Math.cos(-rad)*spd,vy:Math.sin(-rad)*spd};s.charging=false;}};
    window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);return()=>{window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};
  });
  return(<GameUI accent={accent}><HUD><span>🏹 Score: {ui.score}</span><span>Angle: {ui.angle}°</span><span>Power: {ui.power}%</span><span>❌ {ui.misses}/5</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>↑↓ to aim · Hold Space to charge · Release to fire</div>{!ui.started&&<Overlay accent={accent} msg="Forest Archer" sub="↑↓ aim · Hold Space to charge · release to fire" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Quiver empty! Score: ${ui.score}`} sub="Too many targets escaped" onStart={reset} restart/>}</GameUI>);
}

/* ── 22. Mech Storm (WASD + auto-shoot) ──────────── */
function MechStorm({ accent }: { accent: string }) {
  const state=useRef({px:320,py:300,angle:0,bullets:[] as {x:number;y:number;vx:number;vy:number}[],mechs:[] as {x:number;y:number;hp:number;vx:number;vy:number;angle:number;hit:number;shootT:number}[],enemyBullets:[] as {x:number;y:number;vx:number;vy:number}[],score:0,lives:3,over:false,started:false,spawnT:0,shootT:0,t:0,wave:1,mouse:{x:320,y:190},keys:{} as Record<string,boolean>});
  const [ui,setUi]=useState({score:0,lives:3,over:false,started:false,wave:1});
  const reset=useCallback(()=>{const s=state.current;Object.assign(s,{px:320,py:300,angle:0,bullets:[],mechs:[],enemyBullets:[],score:0,lives:3,over:false,started:true,spawnT:0,shootT:0,t:0,wave:1});setUi({score:0,lives:3,over:false,started:true,wave:1});},[]);
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt;
    const spd=150;if(s.keys["w"]||s.keys["ArrowUp"])s.py-=spd*dt;if(s.keys["s"]||s.keys["ArrowDown"])s.py+=spd*dt;if(s.keys["a"]||s.keys["ArrowLeft"])s.px-=spd*dt;if(s.keys["d"]||s.keys["ArrowRight"])s.px+=spd*dt;
    s.px=Math.max(20,Math.min(W-20,s.px));s.py=Math.max(20,Math.min(H-20,s.py));
    s.angle=Math.atan2(s.mouse.y-s.py,s.mouse.x-s.px);
    s.shootT-=dt;if(s.shootT<=0){s.bullets.push({x:s.px,y:s.py,vx:Math.cos(s.angle)*450,vy:Math.sin(s.angle)*450});s.shootT=0.15;}
    s.spawnT-=dt;
    if(s.spawnT<=0&&s.mechs.length<s.wave*2+2){const a=Math.random()*Math.PI*2;const r=300;s.mechs.push({x:W/2+Math.cos(a)*r,y:H/2+Math.sin(a)*r,hp:3+s.wave,vx:0,vy:0,angle:0,hit:0,shootT:2});s.spawnT=1;}
    if(s.mechs.length===0&&s.spawnT<-1){s.wave++;setUi(u=>({...u,wave:s.wave}));s.spawnT=0;}
    for(const b of s.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;}s.bullets=s.bullets.filter(b=>b.x>0&&b.x<W&&b.y>0&&b.y<H);
    for(const m of s.mechs){const a=Math.atan2(s.py-m.y,s.px-m.x);m.vx=Math.cos(a)*60;m.vy=Math.sin(a)*60;m.x+=m.vx*dt;m.y+=m.vy*dt;m.angle=a;if(m.hit>0)m.hit-=dt;m.shootT-=dt;if(m.shootT<=0){const spd2=180;s.enemyBullets.push({x:m.x,y:m.y,vx:Math.cos(a)*spd2,vy:Math.sin(a)*spd2});m.shootT=2;}if(Math.hypot(m.x-s.px,m.y-s.py)<30){s.lives--;setUi(u=>({...u,lives:s.lives}));m.x=-9999;if(s.lives<=0){s.over=true;setUi(u=>({...u,over:true}));}}for(const b of s.bullets){if(Math.hypot(b.x-m.x,b.y-m.y)<24){m.hp--;m.hit=0.2;b.x=-9999;if(m.hp<=0){s.score+=10+s.wave*5;setUi(u=>({...u,score:s.score}));m.x=-9999;}}}}
    s.mechs=s.mechs.filter(m=>m.hp>0&&m.x>-9998);s.bullets=s.bullets.filter(b=>b.x>-9998);
    for(const eb of s.enemyBullets){eb.x+=eb.vx*dt;eb.y+=eb.vy*dt;if(Math.hypot(eb.x-s.px,eb.y-s.py)<18){s.lives--;setUi(u=>({...u,lives:s.lives}));eb.x=-9999;if(s.lives<=0){s.over=true;setUi(u=>({...u,over:true}));}}}
    s.enemyBullets=s.enemyBullets.filter(eb=>eb.x>0&&eb.x<W&&eb.y>0&&eb.y<H);
    // BG
    ctx.fillStyle="#0a0a0a";ctx.fillRect(0,0,W,H);for(let x=0;x<W;x+=50){ctx.strokeStyle="#1a1a2a";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    // Enemy bullets
    for(const eb of s.enemyBullets){ctx.fillStyle="#ff4444";ctx.beginPath();ctx.arc(eb.x,eb.y,4,0,Math.PI*2);ctx.fill();}
    // Enemy mechs
    for(const m of s.mechs){ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.angle);ctx.fillStyle=m.hit>0?"#ff8888":"#cc3333";ctx.fillRect(-18,-12,36,24);ctx.fillStyle="#aa2222";ctx.fillRect(-10,-20,20,10);ctx.fillRect(18,-6,14,12);ctx.restore();}
    // Player bullets
    for(const b of s.bullets){ctx.fillStyle="#ffff00";ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fill();}
    // Player mech
    ctx.save();ctx.translate(s.px,s.py);ctx.rotate(s.angle);ctx.fillStyle=accent;ctx.fillRect(-20,-14,40,28);ctx.fillStyle="#5b21b6";ctx.fillRect(-10,-22,20,10);ctx.fillRect(20,-8,14,16);ctx.restore();
  },(canvas)=>{const s=state.current;const mm=(e:MouseEvent)=>{const r=canvas.getBoundingClientRect();s.mouse={x:(e.clientX-r.left)*(canvas.width/r.width),y:(e.clientY-r.top)*(canvas.height/r.height)};};const kd=(e:KeyboardEvent)=>{s.keys[e.key]=true;};const ku=(e:KeyboardEvent)=>{delete s.keys[e.key];};canvas.addEventListener("mousemove",mm);window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);return()=>{canvas.removeEventListener("mousemove",mm);window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};});
  return(<GameUI accent={accent}><HUD><span>🤖 Score: {ui.score}</span><span>Wave {ui.wave}</span><span>❤️ x{ui.lives}</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>WASD to move · Mouse aims · Auto-shoots</div>{!ui.started&&<Overlay accent={accent} msg="Mech Storm" sub="WASD to move · Aim with mouse" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Destroyed! Score: ${ui.score}`} sub={`Survived ${ui.wave} waves`} onStart={reset} restart/>}</GameUI>);
}

/* ── 23. Rogue Dice (dice dungeon) ──────────────── */
const DUNGEON_ROOMS=[{name:"Goblin Den",emoji:"👺",hp:20,atk:3},{name:"Spider Cave",emoji:"🕷️",hp:35,atk:5},{name:"Troll Bridge",emoji:"🧌",hp:55,atk:8},{name:"Dragon Lair",emoji:"🐉",hp:80,atk:12},{name:"Lich King",emoji:"💀",hp:100,atk:15}];
function RogueDice({ accent }: { accent: string }) {
  const [pHp,setPHp]=useState(50);const [room,setRoom]=useState(0);const [eHp,setEHp]=useState(DUNGEON_ROOMS[0].hp);const [gold,setGold]=useState(0);const [dice,setDice]=useState<number[]>([]);const [phase,setPhase]=useState<"roll"|"choose"|"win"|"lose">("roll");const [log,setLog]=useState<string[]>(["🎲 Roll the dice to fight!"]);
  const addLog=(m:string)=>setLog(l=>[m,...l].slice(0,5));
  const enemy=DUNGEON_ROOMS[Math.min(room,DUNGEON_ROOMS.length-1)];
  const rollDice=()=>{if(phase!=="roll")return;const d=[...Array(4)].map(()=>Math.floor(Math.random()*6)+1);setDice(d);setPhase("choose");addLog(`🎲 Rolled: ${d.join(", ")}`);};
  const useDie=(val:number,idx:number)=>{if(phase!=="choose")return;const dmg=val*2;const newEHp=Math.max(0,eHp-dmg);setEHp(newEHp);const eDmg=Math.max(0,enemy.atk-Math.floor(val/2));const newPHp=Math.max(0,pHp-eDmg);setPHp(newPHp);addLog(`Die ${val}: ${dmg} dmg dealt, ${eDmg} received`);setDice(d=>d.filter((_,i)=>i!==idx));if(newEHp<=0){if(room>=DUNGEON_ROOMS.length-1){setPhase("win");}else{const nextRoom=room+1;const reward=10*(room+1);setGold(g=>g+reward);addLog(`🏆 ${enemy.name} defeated! +${reward} gold`);setRoom(nextRoom);setEHp(DUNGEON_ROOMS[nextRoom].hp);setDice([]);setPhase("roll");}}else if(newPHp<=0){setPhase("lose");}else if(dice.length<=1){setPhase("roll");}};
  const restart=()=>{setPHp(50);setRoom(0);setEHp(DUNGEON_ROOMS[0].hp);setGold(0);setDice([]);setPhase("roll");setLog(["🎲 Roll the dice to fight!"]);};
  return(<GameUI accent={accent}><HUD><span>🎲 Room {room+1}/{DUNGEON_ROOMS.length}</span><span>💰 {gold}</span></HUD>
  <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
      <div style={{background:"#0a0a0f",borderRadius:10,padding:"0.75rem",textAlign:"center"}}><div style={{fontSize:"2rem"}}>⚔️</div><div style={{background:"#1e1e2e",height:8,borderRadius:4}}><div style={{height:"100%",width:`${pHp/50*100}%`,background:"#10b981",borderRadius:4,transition:"width 0.3s"}}/></div><div style={{fontSize:"0.75rem",color:"#94a3b8"}}>Hero: {pHp} HP</div></div>
      <div style={{background:"#0a0a0f",borderRadius:10,padding:"0.75rem",textAlign:"center"}}><div style={{fontSize:"2rem"}}>{enemy.emoji}</div><div style={{background:"#1e1e2e",height:8,borderRadius:4}}><div style={{height:"100%",width:`${eHp/enemy.hp*100}%`,background:"#ef4444",borderRadius:4,transition:"width 0.3s"}}/></div><div style={{fontSize:"0.75rem",color:"#94a3b8"}}>{enemy.name}: {eHp}/{enemy.hp}</div></div>
    </div>
    <div style={{display:"flex",gap:"0.5rem",justifyContent:"center",flexWrap:"wrap"}}>
      {dice.map((d,i)=>(<button key={i} onClick={()=>useDie(d,i)} disabled={phase!=="choose"} style={{width:52,height:52,fontSize:"1.4rem",fontWeight:900,background:phase==="choose"?accent:"#1e1e2e",color:"#fff",border:"2px solid "+accent,borderRadius:10,cursor:phase==="choose"?"pointer":"default",transition:"all 0.2s"}}>{d}</button>))}
      {phase==="roll"&&<Btn accent={accent} onClick={rollDice}>🎲 Roll Dice</Btn>}
    </div>
    <div style={{background:"#0a0a0f",borderRadius:8,padding:"0.5rem",maxHeight:90,overflowY:"auto"}}>{log.map((l,i)=><div key={i} style={{fontSize:"0.8rem",color:i===0?"#fff":"#64748b"}}>{l}</div>)}</div>
  </div>
  {phase==="win"&&<Overlay accent={accent} msg="Dungeon Cleared! 🏆" sub={`Collected ${gold} gold`} onStart={restart} restart/>}
  {phase==="lose"&&<Overlay accent={accent} msg="Fallen Hero 💀" sub="The dungeon claims another soul" onStart={restart} restart/>}
  </GameUI>);
}

/* ── 24. Blossom Farm (idle clicker) ─────────────── */
const CROPS=[{name:"Carrot",emoji:"🥕",time:3,coins:5},{name:"Tomato",emoji:"🍅",time:6,coins:12},{name:"Corn",emoji:"🌽",time:10,coins:22},{name:"Pumpkin",emoji:"🎃",time:20,coins:50},{name:"Rose",emoji:"🌹",time:40,coins:120}];
function BlossomFarm({ accent }: { accent: string }) {
  const [coins,setCoins]=useState(20);const [plots,setPlots]=useState(Array.from({length:6},()=>({state:"empty" as "empty"|"growing"|"ready",crop:-1,timer:0,planted:0})));const [selectedCrop,setSelectedCrop]=useState(0);const [total,setTotal]=useState(0);
  const tick=()=>{setPlots(prev=>prev.map(p=>{if(p.state!=="growing")return p;const elapsed=(Date.now()-p.planted)/1000;const crop=CROPS[p.crop];if(elapsed>=crop.time)return{...p,state:"ready"};return p;}));};
  const plotClick=(i:number)=>{setPlots(prev=>{const ps=[...prev];const p={...ps[i]};if(p.state==="empty"){const crop=CROPS[selectedCrop];if(coins<crop.coins*0.3)return ps;setCoins(c=>c-Math.floor(crop.coins*0.3));p.state="growing";p.crop=selectedCrop;p.timer=crop.time;p.planted=Date.now();}else if(p.state==="ready"){const earned=CROPS[p.crop].coins;setCoins(c=>c+earned);setTotal(t=>t+earned);p.state="empty";p.crop=-1;}ps[i]=p;return ps;});};
  const getProgress=(p:typeof plots[0])=>{if(p.state!=="growing")return 0;const crop=CROPS[p.crop];return Math.min(1,(Date.now()-p.planted)/1000/crop.time);};
  useState(()=>{const t=setInterval(tick,500);return()=>clearInterval(t);});
  return(<GameUI accent={accent}><HUD><span>🌻 Coins: {coins}</span><span>🏆 Earned: {total}</span></HUD>
  <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
    <div style={{display:"flex",gap:"0.4rem",justifyContent:"center",flexWrap:"wrap"}}>{CROPS.map((c,i)=>(<button key={i} onClick={()=>setSelectedCrop(i)} style={{padding:"0.3rem 0.6rem",background:selectedCrop===i?accent:"#1e1e2e",color:"#fff",border:"1px solid "+accent,borderRadius:8,cursor:"pointer",fontSize:"0.8rem"}}>{c.emoji} {c.name} (-{Math.floor(c.coins*0.3)}🪙)</button>))}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.5rem"}}>{plots.map((p,i)=>{const prog=getProgress(p);return(<button key={i} onClick={()=>plotClick(i)} style={{height:80,background:p.state==="ready"?"#14532d":p.state==="growing"?"#1a2e0a":"#1e1e2e",borderRadius:10,border:`2px solid ${p.state==="ready"?"#10b981":p.state==="growing"?"#4ade80":accent}`,cursor:"pointer",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
      {p.state==="empty"&&<><div style={{fontSize:"1.2rem"}}>🌱</div><div style={{fontSize:"0.65rem",color:"#94a3b8"}}>Plant {CROPS[selectedCrop].emoji}</div></>}
      {p.state==="growing"&&<><div style={{fontSize:"1.5rem"}}>{CROPS[p.crop].emoji}</div><div style={{position:"absolute",bottom:0,left:0,height:4,width:`${prog*100}%`,background:accent,transition:"width 0.5s"}}/></>}
      {p.state==="ready"&&<><div style={{fontSize:"1.5rem"}}>{CROPS[p.crop].emoji}</div><div style={{fontSize:"0.65rem",color:"#4ade80",fontWeight:700}}>+{CROPS[p.crop].coins}🪙</div></>}
    </button>);})}
    </div>
    <div style={{color:"#94a3b8",fontSize:"0.75rem",textAlign:"center"}}>Select a crop · Click empty plot to plant · Click 🌿 ready to harvest</div>
  </div>
  </GameUI>);
}

/* ── 25. Thunder Strike (click lightning targets) ── */
function ThunderStrike({ accent }: { accent: string }) {
  const state=useRef({targets:[] as {x:number;y:number;r:number;life:number;maxLife:number;struck:number}[],bolts:[] as {x1:number;y1:number;x2:number;y2:number;t:number}[],score:0,misses:0,over:false,started:false,spawnT:0,t:0,clouds:[] as {x:number;y:number;w:number}[]});
  const [ui,setUi]=useState({score:0,misses:0,over:false,started:false});
  const reset=useCallback(()=>{const s=state.current;Object.assign(s,{targets:[],bolts:[],score:0,misses:0,over:false,started:true,spawnT:0,t:0,clouds:[{x:100,y:30,w:120},{x:350,y:20,w:150},{x:550,y:35,w:100}]});setUi({score:0,misses:0,over:false,started:true});},[]);
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt;s.spawnT-=dt;
    if(s.spawnT<=0){s.targets.push({x:60+Math.random()*(W-120),y:120+Math.random()*(H-160),r:14+Math.random()*16,life:2.5-s.t*0.03,maxLife:2.5-s.t*0.03,struck:0});s.spawnT=Math.max(0.3,1.2-s.t*0.025);}
    const faded:number[]=[];
    for(let i=0;i<s.targets.length;i++){const t=s.targets[i];t.life-=dt;if(t.struck>0)t.struck-=dt;if(t.life<=0){faded.push(i);s.misses++;if(s.misses>=5){s.over=true;setUi(u=>({...u,over:true}));}setUi(u=>({...u,misses:s.misses}));}}
    s.targets=s.targets.filter((_,i)=>!faded.includes(i));
    for(const b of s.bolts)b.t-=dt;s.bolts=s.bolts.filter(b=>b.t>0);
    // Move clouds
    for(const c of s.clouds)c.x=(c.x+20*dt)%(W+c.w*2)-c.w;
    // BG
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#0f0f1a");sky.addColorStop(1,"#1a1030");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // Ground
    ctx.fillStyle="#1a1005";ctx.fillRect(0,H-30,W,30);
    // Clouds
    for(const c of s.clouds){ctx.fillStyle="#2a2a4a";ctx.beginPath();ctx.ellipse(c.x,c.y,c.w,25,0,0,Math.PI*2);ctx.fill();}
    // Targets (enemies)
    for(const t of s.targets){const glow=t.struck>0?"#ffff00":"#8855ff";ctx.fillStyle=t.struck>0?"#ffff88":"#8855ff";ctx.shadowBlur=t.struck>0?20:0;ctx.shadowColor=glow;ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#fff";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";const pct=Math.ceil(t.life/t.maxLife*100);ctx.fillStyle=pct>60?"#4ade80":pct>30?"#f59e0b":"#ef4444";ctx.fillText(pct+"%",t.x,t.y);}
    // Lightning bolts
    ctx.strokeStyle="#ffff44";ctx.lineWidth=2;
    for(const b of s.bolts){ctx.globalAlpha=b.t*3;ctx.beginPath();ctx.moveTo(b.x1,0);const segs=8;for(let i=1;i<=segs;i++){const px=b.x1+(b.x2-b.x1)*i/segs+(Math.random()-0.5)*20;const py=b.y2*i/segs;ctx.lineTo(px,py);}ctx.stroke();}
    ctx.globalAlpha=1;ctx.lineWidth=1;
  },(canvas)=>{
    const s=state.current;
    const click=(e:MouseEvent)=>{if(!s.started||s.over)return;const r=canvas.getBoundingClientRect();const mx=(e.clientX-r.left)*(canvas.width/r.width);const my=(e.clientY-r.top)*(canvas.height/r.height);let hit=false;s.targets=s.targets.filter(t=>{if(Math.hypot(t.x-mx,t.y-my)<t.r+8){s.score+=Math.ceil(10+20*(t.life/t.maxLife));setUi(u=>({...u,score:s.score}));s.bolts.push({x1:t.x,y1:0,x2:t.x,y2:t.y,t:0.3});hit=true;return false;}return true;});if(!hit){s.misses++;setUi(u=>({...u,misses:s.misses}));if(s.misses>=5){s.over=true;setUi(u=>({...u,over:true}));}}};
    canvas.addEventListener("click",click);return()=>canvas.removeEventListener("click",click);
  });
  return(<GameUI accent={accent}><HUD><span>⚡ Score: {ui.score}</span><span>❌ Misses: {ui.misses}/5</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%",cursor:"crosshair"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Click enemies to strike with lightning before they escape!</div>{!ui.started&&<Overlay accent={accent} msg="Thunder Strike" sub="Click enemies to zap them with lightning!" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Storm Over! Score: ${ui.score}`} sub="Too many targets escaped" onStart={reset} restart/>}</GameUI>);
}

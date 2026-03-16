import { useRef, useState, useCallback, useEffect } from "react";
import { useCanvas } from "./useCanvas";
import { GameUI, Btn, HUD } from "./GameUI";
import { Overlay } from "./games-1to5";

interface Props { name: string; accent: string; }
export default function Games6to10({ name, accent }: Props) {
  if (name === "BlastSquad") return <BlastSquad accent={accent} />;
  if (name === "CastleWars") return <CastleWars accent={accent} />;
  if (name === "PhantomHunt") return <PhantomHunt accent={accent} />;
  if (name === "PixelDepths") return <PixelDepths accent={accent} />;
  return <IronFist accent={accent} />;
}

/* ── 6. Blast Squad (top-down shooter) ─────────── */
function BlastSquad({ accent }: { accent: string }) {
  const state = useRef({
    px:320,py:190,vx:0,vy:0,angle:0,
    bullets:[] as {x:number;y:number;vx:number;vy:number}[],
    enemies:[] as {x:number;y:number;hp:number;vx:number;vy:number;hit:number}[],
    score:0,lives:3,over:false,started:false,spawnT:0,shootCooldown:0,t:0,
    mouse:{x:320,y:190},keys:{} as Record<string,boolean>,
  });
  const [ui,setUi]=useState({score:0,lives:3,over:false,started:false});
  const reset=useCallback(()=>{const s=state.current;Object.assign(s,{px:320,py:190,vx:0,vy:0,bullets:[],enemies:[],score:0,lives:3,over:false,started:true,spawnT:0,shootCooldown:0,t:0});setUi({score:0,lives:3,over:false,started:true});},[]);
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt;
    // Move
    const spd=160;
    if(s.keys["w"]||s.keys["ArrowUp"])s.vy=-spd;else if(s.keys["s"]||s.keys["ArrowDown"])s.vy=spd;else s.vy=0;
    if(s.keys["a"]||s.keys["ArrowLeft"])s.vx=-spd;else if(s.keys["d"]||s.keys["ArrowRight"])s.vx=spd;else s.vx=0;
    s.px=Math.max(14,Math.min(W-14,s.px+s.vx*dt));
    s.py=Math.max(14,Math.min(H-14,s.py+s.vy*dt));
    s.angle=Math.atan2(s.mouse.y-s.py,s.mouse.x-s.px);
    // Auto shoot
    s.shootCooldown-=dt;
    if(s.shootCooldown<=0){const spd2=400;s.bullets.push({x:s.px,y:s.py,vx:Math.cos(s.angle)*spd2,vy:Math.sin(s.angle)*spd2});s.shootCooldown=0.18;}
    for(const b of s.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;}
    s.bullets=s.bullets.filter(b=>b.x>0&&b.x<W&&b.y>0&&b.y<H);
    // Spawn enemies
    s.spawnT-=dt;
    if(s.spawnT<=0){const angle=Math.random()*Math.PI*2;const r=Math.max(W,H);s.enemies.push({x:W/2+Math.cos(angle)*r,y:H/2+Math.sin(angle)*r,hp:2+Math.floor(s.t/10),vx:0,vy:0,hit:0});s.spawnT=Math.max(0.4,1.2-s.t*0.02);}
    for(const e of s.enemies){const ang=Math.atan2(s.py-e.y,s.px-e.x);const spd2=60+s.t*2;e.vx=Math.cos(ang)*spd2;e.vy=Math.sin(ang)*spd2;e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.hit>0)e.hit-=dt;if(Math.hypot(e.x-s.px,e.y-s.py)<28){s.lives--;setUi(u=>({...u,lives:s.lives}));e.x=-200;if(s.lives<=0){s.over=true;setUi(u=>({...u,over:true}));}}for(const b of s.bullets){if(Math.hypot(b.x-e.x,b.y-e.y)<22){e.hp--;e.hit=0.15;b.x=-9999;if(e.hp<=0){s.score++;setUi(u=>({...u,score:s.score}));}}}}
    s.enemies=s.enemies.filter(e=>e.hp>0&&e.x>-100);
    s.bullets=s.bullets.filter(b=>b.x>-9998);
    // Draw
    ctx.fillStyle="#0a0a14";ctx.fillRect(0,0,W,H);
    // Grid
    ctx.strokeStyle="#1a1a2e";ctx.lineWidth=1;
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    // Bullets
    for(const b of s.bullets){ctx.fillStyle="#ffff44";ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fill();}
    // Enemies
    for(const e of s.enemies){ctx.fillStyle=e.hit>0?"#ff8888":"#cc2244";ctx.beginPath();ctx.arc(e.x,e.y,18,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ff4466";ctx.fillRect(e.x-15,e.y-22,30,5);ctx.fillStyle="#ff0000";ctx.fillRect(e.x-15,e.y-22,(e.hp/3)*30,5);}
    // Player
    ctx.save();ctx.translate(s.px,s.py);ctx.rotate(s.angle);
    ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(-12,-12);ctx.lineTo(-6,0);ctx.lineTo(-12,12);ctx.closePath();ctx.fill();
    ctx.restore();
  },(canvas)=>{
    const s=state.current;
    const mm=(e:MouseEvent)=>{const r=canvas.getBoundingClientRect();const scaleX=canvas.width/r.width;const scaleY=canvas.height/r.height;s.mouse={x:(e.clientX-r.left)*scaleX,y:(e.clientY-r.top)*scaleY};};
    const kd=(e:KeyboardEvent)=>{s.keys[e.key]=true;};const ku=(e:KeyboardEvent)=>{delete s.keys[e.key];};
    canvas.addEventListener("mousemove",mm);window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);
    return()=>{canvas.removeEventListener("mousemove",mm);window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};
  });
  return(<GameUI accent={accent}><HUD><span>💣 Score: {ui.score}</span><span>❤️ x{ui.lives}</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>WASD to move · Auto-shoots toward cursor</div>{!ui.started&&<Overlay accent={accent} msg="Blast Squad" sub="WASD to move · Aim with mouse" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Overwhelmed! Score: ${ui.score}`} sub="The squad was wiped out" onStart={reset} restart/>}</GameUI>);
}

/* ── 7. Castle Wars (resource tower defense) ──── */
function CastleWars({ accent }: { accent: string }) {
  const [gold,setGold]=useState(50);const [wave,setWave]=useState(1);const [castleHp,setCastleHp]=useState(100);const [enemyCastle,setEnemyCastle]=useState(100);
  const [troops,setTroops]=useState(0);const [enemies,setEnemies]=useState(5);const [phase,setPhase]=useState<"build"|"battle"|"win"|"lose">("build");
  const [log,setLog]=useState<string[]>(["⚔️ Build troops, then attack!"]);
  const addLog=(m:string)=>setLog(l=>[m,...l].slice(0,5));
  useEffect(()=>{if(phase!=="battle")return;const t=setInterval(()=>{const tr=troops;const en=enemies;if(tr>0&&en>0){const killed=Math.min(en,Math.ceil(Math.random()*tr));const lost=Math.min(tr,Math.ceil(Math.random()*en));setEnemyCastle(h=>{const nh=Math.max(0,h-killed*8);if(nh<=0){setPhase("win");}return nh;});setCastleHp(h=>{const nh=Math.max(0,h-lost*5);if(nh<=0){setPhase("lose");}return nh;});setTroops(t=>Math.max(0,t-lost));setEnemies(e=>Math.max(0,e-killed));addLog(`⚔️ ${killed} enemies slain, ${lost} troops lost`);}else if(en<=0){setWave(w=>{const nw=w+1;setEnemies(Math.floor(5*1.5**(nw-1)));setGold(g=>g+20*nw);setTroops(0);setPhase("build");addLog(`🏆 Wave ${w} cleared! +${20*nw} gold`);return nw;});}else{setCastleHp(h=>{const nh=Math.max(0,h-8);if(nh<=0)setPhase("lose");return nh;});addLog("🏰 Castle is under attack!");}},800);return()=>clearInterval(t);},[phase,troops,enemies]);
  const buyTroop=()=>{if(gold<10)return;setGold(g=>g-10);setTroops(t=>t+1);addLog("🧑‍🤝‍🧑 Troop recruited!");};
  const attack=()=>{if(troops===0)return;setPhase("battle");addLog("⚔️ Attack!");};
  const restart=()=>{setGold(50);setWave(1);setCastleHp(100);setEnemyCastle(100);setTroops(0);setEnemies(5);setPhase("build");setLog(["⚔️ Build troops, then attack!"]);};
  return(<GameUI accent={accent}><HUD><span>🏰 Wave {wave}</span><span>💰 {gold}</span><span>⚔️ {troops} troops</span></HUD>
  <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
      <div style={{background:"#0a0a0f",borderRadius:10,padding:"0.75rem",textAlign:"center"}}>
        <div style={{fontSize:"1.5rem"}}>🏰</div><div style={{color:"#94a3b8",fontSize:"0.75rem"}}>Your Castle</div>
        <div style={{background:"#1e1e2e",height:8,borderRadius:4,margin:"4px 0"}}><div style={{height:"100%",width:`${castleHp}%`,background:"#10b981",borderRadius:4}}/></div><div style={{fontSize:"0.8rem",color:"#fff"}}>{castleHp} HP</div>
      </div>
      <div style={{background:"#0a0a0f",borderRadius:10,padding:"0.75rem",textAlign:"center"}}>
        <div style={{fontSize:"1.5rem"}}>🏚️</div><div style={{color:"#94a3b8",fontSize:"0.75rem"}}>Enemy Castle</div>
        <div style={{background:"#1e1e2e",height:8,borderRadius:4,margin:"4px 0"}}><div style={{height:"100%",width:`${enemyCastle}%`,background:"#ef4444",borderRadius:4}}/></div><div style={{fontSize:"0.8rem",color:"#fff"}}>{enemyCastle} HP</div>
      </div>
    </div>
    <div style={{background:"#0a0a0f",borderRadius:10,padding:"0.75rem",textAlign:"center"}}>
      <div style={{color:"#94a3b8",fontSize:"0.8rem"}}>Enemies remaining: <strong style={{color:"#ef4444"}}>{enemies}</strong></div>
    </div>
    <div style={{display:"flex",gap:"0.5rem",justifyContent:"center"}}>
      <Btn accent="#f59e0b" onClick={buyTroop} disabled={gold<10||phase==="battle"}>🧑‍🤝‍🧑 Recruit (10💰)</Btn>
      <Btn accent={accent} onClick={attack} disabled={troops===0||phase==="battle"}>⚔️ Attack!</Btn>
    </div>
    <div style={{background:"#0a0a0f",borderRadius:8,padding:"0.5rem",maxHeight:90,overflowY:"auto"}}>{log.map((l,i)=><div key={i} style={{fontSize:"0.8rem",color:i===0?"#fff":"#64748b"}}>{l}</div>)}</div>
  </div>
  {phase==="win"&&<Overlay accent={accent} msg="Victory! 🏆" sub="The enemy castle has fallen!" onStart={restart} restart/>}
  {phase==="lose"&&<Overlay accent={accent} msg="Defeated! 🏚️" sub="Your castle was destroyed" onStart={restart} restart/>}
  </GameUI>);
}

/* ── 8. Phantom Hunt (click the ghosts) ─────────── */
function PhantomHunt({ accent }: { accent: string }) {
  const state=useRef({ghosts:[] as {x:number;y:number;r:number;vx:number;vy:number;alpha:number;growing:boolean}[],score:0,misses:0,over:false,started:false,spawnT:0,t:0});
  const [ui,setUi]=useState({score:0,misses:0,over:false,started:false});
  const reset=useCallback(()=>{const s=state.current;Object.assign(s,{ghosts:[],score:0,misses:0,over:false,started:true,spawnT:0,t:0});setUi({score:0,misses:0,over:false,started:true});},[]);
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt;s.spawnT-=dt;
    if(s.spawnT<=0){s.ghosts.push({x:50+Math.random()*(W-100),y:50+Math.random()*(H-100),r:20+Math.random()*20,vx:(Math.random()-0.5)*40,vy:(Math.random()-0.5)*40,alpha:0,growing:true});s.spawnT=Math.max(0.5,1.8-s.t*0.03);}
    const faded:number[]=[];
    for(let i=0;i<s.ghosts.length;i++){const g=s.ghosts[i];g.x+=g.vx*dt;g.y+=g.vy*dt;g.x=Math.max(g.r,Math.min(W-g.r,g.x));g.y=Math.max(g.r,Math.min(H-g.r,g.y));if(g.growing){g.alpha+=dt*0.8;if(g.alpha>=1){g.alpha=1;g.growing=false;}}else{g.alpha-=dt*0.4;if(g.alpha<=0){faded.push(i);s.misses++;if(s.misses>=5){s.over=true;setUi(u=>({...u,over:true}));}setUi(u=>({...u,misses:s.misses}));}}}
    s.ghosts=s.ghosts.filter((_,i)=>!faded.includes(i));
    // BG
    ctx.fillStyle="#0a000f";ctx.fillRect(0,0,W,H);
    for(let i=0;i<30;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.1+0.05})`;ctx.beginPath();ctx.arc(Math.sin(i*37+s.t*0.1)*W/2+W/2,Math.cos(i*19+s.t*0.07)*H/2+H/2,1,0,Math.PI*2);ctx.fill();}
    for(const g of s.ghosts){ctx.save();ctx.globalAlpha=g.alpha;ctx.fillStyle="#c4b5fd";ctx.beginPath();ctx.arc(g.x,g.y-g.r*0.3,g.r,Math.PI,0);ctx.lineTo(g.x+g.r,g.y+g.r*0.4);for(let j=0;j<3;j++){const wx=(g.x+g.r)-(j+1)*(g.r*2/3.5);ctx.quadraticCurveTo(wx+g.r/3.5,g.y+g.r*0.8,wx,g.y+g.r*0.4);}ctx.lineTo(g.x-g.r,g.y+g.r*0.4);ctx.closePath();ctx.fill();ctx.fillStyle="#4c1d95";ctx.beginPath();ctx.arc(g.x-g.r*0.3,g.y-g.r*0.1,g.r*0.2,0,Math.PI*2);ctx.arc(g.x+g.r*0.3,g.y-g.r*0.1,g.r*0.2,0,Math.PI*2);ctx.fill();ctx.restore();}
  },(canvas)=>{
    const s=state.current;
    const click=(e:MouseEvent)=>{if(!s.started||s.over)return;const r=canvas.getBoundingClientRect();const mx=(e.clientX-r.left)*(canvas.width/r.width);const my=(e.clientY-r.top)*(canvas.height/r.height);let hit=false;s.ghosts=s.ghosts.filter(g=>{if(Math.hypot(g.x-mx,g.y-my)<g.r+10){s.score++;setUi(u=>({...u,score:s.score}));hit=true;return false;}return true;});};
    canvas.addEventListener("click",click);return()=>canvas.removeEventListener("click",click);
  });
  return(<GameUI accent={accent}><HUD><span>👻 Score: {ui.score}</span><span>❌ Misses: {ui.misses}/5</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%",cursor:"crosshair"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Click the ghosts before they vanish!</div>{!ui.started&&<Overlay accent={accent} msg="Phantom Hunt" sub="Click ghosts before they disappear!" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Haunted! Score: ${ui.score}`} sub="Too many ghosts escaped" onStart={reset} restart/>}</GameUI>);
}

/* ── 9. Pixel Depths (dig for treasure) ─────────── */
function PixelDepths({ accent }: { accent: string }) {
  const COLS=20,ROWS=12;
  const makeGrid=()=>Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>{if(r===0)return{type:"air",revealed:true};const v=Math.random();if(r<2)return{type:v<0.05?"gem":"dirt",revealed:false};if(r<5)return{type:v<0.08?"gold":v<0.15?"stone":"dirt",revealed:false};return{type:v<0.1?"gem":v<0.2?"gold":v<0.4?"stone":"dirt",revealed:false};}));
  const [grid,setGrid]=useState(makeGrid);
  const [score,setScore]=useState(0);const [digs,setDigs]=useState(60);const [over,setOver]=useState(false);
  const colors:Record<string,string>={air:"#0a0a0f",dirt:"#7c4a1a",stone:"#4a4a5a",gold:"#f59e0b",gem:"#7c3aed"};
  const dig=(r:number,c:number)=>{if(over||digs<=0)return;const cell=grid[r][c];if(cell.revealed||cell.type==="air")return;setGrid(g=>{const ng=g.map(row=>[...row]);ng[r][c]={...ng[r][c],revealed:true};return ng;});let pts=0;if(cell.type==="gold")pts=10;if(cell.type==="gem")pts=25;if(pts>0)setScore(s=>s+pts);setDigs(d=>{const nd=d-1;if(nd<=0)setOver(true);return nd;});};
  const reset=()=>{setGrid(makeGrid());setScore(0);setDigs(60);setOver(false);};
  const cw=32,ch=32;
  return(<GameUI accent={accent}><HUD><span>⛏️ Score: {score}</span><span>Digs left: {digs}</span></HUD>
  <div style={{overflowX:"auto",padding:"0.5rem"}}>
  <div style={{display:"inline-grid",gridTemplateColumns:`repeat(${COLS},${cw}px)`,gap:1,background:"#000"}}>
    {grid.map((row,r)=>row.map((cell,c)=>{const emoji=cell.revealed&&cell.type==="gold"?"💰":cell.revealed&&cell.type==="gem"?"💎":"";return(<div key={`${r}-${c}`} onClick={()=>dig(r,c)} style={{width:cw,height:ch,background:cell.revealed?colors[cell.type]:"#5c3d1e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",cursor:!cell.revealed&&digs>0?"crosshair":"default",border:"1px solid rgba(0,0,0,0.3)",transition:"background 0.15s"}}>{emoji}</div>);}))}</div></div>
  <div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Click blocks to dig • Find 💰 gold (10pts) and 💎 gems (25pts)</div>
  {over&&<Overlay accent={accent} msg={`Digging done! Score: ${score}`} sub="Your picks are worn out" onStart={reset} restart/>}
  </GameUI>);
}

/* ── 10. Iron Fist (fighting) ───────────────────── */
function IronFist({ accent }: { accent: string }) {
  const [pHp,setPHp]=useState(100);const [eHp,setEHp]=useState(100);const [phase,setPhase]=useState<"player"|"enemy"|"win"|"lose">("player");
  const [combo,setCombo]=useState(0);const [log,setLog]=useState<string[]>(["🥊 Fight!"]);const [round,setRound]=useState(1);
  const addLog=(m:string)=>setLog(l=>[m,...l].slice(0,5));
  const doAction=(type:"punch"|"kick"|"block"|"special")=>{
    if(phase!=="player")return;
    let dmg=0;let blocked=false;
    if(type==="punch"){dmg=Math.floor(Math.random()*8+6);setCombo(c=>c+1);}
    else if(type==="kick"){dmg=Math.floor(Math.random()*14+10);setCombo(c=>c+1);}
    else if(type==="special"&&combo>=3){dmg=Math.floor(Math.random()*20+18);setCombo(0);addLog("⚡ COMBO SPECIAL!");}
    else if(type==="block"){blocked=true;addLog("🛡️ You blocked!");}
    if(dmg>0){const newEHp=Math.max(0,eHp-dmg);setEHp(newEHp);addLog(`You hit for ${dmg}!`);if(newEHp<=0){setPhase("win");return;}}
    setPhase("enemy");
    setTimeout(()=>{
      const eDmg=blocked?Math.floor(Math.random()*3):Math.floor(Math.random()*12+8);
      const newPHp=Math.max(0,pHp-eDmg);setPHp(newPHp);addLog(blocked?`Enemy hits for ${eDmg} (blocked!)`:`Enemy hits for ${eDmg}!`);
      if(newPHp<=0){setPhase("lose");}else setPhase("player");
    },600);
  };
  const nextRound=()=>{setRound(r=>r+1);setPHp(p=>Math.min(100,p+20));setEHp(80+round*20);setPhase("player");setCombo(0);addLog(`🔔 Round ${round+1} begins!`);};
  const restart=()=>{setPHp(100);setEHp(100);setPhase("player");setCombo(0);setLog(["🥊 Fight!"]);setRound(1);};
  return(<GameUI accent={accent}><HUD><span>🥊 Round {round}</span><span>⚡ Combo: {combo}{combo>=3?" 🔥":""}</span></HUD>
  <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"0.5rem",alignItems:"center",textAlign:"center"}}>
      <div><div style={{fontSize:"2.5rem"}}>🥷</div><div style={{fontSize:"0.8rem",color:"#94a3b8"}}>You</div><div style={{background:"#1e1e2e",height:10,borderRadius:4}}><div style={{height:"100%",width:`${pHp}%`,background:"#10b981",borderRadius:4,transition:"width 0.3s"}}/></div><div style={{fontSize:"0.8rem",color:"#fff"}}>{pHp} HP</div></div>
      <div style={{fontSize:"1.5rem",color:"#f59e0b",fontWeight:900}}>VS</div>
      <div><div style={{fontSize:"2.5rem"}}>🥊</div><div style={{fontSize:"0.8rem",color:"#94a3b8"}}>Enemy</div><div style={{background:"#1e1e2e",height:10,borderRadius:4}}><div style={{height:"100%",width:`${eHp}%`,background:"#ef4444",borderRadius:4,transition:"width 0.3s"}}/></div><div style={{fontSize:"0.8rem",color:"#fff"}}>{eHp} HP</div></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
      <Btn accent={accent} onClick={()=>doAction("punch")} disabled={phase!=="player"}>👊 Punch</Btn>
      <Btn accent="#f59e0b" onClick={()=>doAction("kick")} disabled={phase!=="player"}>🦵 Kick</Btn>
      <Btn accent="#10b981" onClick={()=>doAction("block")} disabled={phase!=="player"}>🛡️ Block</Btn>
      <Btn accent={combo>=3?"#ec4899":"#333"} onClick={()=>doAction("special")} disabled={phase!=="player"||combo<3}>⚡ Special {combo>=3?"(READY)":"("+combo+"/3)"}</Btn>
    </div>
    <div style={{background:"#0a0a0f",borderRadius:8,padding:"0.5rem",maxHeight:90,overflowY:"auto"}}>{log.map((l,i)=><div key={i} style={{fontSize:"0.8rem",color:i===0?"#fff":"#64748b"}}>{l}</div>)}</div>
  </div>
  {phase==="win"&&eHp<=0&&<Overlay accent={accent} msg="KO! 🏆" sub="Enemy defeated!" onStart={nextRound} restart/>}
  {phase==="lose"&&<Overlay accent={accent} msg="Down! 💀" sub="You were knocked out" onStart={restart} restart/>}
  </GameUI>);
}

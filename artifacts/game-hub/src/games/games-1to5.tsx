import { useRef, useState, useEffect, useCallback } from "react";
import { useCanvas } from "./useCanvas";
import { GameUI, Btn, HUD } from "./GameUI";

interface Props { name: string; accent: string; }
export default function Games1to5({ name, accent }: Props) {
  if (name === "ShadowBlade") return <ShadowBlade accent={accent} />;
  if (name === "CosmicDrift") return <CosmicDrift accent={accent} />;
  if (name === "MindMaze") return <MindMaze accent={accent} />;
  if (name === "TurboRush") return <TurboRush accent={accent} />;
  return <VerdantQuest accent={accent} />;
}

/* ── 1. Shadow Blade ─────────────────────────────── */
function ShadowBlade({ accent }: { accent: string }) {
  const state = useRef({
    px: 80, py: 280, vx: 0, vy: 0, onGround: false, slashing: false, slashT: 0,
    enemies: [] as { x: number; y: number; hp: number; vx: number; hit: number }[],
    score: 0, lives: 3, spawnT: 0, over: false, started: false, particles: [] as { x:number;y:number;vx:number;vy:number;t:number;c:string }[],
    keys: {} as Record<string, boolean>,
  });
  const [ui, setUi] = useState({ score: 0, lives: 3, over: false, started: false });

  const reset = useCallback(() => {
    const s = state.current;
    s.px=80; s.py=280; s.vx=0; s.vy=0; s.onGround=false; s.slashing=false; s.slashT=0;
    s.enemies=[]; s.score=0; s.lives=3; s.spawnT=0; s.over=false; s.started=true;
    s.particles=[];
    setUi({ score:0, lives:3, over:false, started:true });
  }, []);

  const canvasRef = useCanvas((ctx, dt) => {
    const s = state.current;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const ground = H - 80;

    if (!s.started || s.over) return;

    // Input
    if (s.keys["ArrowLeft"] || s.keys["a"]) s.vx = -180;
    else if (s.keys["ArrowRight"] || s.keys["d"]) s.vx = 180;
    else s.vx *= 0.8;
    if ((s.keys["ArrowUp"] || s.keys["w"] || s.keys[" "]) && s.onGround) { s.vy = -500; s.onGround = false; }
    s.vy += 900 * dt;
    s.px += s.vx * dt; s.py += s.vy * dt;
    s.px = Math.max(20, Math.min(W - 20, s.px));
    if (s.py >= ground) { s.py = ground; s.vy = 0; s.onGround = true; }
    if (s.slashing) { s.slashT -= dt; if (s.slashT <= 0) s.slashing = false; }

    // Spawn enemies
    s.spawnT -= dt;
    if (s.spawnT <= 0) {
      s.enemies.push({ x: W + 30, y: ground, hp: 2, vx: -(80 + s.score * 2), hit: 0 });
      s.spawnT = Math.max(0.6, 2 - s.score * 0.05);
    }

    // Update enemies
    for (const e of s.enemies) {
      e.x += e.vx * dt;
      if (e.hit > 0) e.hit -= dt;
      // Slash collision
      if (s.slashing && Math.abs(e.x - s.px) < 80 && Math.abs(e.y - s.py) < 60) {
        e.hp -= 1; e.hit = 0.2;
        for (let i=0;i<8;i++) s.particles.push({ x:e.x, y:e.y-20, vx:(Math.random()-0.5)*200, vy:-Math.random()*200, t:0.5, c:"#ff4444" });
      }
      // Touch damage
      if (!s.slashing && Math.abs(e.x - s.px) < 30 && Math.abs(e.y - s.py) < 40) {
        s.lives--; e.x = W + 100;
        setUi(u => ({ ...u, lives: s.lives }));
        if (s.lives <= 0) { s.over = true; setUi(u => ({ ...u, over: true })); }
      }
    }
    s.enemies = s.enemies.filter(e => e.hp > 0 && e.x > -50);

    // Particles
    for (const p of s.particles) { p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=300*dt; p.t-=dt; }
    s.particles = s.particles.filter(p => p.t > 0);

    // Draw bg
    const grd = ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,"#0a0010"); grd.addColorStop(1,"#1a0030");
    ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);
    // Ground
    ctx.fillStyle = "#2d1b4e";
    ctx.fillRect(0, ground+40, W, H);
    ctx.fillStyle = "#4a2d7a";
    ctx.fillRect(0, ground+38, W, 4);

    // Enemies
    for (const e of s.enemies) {
      ctx.fillStyle = e.hit > 0 ? "#ff8888" : "#cc2244";
      ctx.fillRect(e.x-18, e.y-40, 36, 40);
      ctx.fillStyle="#ff4477"; ctx.fillRect(e.x-12,e.y-52,24,16);
      // HP
      ctx.fillStyle="#333"; ctx.fillRect(e.x-18,e.y-58,36,5);
      ctx.fillStyle="#f00"; ctx.fillRect(e.x-18,e.y-58,18*e.hp,5);
    }

    // Player
    ctx.fillStyle = s.slashing ? "#ffdd44" : "#7c3aed";
    ctx.fillRect(s.px-16, s.py-50, 32, 50);
    ctx.fillStyle="#9d60ff"; ctx.fillRect(s.px-10,s.py-62,20,16);
    // Sword
    if (s.slashing) {
      ctx.strokeStyle="#ffdd44"; ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(s.px+10,s.py-40); ctx.lineTo(s.px+80,s.py-40); ctx.stroke();
    } else {
      ctx.strokeStyle="#aaa"; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(s.px+10,s.py-30); ctx.lineTo(s.px+35,s.py-50); ctx.stroke();
    }

    // Particles
    for (const p of s.particles) {
      ctx.globalAlpha = p.t; ctx.fillStyle=p.c;
      ctx.fillRect(p.x-3,p.y-3,6,6);
    }
    ctx.globalAlpha=1;
  }, (canvas) => {
    const s = state.current;
    const kd = (e: KeyboardEvent) => { s.keys[e.key]=true; if (e.key==="f"||e.key==="j"||e.key==="z") { s.slashing=true; s.slashT=0.25; const scored=s.enemies.filter(en=>Math.abs(en.x-s.px)<80&&Math.abs(en.y-s.py)<60); if(scored.length){s.score+=scored.length;setUi(u=>({...u,score:s.score}));} } };
    const ku = (e: KeyboardEvent) => { delete s.keys[e.key]; };
    window.addEventListener("keydown",kd); window.addEventListener("keyup",ku);
    return () => { window.removeEventListener("keydown",kd); window.removeEventListener("keyup",ku); };
  }, []);

  return (
    <GameUI accent={accent}>
      <HUD><span>⚔️ Score: {ui.score}</span><span>❤️ x{ui.lives}</span></HUD>
      <canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%"}} />
      <div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Arrow keys / WASD to move, F/J/Z to slash</div>
      {!ui.started && <Overlay accent={accent} msg="Shadow Blade" sub="Arrow keys to move · F to slash" onStart={reset}/>}
      {ui.over && <Overlay accent={accent} msg={`Game Over! Score: ${ui.score}`} sub="You were defeated" onStart={reset} restart/>}
    </GameUI>
  );
}

/* ── 2. Cosmic Drift ─────────────────────────────── */
function CosmicDrift({ accent }: { accent: string }) {
  const state = useRef({ sx:200,sy:190,speed:120,asteroids:[] as {x:number;y:number;r:number;vx:number;vy:number}[], stars:[] as {x:number;y:number;s:number}[], score:0,over:false,started:false,t:0,spawnT:0,boost:false,keys:{} as Record<string,boolean> });
  const [ui,setUi]=useState({score:0,over:false,started:false});
  const reset=useCallback(()=>{const s=state.current;s.sx=200;s.sy=190;s.speed=120;s.asteroids=[];s.score=0;s.over=false;s.started=true;s.t=0;s.spawnT=0;s.stars=Array.from({length:60},()=>({x:Math.random()*640,y:Math.random()*380,s:Math.random()*2+0.5}));setUi({score:0,over:false,started:true});},[]);
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current; const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt; s.score=Math.floor(s.t*10);
    // Input
    const spd=s.keys["Shift"]?220:130;
    if(s.keys["ArrowUp"]||s.keys["w"])s.sy-=spd*dt;
    if(s.keys["ArrowDown"]||s.keys["s"])s.sy+=spd*dt;
    if(s.keys["ArrowLeft"]||s.keys["a"])s.sx-=spd*dt;
    if(s.keys["ArrowRight"]||s.keys["d"])s.sx+=spd*dt;
    s.sx=Math.max(16,Math.min(W-16,s.sx)); s.sy=Math.max(16,Math.min(H-16,s.sy));
    // Spawn
    s.spawnT-=dt;
    if(s.spawnT<=0){const side=Math.floor(Math.random()*4);let ax=0,ay=0;if(side===0){ax=Math.random()*W;ay=-30;}else if(side===1){ax=W+30;ay=Math.random()*H;}else if(side===2){ax=Math.random()*W;ay=H+30;}else{ax=-30;ay=Math.random()*H;}const ang=Math.atan2(H/2-ay,W/2-ax);const spd2=60+s.t*5;s.asteroids.push({x:ax,y:ay,r:12+Math.random()*18,vx:Math.cos(ang)*spd2,vy:Math.sin(ang)*spd2});s.spawnT=Math.max(0.3,1.2-s.t*0.02);}
    for(const a of s.asteroids){a.x+=a.vx*dt;a.y+=a.vy*dt;if(Math.hypot(a.x-s.sx,a.y-s.sy)<a.r+12){s.over=true;setUi(u=>({...u,over:true,score:s.score}));}}
    s.asteroids=s.asteroids.filter(a=>a.x>-60&&a.x<W+60&&a.y>-60&&a.y<H+60);
    // BG
    ctx.fillStyle="#000010";ctx.fillRect(0,0,W,H);
    for(const st of s.stars){ctx.fillStyle=`rgba(255,255,255,${0.3+Math.sin(s.t+st.x)*0.2})`;ctx.beginPath();ctx.arc(st.x,st.y,st.s,0,Math.PI*2);ctx.fill();}
    // Asteroids
    for(const a of s.asteroids){ctx.fillStyle="#6b4e2a";ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#8b6e4a";ctx.lineWidth=2;ctx.stroke();}
    // Ship
    const tx=s.sx,ty=s.sy;
    ctx.save();ctx.translate(tx,ty);
    ctx.fillStyle="#06b6d4";ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(-12,14);ctx.lineTo(0,8);ctx.lineTo(12,14);ctx.closePath();ctx.fill();
    ctx.fillStyle="#0ea5e9";ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(-6,4);ctx.lineTo(0,1);ctx.lineTo(6,4);ctx.closePath();ctx.fill();
    ctx.restore();
    setUi(u=>({...u,score:s.score}));
  },(canvas)=>{const s=state.current;const kd=(e:KeyboardEvent)=>{s.keys[e.key]=true;};const ku=(e:KeyboardEvent)=>{delete s.keys[e.key];};window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);return()=>{window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};});
  return(<GameUI accent={accent}><HUD><span>🚀 Score: {ui.score}</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Arrow keys / WASD to dodge asteroids</div>{!ui.started&&<Overlay accent={accent} msg="Cosmic Drift" sub="Dodge asteroids · Arrow keys to fly" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Destroyed! Score: ${ui.score}`} sub="You were hit by an asteroid" onStart={reset} restart/>}</GameUI>);
}

/* ── 3. Mind Maze (15-puzzle) ───────────────────── */
function MindMaze({ accent }: { accent: string }) {
  const makeBoard=()=>{const t=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];for(let i=t.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[t[i],t[j]]=[t[j],t[i]];}return t;};
  const [board,setBoard]=useState<number[]>(makeBoard);
  const [moves,setMoves]=useState(0);
  const [won,setWon]=useState(false);
  const check=(b:number[])=>b.every((v,i)=>v===(i===15?0:i+1));
  const move=(idx:number)=>{if(won)return;setBoard(prev=>{const b=[...prev];const empty=b.indexOf(0);const r=Math.floor(idx/4),c=idx%4,er=Math.floor(empty/4),ec=empty%4;if(Math.abs(r-er)+Math.abs(c-ec)!==1)return prev;[b[idx],b[empty]]=[b[empty],b[idx]];const w=check(b);if(w)setWon(true);return b;});setMoves(m=>m+1);};
  const reset=()=>{setBoard(makeBoard());setMoves(0);setWon(false);};
  return(<GameUI accent={accent}><HUD><span>🧩 Moves: {moves}</span>{won&&<span style={{color:"#10b981"}}>🎉 Solved!</span>}</HUD><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,maxWidth:320,margin:"0 auto",padding:"1rem"}}>{board.map((val,i)=>(<button key={i} onClick={()=>move(i)} style={{height:72,fontSize:val===0?"0":"1.4rem",fontWeight:700,background:val===0?"#0a0a0f":accent,color:"white",border:`2px solid ${val===0?"#1e1e2e":accent}`,borderRadius:10,cursor:val===0?"default":"pointer",transition:"all 0.15s",opacity:val===0?0.2:1,boxShadow:val===0?"none":`0 0 10px ${accent}44`}}>{val||""}</button>))}</div><Btn accent={accent} onClick={reset}>🔀 Shuffle</Btn>{won&&<Overlay accent={accent} msg={`Solved in ${moves} moves!`} sub="Impressive!" onStart={reset} restart/>}</GameUI>);
}

/* ── 4. Turbo Rush ──────────────────────────────── */
function TurboRush({ accent }: { accent: string }) {
  const state=useRef({px:200,lane:1,cars:[] as {x:number;lane:number;spd:number}[],score:0,speed:200,over:false,started:false,spawnT:0,changeCooldown:0,t:0,roadY:0,keys:{} as Record<string,boolean>});
  const [ui,setUi]=useState({score:0,over:false,started:false});
  const reset=useCallback(()=>{const s=state.current;s.px=200;s.lane=1;s.cars=[];s.score=0;s.speed=200;s.over=false;s.started=true;s.spawnT=0;s.t=0;s.changeCooldown=0;s.roadY=0;setUi({score:0,over:false,started:true});},[]);
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt;s.score=Math.floor(s.t*15);s.speed=Math.min(500,200+s.t*20);
    s.roadY=(s.roadY+s.speed*dt)%80;
    if(s.changeCooldown>0)s.changeCooldown-=dt;
    const lanes=[W/2-100,W/2,W/2+100];
    if((s.keys["ArrowLeft"]||s.keys["a"])&&s.lane>0&&s.changeCooldown<=0){s.lane--;s.changeCooldown=0.25;}
    if((s.keys["ArrowRight"]||s.keys["d"])&&s.lane<2&&s.changeCooldown<=0){s.lane++;s.changeCooldown=0.25;}
    s.px+=(lanes[s.lane]-s.px)*8*dt;
    s.spawnT-=dt;
    if(s.spawnT<=0){const l=Math.floor(Math.random()*3);s.cars.push({x:lanes[l],lane:l,spd:s.speed*0.6+Math.random()*40});s.spawnT=Math.max(0.4,1.4-s.t*0.015);}
    for(const c of s.cars)c.x+=0,c.lane=c.lane,s.roadY;
    const relSpeed=s.speed;
    for(const c of s.cars){(c as {y?:number}).y=((c as {y?:number}).y??-60)+relSpeed*dt;if(Math.abs((c as {y?:number}).y!-H+120)<50&&Math.abs(c.x-s.px)<36){s.over=true;setUi(u=>({...u,over:true,score:s.score}));}}
    s.cars=s.cars.filter(c=>(c as {y?:number}).y!<H+80);
    // BG
    ctx.fillStyle="#1a1a1a";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#2d2d2d";ctx.fillRect(W/2-120,0,240,H);
    // Road markings
    for(let y=-80+s.roadY;y<H+80;y+=80){ctx.fillStyle="#f59e0b";ctx.fillRect(W/2-2,y,4,40);}
    ctx.fillStyle="#fff";ctx.fillRect(W/2-110,0,4,H);ctx.fillRect(W/2+106,0,4,H);
    // Enemy cars
    for(const c of s.cars){const cy=(c as {y?:number}).y!;ctx.fillStyle="#cc2244";ctx.fillRect(c.x-22,cy-40,44,80);ctx.fillStyle="#ff6688";ctx.fillRect(c.x-16,cy-36,32,20);ctx.fillStyle="#ffcc44";ctx.fillRect(c.x-22,cy-40,10,8);ctx.fillRect(c.x+12,cy-40,10,8);}
    // Player car
    const py=H-120;
    ctx.fillStyle=accent;ctx.fillRect(s.px-22,py-40,44,80);
    ctx.fillStyle="#fff";ctx.fillRect(s.px-16,py-36,32,20);
    ctx.fillStyle="#ffff00";ctx.fillRect(s.px-22,py-40,10,8);ctx.fillRect(s.px+12,py-40,10,8);
    setUi(u=>({...u,score:s.score}));
  },(canvas)=>{const s=state.current;const kd=(e:KeyboardEvent)=>{s.keys[e.key]=true;};const ku=(e:KeyboardEvent)=>{delete s.keys[e.key];};window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);return()=>{window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};});
  return(<GameUI accent={accent}><HUD><span>🏎️ Score: {ui.score}</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>A/D or Arrow Left/Right to change lanes</div>{!ui.started&&<Overlay accent={accent} msg="Turbo Rush" sub="Change lanes to avoid cars" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Crash! Score: ${ui.score}`} sub="Better luck next time!" onStart={reset} restart/>}</GameUI>);
}

/* ── 5. Verdant Quest (turn-based RPG) ──────────── */
const ENEMIES_RPG=[{name:"Goblin",hp:30,atk:[4,10],xp:20,emoji:"👺"},{name:"Orc",hp:60,atk:[8,16],xp:45,emoji:"👹"},{name:"Dragon",hp:120,atk:[15,30],xp:100,emoji:"🐉"}];
function VerdantQuest({ accent }: { accent: string }) {
  const [pHp,setPHp]=useState(100);const [pMaxHp]=useState(100);const [pAtk]=useState([10,20]);const [pDef]=useState(5);
  const [xp,setXp]=useState(0);const [level,setLevel]=useState(1);
  const [enemyI,setEnemyI]=useState(0);const [eHp,setEHp]=useState(ENEMIES_RPG[0].hp);
  const [log,setLog]=useState<string[]>(["⚔️ A Goblin appears!"]);
  const [phase,setPhase]=useState<"player"|"enemy"|"win"|"lose">("player");
  const addLog=(msg:string)=>setLog(l=>[msg,...l].slice(0,6));
  const enemy=ENEMIES_RPG[Math.min(enemyI,ENEMIES_RPG.length-1)];
  const nextEnemy=(currentXp:number)=>{const ni=Math.min(enemyI+1,ENEMIES_RPG.length-1);setEnemyI(ni);const ne=ENEMIES_RPG[ni];setEHp(ne.hp);addLog(`⚔️ A ${ne.name} appears!`);if(ni===enemyI)addLog("👑 All enemies defeated! You WIN!");};
  const attack=()=>{if(phase!=="player")return;const dmg=Math.floor(Math.random()*(pAtk[1]-pAtk[0])+pAtk[0]);const newEHp=Math.max(0,eHp-dmg);setEHp(newEHp);addLog(`You hit ${enemy.name} for ${dmg} damage!`);if(newEHp<=0){const gained=enemy.xp;const newXp=xp+gained;setXp(newXp);addLog(`✨ ${enemy.name} defeated! +${gained}XP`);if(newXp>=level*50){setLevel(l=>l+1);addLog("⬆️ Level Up!");}setPhase("win");setTimeout(()=>{nextEnemy(newXp);setPhase("player");},1000);}else{setPhase("enemy");setTimeout(()=>{const edm=Math.max(0,Math.floor(Math.random()*(enemy.atk[1]-enemy.atk[0])+enemy.atk[0])-pDef);const newPHp=Math.max(0,pHp-edm);setPHp(newPHp);addLog(`${enemy.name} attacks for ${edm} damage!`);if(newPHp<=0)setPhase("lose");else setPhase("player");},700);}};
  const heal=()=>{if(phase!=="player")return;const h=Math.floor(Math.random()*15+10);setPHp(p=>Math.min(pMaxHp,p+h));addLog(`💚 You heal ${h} HP`);setPhase("enemy");setTimeout(()=>{const edm=Math.max(0,Math.floor(Math.random()*(enemy.atk[1]-enemy.atk[0])+enemy.atk[0])-pDef);const newPHp=Math.max(0,pHp-edm);setPHp(newPHp);addLog(`${enemy.name} attacks for ${edm} damage!`);if(newPHp<=0)setPhase("lose");else setPhase("player");},700);};
  const restart=()=>{setPHp(100);setXp(0);setLevel(1);setEnemyI(0);setEHp(ENEMIES_RPG[0].hp);setLog(["⚔️ A Goblin appears!"]);setPhase("player");};
  const eMax=enemy.hp;
  return(<GameUI accent={accent}><HUD><span>Lv.{level} Hero</span><span>⭐ {xp}XP</span></HUD>
  <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
    <div style={{background:"#0a0a0f",borderRadius:12,padding:"1rem",textAlign:"center",fontSize:"3rem"}}>{enemy.emoji}<div style={{fontSize:"1rem",fontWeight:700,color:accent}}>{enemy.name}</div><Bar value={eHp} max={eMax} color="#ef4444"/><div style={{fontSize:"0.75rem",color:"#94a3b8"}}>{eHp}/{eMax} HP</div></div>
    <div style={{display:"flex",gap:"0.5rem",justifyContent:"center"}}>
      <Btn accent={accent} onClick={attack} disabled={phase!=="player"}>⚔️ Attack</Btn>
      <Btn accent="#10b981" onClick={heal} disabled={phase!=="player"}>💚 Heal</Btn>
    </div>
    <div style={{background:"#0a0a0f",borderRadius:8,padding:"0.75rem"}}><Bar value={pHp} max={pMaxHp} color="#10b981"/><div style={{fontSize:"0.75rem",color:"#94a3b8",marginTop:"4px"}}>Hero: {pHp}/{pMaxHp} HP</div></div>
    <div style={{background:"#0a0a0f",borderRadius:8,padding:"0.5rem",maxHeight:100,overflowY:"auto"}}>{log.map((l,i)=><div key={i} style={{fontSize:"0.8rem",color:i===0?"#fff":"#64748b",padding:"1px 0"}}>{l}</div>)}</div>
  </div>
  {phase==="lose"&&<Overlay accent={accent} msg="Defeated!" sub="Your quest ends here…" onStart={restart} restart/>}
  </GameUI>);
}

function Bar({value,max,color}:{value:number;max:number;color:string}){return(<div style={{background:"#1e1e2e",borderRadius:4,height:8,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.max(0,value/max*100)}%`,background:color,transition:"width 0.3s"}}></div></div>);}

// Shared helpers
export function Overlay({accent,msg,sub,onStart,restart}:{accent:string;msg:string;sub:string;onStart:()=>void;restart?:boolean}){return(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem",borderRadius:"0 0 12px 12px"}}><div style={{fontSize:"1.4rem",fontWeight:800,color:"#fff",textAlign:"center"}}>{msg}</div><div style={{color:"#94a3b8",fontSize:"0.9rem"}}>{sub}</div><button onClick={onStart} style={{padding:"0.6rem 1.6rem",background:accent,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:"1rem",cursor:"pointer"}}>{restart?"▶ Play Again":"▶ Play"}</button></div>);}

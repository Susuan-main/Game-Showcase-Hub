import { useRef, useState, useCallback } from "react";
import { useCanvas } from "./useCanvas";
import { GameUI, Btn, HUD } from "./GameUI";
import { Overlay } from "./games-1to5";

interface Props { name: string; accent: string; }
export default function Games16to20({ name, accent }: Props) {
  if (name === "DragonSiege") return <DragonSiege accent={accent} />;
  if (name === "StarForge") return <StarForge accent={accent} />;
  if (name === "ProLeague") return <ProLeague accent={accent} />;
  if (name === "DarkAgency") return <DarkAgency accent={accent} />;
  return <OceanDepths accent={accent} />;
}

/* ── 16. Dragon Siege (fly & shoot fireballs) ────── */
function DragonSiege({ accent }: { accent: string }) {
  const state=useRef({dy:190,vy:0,fireballs:[] as {x:number;y:number}[],castles:[] as {x:number;y:number;hp:number;hit:number}[],score:0,lives:3,over:false,started:false,spawnT:0,shootCooldown:0,t:0,keys:{} as Record<string,boolean>,particles:[] as {x:number;y:number;vx:number;vy:number;t:number;c:string}[]});
  const [ui,setUi]=useState({score:0,lives:3,over:false,started:false});
  const reset=useCallback(()=>{const s=state.current;Object.assign(s,{dy:190,vy:0,fireballs:[],castles:[],score:0,lives:3,over:false,started:true,spawnT:0,shootCooldown:0,t:0,particles:[]});setUi({score:0,lives:3,over:false,started:true});},[]);
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt;
    if(s.keys[" "]||s.keys["ArrowUp"]||s.keys["w"])s.vy-=600*dt;
    s.vy+=400*dt;s.dy+=s.vy*dt;s.dy=Math.max(30,Math.min(H-30,s.dy));
    if(s.dy>=H-30||s.dy<=30)s.vy*=-0.3;
    s.shootCooldown-=dt;
    if((s.keys["f"]||s.keys["z"]||s.keys["x"])&&s.shootCooldown<=0){s.fireballs.push({x:120,y:s.dy});s.shootCooldown=0.35;}
    for(const f of s.fireballs)f.x+=350*dt;
    s.fireballs=s.fireballs.filter(f=>f.x<W+20);
    s.spawnT-=dt;
    if(s.spawnT<=0){const hp=2+Math.floor(s.t/8);s.castles.push({x:W+40,y:80+Math.random()*(H-160),hp,hit:0});s.spawnT=Math.max(0.8,2.5-s.t*0.04);}
    for(const c of s.castles){c.x-=(80+s.t*3)*dt;if(c.hit>0)c.hit-=dt;if(c.x<60){s.lives--;setUi(u=>({...u,lives:s.lives}));c.x=-999;if(s.lives<=0){s.over=true;setUi(u=>({...u,over:true}));}}for(const f of s.fireballs){if(Math.abs(f.x-c.x)<30&&Math.abs(f.y-c.y)<35){c.hp--;c.hit=0.2;f.x=9999;for(let i=0;i<8;i++)s.particles.push({x:c.x,y:c.y,vx:(Math.random()-0.5)*200,vy:-Math.random()*150,t:0.6,c:"#f97316"});if(c.hp<=0){s.score++;setUi(u=>({...u,score:s.score}));c.x=-999;}}}}
    s.castles=s.castles.filter(c=>c.x>-200);s.fireballs=s.fireballs.filter(f=>f.x<9998);
    for(const p of s.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.t-=dt;}s.particles=s.particles.filter(p=>p.t>0);
    // BG
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#1e0a2e");sky.addColorStop(1,"#3d1a6b");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // Clouds
    for(let i=0;i<5;i++){const cx=(i*130+s.t*20)%W;ctx.fillStyle="rgba(255,255,255,0.07)";ctx.beginPath();ctx.ellipse(cx,80+i*30,60,20,0,0,Math.PI*2);ctx.fill();}
    // Castles
    for(const c of s.castles){ctx.fillStyle=c.hit>0?"#888":"#555";ctx.fillRect(c.x-25,c.y-30,50,60);ctx.fillStyle="#666";ctx.fillRect(c.x-30,c.y-40,20,15);ctx.fillRect(c.x+10,c.y-40,20,15);ctx.fillStyle="#444";ctx.fillRect(c.x-5,c.y,10,20);ctx.fillStyle="#333";ctx.fillRect(c.x-22,c.y-42,8,5);ctx.fillRect(c.x+14,c.y-42,8,5);// HP
    ctx.fillStyle="#1e1e2e";ctx.fillRect(c.x-22,c.y-52,44,6);ctx.fillStyle="#ef4444";ctx.fillRect(c.x-22,c.y-52,44*(c.hp/(2+Math.floor(s.t/8))),6);}
    // Fireballs
    for(const f of s.fireballs){const grd=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,14);grd.addColorStop(0,"#fff");grd.addColorStop(0.3,"#f97316");grd.addColorStop(1,"transparent");ctx.fillStyle=grd;ctx.beginPath();ctx.arc(f.x,f.y,14,0,Math.PI*2);ctx.fill();}
    // Particles
    for(const p of s.particles){ctx.globalAlpha=p.t;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    // Dragon
    const dx=90,dy=s.dy;
    ctx.save();ctx.translate(dx,dy);
    ctx.fillStyle="#7c3aed";ctx.beginPath();ctx.ellipse(0,0,35,18,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#9d60ff";ctx.beginPath();ctx.ellipse(-28,0,18,12,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#6d28d9";ctx.beginPath();ctx.moveTo(10,-18);ctx.lineTo(30,-10);ctx.lineTo(5,-8);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(10,-18);ctx.lineTo(-10,-25);ctx.lineTo(-5,-8);ctx.closePath();ctx.fill();
    ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(38,0,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#1a0a2e";ctx.beginPath();ctx.arc(40,-1,3,0,Math.PI*2);ctx.fill();
    ctx.restore();
  },(canvas)=>{const s=state.current;const kd=(e:KeyboardEvent)=>{s.keys[e.key]=true;};const ku=(e:KeyboardEvent)=>{delete s.keys[e.key];};window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);return()=>{window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};});
  return(<GameUI accent={accent}><HUD><span>🐉 Score: {ui.score}</span><span>❤️ x{ui.lives}</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Space/↑ to flap · F/Z to breathe fire</div>{!ui.started&&<Overlay accent={accent} msg="Dragon Siege" sub="Space to flap · F to breathe fire" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Dragons fall! Score: ${ui.score}`} sub="The castles pushed through" onStart={reset} restart/>}</GameUI>);
}

/* ── 17. Star Forge (click to create solar systems) ─ */
function StarForge({ accent }: { accent: string }) {
  const state=useRef({bodies:[] as {x:number;y:number;vx:number;vy:number;mass:number;r:number;color:string;trail:number[][]}[],t:0,score:0});
  const [ui,setUi]=useState({score:0});
  const COLORS=["#f59e0b","#06b6d4","#7c3aed","#ec4899","#10b981","#ef4444","#fff","#fbbf24"];
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    s.t+=dt;
    // Gravity simulation
    for(let i=0;i<s.bodies.length;i++){for(let j=i+1;j<s.bodies.length;j++){const a=s.bodies[i],b=s.bodies[j];const dx=b.x-a.x,dy=b.y-a.y;const dist=Math.max(30,Math.hypot(dx,dy));const force=0.8*a.mass*b.mass/(dist*dist);const fx=force*dx/dist,fy=force*dy/dist;a.vx+=fx/a.mass*dt*60;a.vy+=fy/a.mass*dt*60;b.vx-=fx/b.mass*dt*60;b.vy-=fy/b.mass*dt*60;}s.bodies[i].trail.push([s.bodies[i].x,s.bodies[i].y]);if(s.bodies[i].trail.length>60)s.bodies[i].trail.shift();}
    for(const b of s.bodies){b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<-W)b.x=W;if(b.x>W*2)b.x=0;if(b.y<-H)b.y=H;if(b.y>H*2)b.y=0;}
    // BG
    ctx.fillStyle="#000010";ctx.fillRect(0,0,W,H);
    for(let i=0;i<60;i++){const sx=(i*137.5)%W,sy=(i*89.3)%H;ctx.fillStyle=`rgba(255,255,255,${0.1+Math.sin(s.t+i)*0.05})`;ctx.beginPath();ctx.arc(sx,sy,0.8,0,Math.PI*2);ctx.fill();}
    // Trails
    for(const b of s.bodies){if(b.trail.length<2)continue;ctx.beginPath();for(let i=0;i<b.trail.length;i++){if(i===0)ctx.moveTo(b.trail[i][0],b.trail[i][1]);else ctx.lineTo(b.trail[i][0],b.trail[i][1]);}ctx.strokeStyle=b.color+"44";ctx.lineWidth=1.5;ctx.stroke();}
    // Bodies
    for(const b of s.bodies){const grd=ctx.createRadialGradient(b.x-b.r*0.3,b.y-b.r*0.3,0,b.x,b.y,b.r);grd.addColorStop(0,"#fff");grd.addColorStop(0.3,b.color);grd.addColorStop(1,b.color+"44");ctx.fillStyle=grd;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();}
    setUi({score:s.bodies.length});
  },(canvas)=>{
    const s=state.current;
    const COLORS2=["#f59e0b","#06b6d4","#7c3aed","#ec4899","#10b981","#ef4444","#fff"];
    const click=(e:MouseEvent)=>{const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)*(canvas.width/r.width);const y=(e.clientY-r.top)*(canvas.height/r.height);const mass=2+Math.random()*8;const r2=4+mass*1.5;const vx=(Math.random()-0.5)*30;const vy=(Math.random()-0.5)*30;const color=COLORS2[Math.floor(Math.random()*COLORS2.length)];s.bodies.push({x,y,vx,vy,mass,r:r2,color,trail:[]});if(s.bodies.length>20)s.bodies.shift();};
    canvas.addEventListener("click",click);return()=>canvas.removeEventListener("click",click);
  });
  return(<GameUI accent={accent}><HUD><span>⭐ Bodies: {ui.score}</span><span>Click to spawn stars</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%",cursor:"crosshair"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Click anywhere to create stars — watch gravity pull them together</div></GameUI>);
}

/* ── 18. Pro League (penalty shootout) ──────────── */
function ProLeague({ accent }: { accent: string }) {
  const [goals,setGoals]=useState(0);const [saved,setSaved]=useState(0);const [phase,setPhase]=useState<"aim"|"flying"|"result">("aim");const [aim,setAim]=useState({x:320,y:190});const [ballPos,setBallPos]=useState({x:320,y:340});const [keeperX,setKeeperX]=useState(320);const [msg,setMsg]=useState("");const [shots,setShots]=useState(0);
  const shoot=()=>{if(phase!=="aim")return;setPhase("flying");const kx=220+Math.random()*200;setKeeperX(kx);const targetX=aim.x,targetY=aim.y;let t=0;const interval=setInterval(()=>{t+=0.05;setBallPos({x:320+(targetX-320)*t,y:340+(targetY-340)*t});if(t>=1){clearInterval(interval);const goalHalf=targetX<280||targetX>360||(targetX>280&&targetX<360&&targetY<160);const keeperSaves=Math.abs(kx-targetX)<50&&goalHalf;if(keeperSaves){setSaved(s=>s+1);setMsg("🧤 Saved!");}else if(goalHalf){setGoals(g=>g+1);setMsg("⚽ GOAL!");}else{setMsg("❌ Wide!");}setShots(s=>s+1);setTimeout(()=>{setBallPos({x:320,y:340});setPhase("aim");setMsg("");},1200);}},50);};
  const handleMove=(e:React.MouseEvent<SVGElement>)=>{if(phase!=="aim")return;const rect=e.currentTarget.getBoundingClientRect();setAim({x:(e.clientX-rect.left)*(640/rect.width),y:(e.clientY-rect.top)*(380/rect.height)});};
  return(<GameUI accent={accent}><HUD><span>⚽ Goals: {goals}</span><span>🧤 Saved: {saved}</span><span>Shots: {shots}</span></HUD>
  <div style={{position:"relative"}}>
    <svg width="100%" viewBox="0 0 640 380" style={{display:"block",cursor:phase==="aim"?"crosshair":"default"}} onMouseMove={handleMove} onClick={shoot}>
      {/* Pitch */}
      <rect width={640} height={380} fill="#2d5a1b"/><rect x={200} y={40} width={240} height={140} fill="none" stroke="#fff" strokeWidth={2}/><rect x={260} y={40} width={120} height={60} fill="none" stroke="#fff" strokeWidth={2}/><line x1={200} y1={190} x2={440} y2={190} stroke="#fff" strokeWidth={1}/><rect x={280} y={190} width={80} height={80} fill="none" stroke="#fff" strokeWidth={1} strokeDasharray="4"/>
      {/* Goal */}
      <rect x={240} y={40} width={160} height={90} fill="rgba(255,255,255,0.1)" stroke="#fff" strokeWidth={3}/><line x1={240} y1={40} x2={240} y2={130} stroke="#fff" strokeWidth={3}/><line x1={400} y1={40} x2={400} y2={130} stroke="#fff" strokeWidth={3}/><line x1={240} y1={40} x2={400} y2={40} stroke="#fff" strokeWidth={3}/>
      {/* Grid in goal */}
      {[280,320,360].map(x=><line key={x} x1={x} y1={40} x2={x} y2={130} stroke="rgba(255,255,255,0.3)" strokeWidth={1}/>)}{[80,110].map(y=><line key={y} x1={240} y1={y} x2={400} y2={y} stroke="rgba(255,255,255,0.3)" strokeWidth={1}/>)}
      {/* Keeper */}
      <g transform={`translate(${keeperX},110)`}><rect x={-16} y={-30} width={32} height={40} fill="#f59e0b" rx={4}/><circle cx={0} cy={-38} r={12} fill="#fbbf24"/></g>
      {/* Aim crosshair */}
      {phase==="aim"&&<g><circle cx={aim.x} cy={aim.y} r={20} fill="none" stroke="#ff4444" strokeWidth={2} strokeDasharray="5"/><line x1={aim.x-25} y1={aim.y} x2={aim.x+25} y2={aim.y} stroke="#ff4444" strokeWidth={1}/><line x1={aim.x} y1={aim.y-25} x2={aim.x} y2={aim.y+25} stroke="#ff4444" strokeWidth={1}/></g>}
      {/* Ball */}
      <circle cx={ballPos.x} cy={ballPos.y} r={12} fill="#fff"/><circle cx={ballPos.x+2} cy={ballPos.y-2} r={4} fill="#333"/>
      {/* Player */}
      <g transform="translate(320,350)"><rect x={-12} y={-30} width={24} height={35} fill={accent} rx={4}/><circle cx={0} cy={-36} r={10} fill="#fbbf24"/></g>
    </svg>
    {msg&&<div style={{position:"absolute",top:"40%",left:"50%",transform:"translate(-50%,-50%)",fontSize:"2rem",fontWeight:900,color:msg.includes("GOAL")?"#10b981":msg.includes("Saved")?"#ef4444":"#f59e0b",textShadow:"0 0 20px currentColor"}}>{msg}</div>}
  </div>
  <div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Move mouse to aim · Click to shoot at the goal</div>
  </GameUI>);
}

/* ── 19. Dark Agency (stealth grid) ─────────────── */
function DarkAgency({ accent }: { accent: string }) {
  const GRID=10,CELL=40;
  const makeLevel=()=>{const guards=[{x:7,y:2,dir:0},{x:2,y:7,dir:1},{x:5,y:5,dir:2}];return{px:0,py:0,guards,exits:{x:9,y:9},caught:false,won:false};};
  const [level,setLevel]=useState(makeLevel);const [moves,setMoves]=useState(0);const [over,setOver]=useState(false);const [won,setWon]=useState(false);
  const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
  const move=(dx:number,dy:number)=>{if(over||won)return;const nx=level.px+dx,ny=level.py+dy;if(nx<0||nx>=GRID||ny<0||ny>=GRID)return;// Move guards
  const newGuards=level.guards.map(g=>{const gd=DIRS[g.dir];let ngx=g.x+gd[0],ngy=g.y+gd[1];let nd=g.dir;if(ngx<0||ngx>=GRID||ngy<0||ngy>=GRID){nd=(g.dir+2)%4;ngx=g.x;ngy=g.y;}return{x:ngx,y:ngy,dir:nd};});
  const caught=newGuards.some(g=>g.x===nx&&g.y===ny);const w=nx===level.exits.x&&ny===level.exits.y;
  setLevel({...level,px:nx,py:ny,guards:newGuards,caught,won:w});setMoves(m=>m+1);if(caught)setOver(true);if(w)setWon(true);};
  const reset=()=>{setLevel(makeLevel());setMoves(0);setOver(false);setWon(false);};
  const GUARD_EMOJIS=["🕵️","👮","🚔"];
  return(<GameUI accent={accent}><HUD><span>🕵️ Moves: {moves}</span><span>Reach 🚪 Exit</span></HUD>
  <div style={{display:"flex",justifyContent:"center",padding:"0.5rem"}}>
  <div style={{display:"grid",gridTemplateColumns:`repeat(${GRID},${CELL}px)`,gap:1,background:"#000",userSelect:"none"}}>
    {Array.from({length:GRID*GRID},(_,i)=>{const x=i%GRID,y=Math.floor(i/GRID);const isPlayer=level.px===x&&level.py===y;const isGuard=level.guards.findIndex(g=>g.x===x&&g.y===y);const isExit=level.exits.x===x&&level.exits.y===y;const inSight=level.guards.some(g=>g.x===x&&g.y===y||Math.hypot(g.x-x,g.y-y)<2);return(<div key={i} style={{width:CELL,height:CELL,background:inSight?"#1a0a1a":"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",border:"1px solid #1e1e2e"}}>
      {isPlayer?"🥷":isExit?"🚪":isGuard>=0?GUARD_EMOJIS[isGuard]:""}
    </div>);})}
  </div>
  </div>
  <div style={{display:"flex",gap:"0.5rem",justifyContent:"center",marginTop:"4px"}}>
    <Btn accent={accent} onClick={()=>move(-1,0)}>←</Btn><Btn accent={accent} onClick={()=>move(0,-1)}>↑</Btn><Btn accent={accent} onClick={()=>move(0,1)}>↓</Btn><Btn accent={accent} onClick={()=>move(1,0)}>→</Btn>
  </div>
  <div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Avoid guards (highlighted zones) · Reach 🚪</div>
  {over&&<Overlay accent={accent} msg="Captured! 🚔" sub="A guard spotted you" onStart={reset} restart/>}
  {won&&<Overlay accent={accent} msg="Mission Complete! 🕵️" sub="You made it to the exit" onStart={reset} restart/>}
  </GameUI>);
}

/* ── 20. Ocean Depths (submarine dodge) ──────────── */
function OceanDepths({ accent }: { accent: string }) {
  const state=useRef({sy:190,vy:0,creatures:[] as {x:number;y:number;vy:number;r:number;type:number}[],pearls:[] as {x:number;y:number;r:number}[],score:0,depth:0,lives:3,over:false,started:false,spawnT:0,pearlT:0,t:0,keys:{} as Record<string,boolean>});
  const [ui,setUi]=useState({score:0,depth:0,lives:3,over:false,started:false});
  const reset=useCallback(()=>{const s=state.current;Object.assign(s,{sy:190,vy:0,creatures:[],pearls:[],score:0,depth:0,lives:3,over:false,started:true,spawnT:0,pearlT:0,t:0});setUi({score:0,depth:0,lives:3,over:false,started:true});},[]);
  const TYPES=["🐙","🦈","🐡","🦑","🐟"];
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt;s.depth=Math.floor(s.t*8);
    const spd=60+s.t*5;
    if(s.keys["ArrowUp"]||s.keys["w"])s.vy-=400*dt;
    if(s.keys["ArrowDown"]||s.keys["s"])s.vy+=400*dt;
    s.vy+=0;s.sy+=s.vy*dt;s.vy*=0.92;
    s.sy=Math.max(20,Math.min(H-20,s.sy));
    s.spawnT-=dt;
    if(s.spawnT<=0){const type=Math.floor(Math.random()*5);s.creatures.push({x:W+40,y:30+Math.random()*(H-60),vy:(Math.random()-0.5)*40,r:22,type});s.spawnT=Math.max(0.4,1.3-s.t*0.025);}
    s.pearlT-=dt;
    if(s.pearlT<=0){s.pearls.push({x:W+40,y:30+Math.random()*(H-60),r:8});s.pearlT=1.5;}
    for(const c of s.creatures){c.x-=spd*dt;c.y+=c.vy*dt;if(c.y<20||c.y>H-20)c.vy*=-1;if(Math.hypot(c.x-80,c.y-s.sy)<c.r+14){s.lives--;setUi(u=>({...u,lives:s.lives}));c.x=-999;if(s.lives<=0){s.over=true;setUi(u=>({...u,over:true}));}}}
    s.creatures=s.creatures.filter(c=>c.x>-100&&c.x>-999);
    for(const p of s.pearls){p.x-=spd*dt;if(Math.hypot(p.x-80,p.y-s.sy)<p.r+14){s.score+=10;setUi(u=>({...u,score:s.score}));p.x=-999;}}
    s.pearls=s.pearls.filter(p=>p.x>-100&&p.x>-999);
    // BG
    const grd=ctx.createLinearGradient(0,0,0,H);grd.addColorStop(0,"#0c4a6e");grd.addColorStop(1,"#082f49");ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
    // Bubbles
    for(let i=0;i<8;i++){const bx=(i*79+s.t*12)%W,by=(H-((i*53+s.t*25)%(H+20)));ctx.fillStyle="rgba(255,255,255,0.1)";ctx.beginPath();ctx.arc(bx,by,3,0,Math.PI*2);ctx.fill();}
    // Seaweed
    for(let i=0;i<6;i++){ctx.strokeStyle="#16a34a";ctx.lineWidth=3;ctx.beginPath();const sx=i*110;ctx.moveTo(sx,H);for(let j=0;j<5;j++)ctx.quadraticCurveTo(sx+(Math.sin(s.t+j)*15),H-j*20,sx,H-(j+1)*20);ctx.stroke();}
    // Pearls
    for(const p of s.pearls){ctx.fillStyle="#e2e8f0";ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(255,255,255,0.5)";ctx.beginPath();ctx.arc(p.x-3,p.y-3,3,0,Math.PI*2);ctx.fill();}
    // Creatures (emoji)
    for(const c of s.creatures){ctx.font=`${c.r*1.5}px serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(TYPES[c.type],c.x,c.y);}
    // Sub
    ctx.save();ctx.translate(80,s.sy);ctx.fillStyle=accent;ctx.beginPath();ctx.ellipse(0,0,30,14,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(10,-5,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#06b6d4";ctx.beginPath();ctx.arc(10,-5,4,0,Math.PI*2);ctx.fill();ctx.fillStyle=accent;ctx.fillRect(-30,-3,8,6);ctx.fillRect(28,-6,12,4);ctx.restore();
    setUi(u=>({...u,depth:s.depth}));
  },(canvas)=>{const s=state.current;const kd=(e:KeyboardEvent)=>{s.keys[e.key]=true;};const ku=(e:KeyboardEvent)=>{delete s.keys[e.key];};window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);return()=>{window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};});
  return(<GameUI accent={accent}><HUD><span>🌊 Score: {ui.score}</span><span>⬇️ {ui.depth}m</span><span>❤️ x{ui.lives}</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>↑↓ or W/S to navigate · Dodge creatures · Collect 🤍 pearls</div>{!ui.started&&<Overlay accent={accent} msg="Ocean Depths" sub="W/S or Arrow keys to dive" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Sunk! Score: ${ui.score}`} sub={`Reached ${ui.depth}m depth`} onStart={reset} restart/>}</GameUI>);
}

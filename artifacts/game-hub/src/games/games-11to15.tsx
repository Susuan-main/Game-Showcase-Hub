import { useRef, useState, useCallback } from "react";
import { useCanvas } from "./useCanvas";
import { GameUI, Btn, HUD } from "./GameUI";
import { Overlay } from "./games-1to5";

interface Props { name: string; accent: string; }
export default function Games11to15({ name, accent }: Props) {
  if (name === "SniperElite") return <SniperElite accent={accent} />;
  if (name === "DeadRising") return <DeadRising accent={accent} />;
  if (name === "WaveRider") return <WaveRider accent={accent} />;
  if (name === "ArcaneRising") return <ArcaneRising accent={accent} />;
  return <RailEmpire accent={accent} />;
}

/* ── 11. Sniper Elite (click targets) ────────────── */
function SniperElite({ accent }: { accent: string }) {
  const state=useRef({targets:[] as {x:number;y:number;r:number;vx:number;life:number;maxLife:number}[],score:0,misses:0,over:false,started:false,spawnT:0,t:0,scope:{x:320,y:190},breath:0});
  const [ui,setUi]=useState({score:0,misses:0,over:false,started:false});
  const reset=useCallback(()=>{const s=state.current;Object.assign(s,{targets:[],score:0,misses:0,over:false,started:true,spawnT:0,t:0,scope:{x:320,y:190},breath:0});setUi({score:0,misses:0,over:false,started:true});},[]);
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt;s.breath+=dt*1.5;
    const breathSway=Math.sin(s.breath)*6;
    s.spawnT-=dt;
    if(s.spawnT<=0){const side=Math.random()<0.5?-1:1;s.targets.push({x:side>0?-30:W+30,y:40+Math.random()*(H-80),r:16+Math.random()*12,vx:side*(30+Math.random()*60),life:3+Math.random()*2,maxLife:5});s.spawnT=Math.max(0.6,1.5-s.t*0.02);}
    const faded:number[]=[];
    for(let i=0;i<s.targets.length;i++){const t=s.targets[i];t.x+=t.vx*dt;t.life-=dt;if(t.life<=0||t.x<-60||t.x>W+60){faded.push(i);s.misses++;setUi(u=>({...u,misses:s.misses}));if(s.misses>=5){s.over=true;setUi(u=>({...u,over:true}));}}}
    s.targets=s.targets.filter((_,i)=>!faded.includes(i));
    // Draw bg - forest
    const grd=ctx.createLinearGradient(0,0,0,H);grd.addColorStop(0,"#1a2a0a");grd.addColorStop(1,"#0a1a05");ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
    for(let i=0;i<8;i++){ctx.fillStyle="#0d1f08";const tx=i*(W/7);ctx.beginPath();ctx.moveTo(tx,H);ctx.lineTo(tx+20,H*0.3);ctx.lineTo(tx+40,H);ctx.fill();}
    // Targets (soldiers)
    for(const t of s.targets){ctx.fillStyle=`rgba(200,50,50,${0.5+0.5*(t.life/t.maxLife)})`;ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.fill();ctx.fillStyle="#cc3333";ctx.beginPath();ctx.arc(t.x,t.y-t.r*1.4,t.r*0.6,0,Math.PI*2);ctx.fill();}
    // Scope overlay
    const cx=s.scope.x+breathSway,cy=s.scope.y+breathSway*0.5;
    ctx.fillStyle="rgba(0,0,0,0.7)";ctx.fillRect(0,0,W,H);
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,70,0,Math.PI*2);ctx.clip();ctx.clearRect(0,0,W,H);
    // Redraw in scope
    ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
    for(let i=0;i<8;i++){ctx.fillStyle="#0d1f08";const tx=i*(W/7);ctx.beginPath();ctx.moveTo(tx,H);ctx.lineTo(tx+20,H*0.3);ctx.lineTo(tx+40,H);ctx.fill();}
    for(const t of s.targets){ctx.fillStyle=`rgba(200,50,50,${0.5+0.5*(t.life/t.maxLife)})`;ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.fill();ctx.fillStyle="#cc3333";ctx.beginPath();ctx.arc(t.x,t.y-t.r*1.4,t.r*0.6,0,Math.PI*2);ctx.fill();}
    ctx.restore();
    // Scope frame
    ctx.strokeStyle="#222";ctx.lineWidth=8;ctx.beginPath();ctx.arc(cx,cy,70,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle="#444";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(cx-70,cy);ctx.lineTo(cx+70,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,cy-70);ctx.lineTo(cx,cy+70);ctx.stroke();
    ctx.strokeStyle="#f00";ctx.lineWidth=0.8;
    ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.stroke();
  },(canvas)=>{
    const s=state.current;
    const mm=(e:MouseEvent)=>{const r=canvas.getBoundingClientRect();s.scope={x:(e.clientX-r.left)*(canvas.width/r.width),y:(e.clientY-r.top)*(canvas.height/r.height)};};
    const click=(e:MouseEvent)=>{if(!s.started||s.over)return;const r=canvas.getBoundingClientRect();const mx=(e.clientX-r.left)*(canvas.width/r.width);const my=(e.clientY-r.top)*(canvas.height/r.height);let hit=false;s.targets=s.targets.filter(t=>{if(Math.hypot(t.x-mx,t.y-my)<t.r+8){s.score+=Math.ceil(t.r);setUi(u=>({...u,score:s.score}));hit=true;return false;}return true;});if(!hit&&s.targets.length>0){s.misses++;setUi(u=>({...u,misses:s.misses}));if(s.misses>=5){s.over=true;setUi(u=>({...u,over:true}));}}};
    canvas.addEventListener("mousemove",mm);canvas.addEventListener("click",click);return()=>{canvas.removeEventListener("mousemove",mm);canvas.removeEventListener("click",click);};
  });
  return(<GameUI accent={accent}><HUD><span>🎯 Score: {ui.score}</span><span>❌ Misses: {ui.misses}/5</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%",cursor:"none"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Move mouse to aim · Click to shoot</div>{!ui.started&&<Overlay accent={accent} msg="Sniper Elite" sub="Move mouse to aim · Click to fire" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Mission Failed! Score: ${ui.score}`} sub="Too many targets escaped" onStart={reset} restart/>}</GameUI>);
}

/* ── 12. Dead Rising (zombie survival) ──────────── */
function DeadRising({ accent }: { accent: string }) {
  const state=useRef({px:320,py:190,bullets:[] as {x:number;y:number;vx:number;vy:number}[],zombies:[] as {x:number;y:number;hp:number;hit:number}[],score:0,ammo:30,lives:3,over:false,started:false,spawnT:0,reloadT:0,t:0,angle:0,mouse:{x:400,y:190},keys:{} as Record<string,boolean>});
  const [ui,setUi]=useState({score:0,ammo:30,lives:3,over:false,started:false});
  const reset=useCallback(()=>{const s=state.current;Object.assign(s,{px:320,py:190,bullets:[],zombies:[],score:0,ammo:30,lives:3,over:false,started:true,spawnT:0,reloadT:0,t:0,angle:0});setUi({score:0,ammo:30,lives:3,over:false,started:true});},[]);
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt;
    const spd=140;
    if(s.keys["w"]||s.keys["ArrowUp"])s.py-=spd*dt;if(s.keys["s"]||s.keys["ArrowDown"])s.py+=spd*dt;
    if(s.keys["a"]||s.keys["ArrowLeft"])s.px-=spd*dt;if(s.keys["d"]||s.keys["ArrowRight"])s.px+=spd*dt;
    s.px=Math.max(14,Math.min(W-14,s.px));s.py=Math.max(14,Math.min(H-14,s.py));
    s.angle=Math.atan2(s.mouse.y-s.py,s.mouse.x-s.px);
    if(s.reloadT>0)s.reloadT-=dt;
    s.spawnT-=dt;
    if(s.spawnT<=0){const angle2=Math.random()*Math.PI*2;const r=Math.max(W,H)*0.7;s.zombies.push({x:W/2+Math.cos(angle2)*r,y:H/2+Math.sin(angle2)*r,hp:3,hit:0});s.spawnT=Math.max(0.4,1.2-s.t*0.02);}
    for(const b of s.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;}s.bullets=s.bullets.filter(b=>b.x>0&&b.x<W&&b.y>0&&b.y<H);
    for(const z of s.zombies){const ang=Math.atan2(s.py-z.y,s.px-z.x);z.x+=Math.cos(ang)*50*dt;z.y+=Math.sin(ang)*50*dt;if(z.hit>0)z.hit-=dt;if(Math.hypot(z.x-s.px,z.y-s.py)<26){s.lives--;setUi(u=>({...u,lives:s.lives}));z.x=-9999;if(s.lives<=0){s.over=true;setUi(u=>({...u,over:true}));}}}
    s.zombies=s.zombies.filter(z=>z.x>-9998);
    for(const b of s.bullets){for(const z of s.zombies){if(Math.hypot(b.x-z.x,b.y-z.y)<20){z.hp--;z.hit=0.2;b.x=-9999;if(z.hp<=0){s.score++;setUi(u=>({...u,score:s.score}));z.x=-9999;}}}}
    s.zombies=s.zombies.filter(z=>z.hp>0&&z.x>-9998);s.bullets=s.bullets.filter(b=>b.x>-9998);
    // Draw
    ctx.fillStyle="#1a0a00";ctx.fillRect(0,0,W,H);
    for(let i=0;i<6;i++){ctx.fillStyle="#2a1500";ctx.fillRect(i*110,0,80,H);ctx.fillStyle="#221100";ctx.fillRect(i*110+80,0,30,H);}
    for(const b of s.bullets){ctx.fillStyle="#ffff00";ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();}
    for(const z of s.zombies){ctx.fillStyle=z.hit>0?"#88ff88":"#224422";ctx.beginPath();ctx.arc(z.x,z.y,18,0,Math.PI*2);ctx.fill();ctx.fillStyle="#336633";ctx.beginPath();ctx.arc(z.x,z.y-24,12,0,Math.PI*2);ctx.fill();}
    // Player
    ctx.save();ctx.translate(s.px,s.py);ctx.rotate(s.angle);
    ctx.fillStyle=accent;ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(26,0);ctx.stroke();
    ctx.restore();
    setUi(u=>({...u,ammo:s.ammo}));
  },(canvas)=>{
    const s=state.current;
    const mm=(e:MouseEvent)=>{const r=canvas.getBoundingClientRect();s.mouse={x:(e.clientX-r.left)*(canvas.width/r.width),y:(e.clientY-r.top)*(canvas.height/r.height)};};
    const click=(e:MouseEvent)=>{if(!s.started||s.over)return;if(s.ammo<=0||s.reloadT>0)return;s.ammo--;setUi(u=>({...u,ammo:s.ammo}));const spd2=500;s.bullets.push({x:s.px,y:s.py,vx:Math.cos(s.angle)*spd2,vy:Math.sin(s.angle)*spd2});if(s.ammo===0){s.reloadT=2;setTimeout(()=>{s.ammo=30;setUi(u=>({...u,ammo:30}));},2000);}};
    const kd=(e:KeyboardEvent)=>{s.keys[e.key]=true;};const ku=(e:KeyboardEvent)=>{delete s.keys[e.key];};
    canvas.addEventListener("mousemove",mm);canvas.addEventListener("click",click);window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);
    return()=>{canvas.removeEventListener("mousemove",mm);canvas.removeEventListener("click",click);window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};
  });
  return(<GameUI accent={accent}><HUD><span>🧟 Score: {ui.score}</span><span>🔫 {ui.ammo}</span><span>❤️ x{ui.lives}</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%",cursor:"crosshair"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>WASD to move · Mouse to aim · Click to shoot</div>{!ui.started&&<Overlay accent={accent} msg="Dead Rising" sub="WASD move · Click to shoot zombies" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Overwhelmed! Score: ${ui.score}`} sub="The undead won this round" onStart={reset} restart/>}</GameUI>);
}

/* ── 13. Wave Rider (balance surfing) ────────────── */
function WaveRider({ accent }: { accent: string }) {
  const state=useRef({sx:160,sy:180,wave:0,balance:0,score:0,over:false,started:false,t:0,pressed:false,speed:80,particles:[] as {x:number;y:number;vx:number;vy:number;t:number}[]});
  const [ui,setUi]=useState({score:0,over:false,started:false});
  const reset=useCallback(()=>{const s=state.current;Object.assign(s,{sx:160,sy:180,wave:0,balance:0,score:0,over:false,started:true,t:0,pressed:false,speed:80,particles:[]});setUi({score:0,over:false,started:true});},[]);
  const canvasRef=useCanvas((ctx,dt)=>{
    const s=state.current;const W=ctx.canvas.width,H=ctx.canvas.height;
    if(!s.started||s.over)return;
    s.t+=dt;s.score=Math.floor(s.t*12);s.speed=Math.min(200,80+s.t*8);
    // Wave
    const getY=(x:number)=>H*0.55+Math.sin((x+s.wave)/60)*40+Math.sin((x+s.wave*1.3)/30)*15;
    s.wave+=s.speed*dt;
    // Balance
    const targetY=getY(s.sx);const diff=s.sy-targetY;
    if(s.pressed)s.sy-=220*dt;else s.sy+=160*dt;
    s.balance=Math.abs(diff)/60;
    if(s.balance>1.2){s.over=true;setUi(u=>({...u,over:true,score:s.score}));}
    // Particles
    if(Math.random()<0.3){const wy=getY(s.sx);s.particles.push({x:s.sx+Math.random()*20-10,y:wy,vx:(Math.random()-0.5)*80,vy:-Math.random()*60,t:0.6});}
    for(const p of s.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt;}s.particles=s.particles.filter(p=>p.t>0);
    // Draw bg
    const sky=ctx.createLinearGradient(0,0,0,H*0.5);sky.addColorStop(0,"#0ea5e9");sky.addColorStop(1,"#7dd3fc");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H*0.5);
    // Sun
    ctx.fillStyle="#fde68a";ctx.beginPath();ctx.arc(W-80,60,40,0,Math.PI*2);ctx.fill();
    // Ocean
    ctx.fillStyle="#0284c7";
    ctx.beginPath();ctx.moveTo(0,H);
    for(let x=W;x>=0;x-=4){ctx.lineTo(x,getY(x));}
    ctx.lineTo(0,H);ctx.closePath();ctx.fill();
    // Wave crest
    ctx.strokeStyle="#7dd3fc";ctx.lineWidth=3;ctx.beginPath();
    for(let x=0;x<=W;x+=4){if(x===0)ctx.moveTo(x,getY(x));else ctx.lineTo(x,getY(x));}ctx.stroke();
    // Spray particles
    for(const p of s.particles){ctx.globalAlpha=p.t;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    // Balance bar
    const balColor=s.balance<0.5?"#10b981":s.balance<0.8?"#f59e0b":"#ef4444";
    ctx.fillStyle="#1e1e2e";ctx.fillRect(20,20,160,16);ctx.fillStyle=balColor;ctx.fillRect(20,20,160*(1-Math.min(s.balance,1)),16);ctx.fillStyle="#fff";ctx.font="11px sans-serif";ctx.fillText("Balance",22,14);
    // Surfer
    const wy=getY(s.sx);const lean=Math.sin(diff/20)*0.4;
    ctx.save();ctx.translate(s.sx,Math.min(s.sy,wy-10));ctx.rotate(lean);
    ctx.fillStyle="#fbbf24";ctx.fillRect(-12,-6,24,4);
    ctx.fillStyle=accent;ctx.fillRect(-6,-20,12,16);
    ctx.fillStyle="#fed7aa";ctx.beginPath();ctx.arc(0,-26,8,0,Math.PI*2);ctx.fill();
    ctx.restore();
    setUi(u=>({...u,score:s.score}));
  },(canvas)=>{
    const s=state.current;
    const md=()=>{s.pressed=true;};const mu=()=>{s.pressed=false;};
    const kd=(e:KeyboardEvent)=>{if(e.key===" "||e.key==="ArrowUp")s.pressed=true;};const ku=(e:KeyboardEvent)=>{if(e.key===" "||e.key==="ArrowUp")s.pressed=false;};
    canvas.addEventListener("mousedown",md);canvas.addEventListener("mouseup",mu);window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);
    return()=>{canvas.removeEventListener("mousedown",md);canvas.removeEventListener("mouseup",mu);window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};
  });
  return(<GameUI accent={accent}><HUD><span>🏄 Score: {ui.score}</span><span>Hold SPACE/click to go up</span></HUD><canvas ref={canvasRef} width={640} height={380} style={{display:"block",width:"100%",cursor:"pointer"}}/><div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Hold Space / hold click to stay on the wave</div>{!ui.started&&<Overlay accent={accent} msg="Wave Rider" sub="Hold Space or click to surf the wave" onStart={reset}/>}{ui.over&&<Overlay accent={accent} msg={`Wiped out! Score: ${ui.score}`} sub="You lost your balance" onStart={reset} restart/>}</GameUI>);
}

/* ── 14. Arcane Rising (card spell battle) ───────── */
const SPELLS=[{name:"Fireball",emoji:"🔥",dmg:[15,25],cost:2},{name:"Ice Bolt",emoji:"❄️",dmg:[10,18],cost:1},{name:"Thunder",emoji:"⚡",dmg:[20,35],cost:3},{name:"Drain",emoji:"🩸",dmg:[8,14],cost:1,heal:true},{name:"Meteor",emoji:"☄️",dmg:[30,45],cost:4}];
function ArcaneRising({ accent }: { accent: string }) {
  const [pHp,setPHp]=useState(80);const [eHp,setEHp]=useState(100);const [mana,setMana]=useState(6);const [maxMana]=useState(6);
  const [hand,setHand]=useState(()=>SPELLS.sort(()=>Math.random()-0.5).slice(0,3));
  const [log,setLog]=useState<string[]>(["🔮 The duel begins!"]);const [phase,setPhase]=useState<"player"|"enemy"|"win"|"lose">("player");const [turn,setTurn]=useState(1);
  const addLog=(m:string)=>setLog(l=>[m,...l].slice(0,5));
  const cast=(spell:typeof SPELLS[0])=>{
    if(phase!=="player"||mana<spell.cost)return;
    const dmg=Math.floor(Math.random()*(spell.dmg[1]-spell.dmg[0])+spell.dmg[0]);
    const newEHp=Math.max(0,eHp-dmg);setEHp(newEHp);
    if(spell.heal){const h=Math.floor(dmg*0.5);setPHp(p=>Math.min(80,p+h));addLog(`${spell.emoji} ${spell.name}: ${dmg} dmg + ${h} heal!`);}
    else addLog(`${spell.emoji} ${spell.name} deals ${dmg} damage!`);
    setMana(m=>m-spell.cost);
    if(newEHp<=0){setPhase("win");return;}
    setPhase("enemy");
    setTimeout(()=>{const eDmg=Math.floor(Math.random()*18+8);const newPHp=Math.max(0,pHp-eDmg);setPHp(newPHp);addLog(`👹 Enemy casts Dark Bolt for ${eDmg}!`);if(newPHp<=0){setPhase("lose");}else{setTurn(t=>t+1);setMana(maxMana);const newHand=SPELLS.sort(()=>Math.random()-0.5).slice(0,3);setHand(newHand);addLog("✨ Mana restored! New hand drawn.");setPhase("player");}},800);
  };
  const restart=()=>{setPHp(80);setEHp(100);setMana(6);setHand(SPELLS.sort(()=>Math.random()-0.5).slice(0,3));setLog(["🔮 The duel begins!"]);setPhase("player");setTurn(1);};
  return(<GameUI accent={accent}><HUD><span>🔮 Turn {turn}</span><span>💧 {mana}/{maxMana} Mana</span></HUD>
  <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
      <div style={{background:"#0a0a0f",borderRadius:10,padding:"0.75rem",textAlign:"center"}}><div style={{fontSize:"2rem"}}>🧙</div><div style={{background:"#1e1e2e",height:8,borderRadius:4}}><div style={{height:"100%",width:`${pHp/80*100}%`,background:"#10b981",borderRadius:4,transition:"width 0.3s"}}/></div><div style={{fontSize:"0.75rem",color:"#94a3b8"}}>You: {pHp} HP</div></div>
      <div style={{background:"#0a0a0f",borderRadius:10,padding:"0.75rem",textAlign:"center"}}><div style={{fontSize:"2rem"}}>👹</div><div style={{background:"#1e1e2e",height:8,borderRadius:4}}><div style={{height:"100%",width:`${eHp/100*100}%`,background:"#ef4444",borderRadius:4,transition:"width 0.3s"}}/></div><div style={{fontSize:"0.75rem",color:"#94a3b8"}}>Enemy: {eHp} HP</div></div>
    </div>
    <div style={{display:"flex",gap:"0.5rem",justifyContent:"center",flexWrap:"wrap"}}>{hand.map((s,i)=>(<button key={i} onClick={()=>cast(s)} disabled={phase!=="player"||mana<s.cost} style={{flex:1,minWidth:80,padding:"0.5rem",background:mana>=s.cost&&phase==="player"?accent:"#1e1e2e",color:"#fff",border:"none",borderRadius:10,cursor:mana>=s.cost&&phase==="player"?"pointer":"not-allowed",opacity:mana<s.cost?0.4:1,fontSize:"0.8rem",transition:"all 0.2s"}}><div style={{fontSize:"1.4rem"}}>{s.emoji}</div><div style={{fontWeight:700}}>{s.name}</div><div style={{color:"#94a3b8",fontSize:"0.7rem"}}>{s.dmg[0]}-{s.dmg[1]} dmg · {s.cost}💧</div></button>))}</div>
    <div style={{background:"#0a0a0f",borderRadius:8,padding:"0.5rem",maxHeight:90,overflowY:"auto"}}>{log.map((l,i)=><div key={i} style={{fontSize:"0.8rem",color:i===0?"#fff":"#64748b"}}>{l}</div>)}</div>
  </div>
  {phase==="win"&&<Overlay accent={accent} msg="Victory! 🏆" sub="The enemy has been vanquished!" onStart={restart} restart/>}
  {phase==="lose"&&<Overlay accent={accent} msg="Defeated! 💀" sub="Your magic was not enough" onStart={restart} restart/>}
  </GameUI>);
}

/* ── 15. Rail Empire (connect the stations) ─────── */
function RailEmpire({ accent }: { accent: string }) {
  const STATIONS=[{x:80,y:60,name:"Alpha"},{x:280,y:40,name:"Beta"},{x:500,y:80,name:"Gamma"},{x:60,y:200,name:"Delta"},{x:320,y:180,name:"Central"},{x:560,y:200,name:"Epsilon"},{x:120,y:320,name:"Zeta"},{x:400,y:340,name:"Eta"},{x:580,y:320,name:"Theta"}];
  const [rails,setRails]=useState<{a:number;b:number}[]>([]);const [from,setFrom]=useState<number|null>(null);const [score,setScore]=useState(0);const [won,setWon]=useState(false);
  const needed=STATIONS.length-1;
  const connect=(i:number)=>{if(won)return;if(from===null){setFrom(i);}else if(from===i){setFrom(null);}else{const exists=rails.some(r=>(r.a===from&&r.b===i)||(r.a===i&&r.b===from));if(!exists){const newRails=[...rails,{a:from,b:i}];setRails(newRails);setScore(newRails.length);if(newRails.length>=needed)setWon(true);}setFrom(null);}};
  const reset=()=>{setRails([]);setFrom(null);setScore(0);setWon(false);};
  return(<GameUI accent={accent}><HUD><span>🚂 Rails: {score}/{needed}</span>{won&&<span style={{color:"#10b981"}}>🎉 Network Complete!</span>}</HUD>
  <div style={{position:"relative",height:380,background:"#1a1008",overflowX:"hidden"}}>
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 640 380">
      {rails.map((r,i)=><line key={i} x1={STATIONS[r.a].x} y1={STATIONS[r.a].y} x2={STATIONS[r.b].x} y2={STATIONS[r.b].y} stroke={accent} strokeWidth={4} strokeDasharray="8,4"/>)}
      {from!==null&&<circle cx={STATIONS[from].x} cy={STATIONS[from].y} r={22} fill="none" stroke="#fff" strokeWidth={2} opacity={0.5}/>}
      {STATIONS.map((s,i)=><g key={i} onClick={()=>connect(i)} style={{cursor:"pointer"}}>
        <circle cx={s.x} cy={s.y} r={18} fill={from===i?"#fff":accent} opacity={0.9}/>
        <text x={s.x} y={s.y+5} textAnchor="middle" fontSize={10} fill="#000" fontWeight="bold">{s.name}</text>
      </g>)}
    </svg>
  </div>
  <div style={{color:"#94a3b8",fontSize:"0.8rem",textAlign:"center",marginTop:"4px"}}>Click a station to start · Click another to connect</div>
  <div style={{textAlign:"center",marginTop:"4px"}}><Btn accent={accent} onClick={reset}>🔄 Reset Rails</Btn></div>
  {won&&<Overlay accent={accent} msg="Network Complete! 🚂" sub={`Connected in ${score} rails!`} onStart={reset} restart/>}
  </GameUI>);
}

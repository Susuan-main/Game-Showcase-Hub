import { lazy, Suspense } from "react";

const G1 = lazy(() => import("./games-1to5"));
const G2 = lazy(() => import("./games-6to10"));
const G3 = lazy(() => import("./games-11to15"));
const G4 = lazy(() => import("./games-16to20"));
const G5 = lazy(() => import("./games-21to25"));

const MAP: Record<number, { file: "g1"|"g2"|"g3"|"g4"|"g5"; name: string }> = {
  1:  { file: "g1", name: "ShadowBlade" },
  2:  { file: "g1", name: "CosmicDrift" },
  3:  { file: "g1", name: "MindMaze" },
  4:  { file: "g1", name: "TurboRush" },
  5:  { file: "g1", name: "VerdantQuest" },
  6:  { file: "g2", name: "BlastSquad" },
  7:  { file: "g2", name: "CastleWars" },
  8:  { file: "g2", name: "PhantomHunt" },
  9:  { file: "g2", name: "PixelDepths" },
  10: { file: "g2", name: "IronFist" },
  11: { file: "g3", name: "SniperElite" },
  12: { file: "g3", name: "DeadRising" },
  13: { file: "g3", name: "WaveRider" },
  14: { file: "g3", name: "ArcaneRising" },
  15: { file: "g3", name: "RailEmpire" },
  16: { file: "g4", name: "DragonSiege" },
  17: { file: "g4", name: "StarForge" },
  18: { file: "g4", name: "ProLeague" },
  19: { file: "g4", name: "DarkAgency" },
  20: { file: "g4", name: "OceanDepths" },
  21: { file: "g5", name: "ForestArcher" },
  22: { file: "g5", name: "MechStorm" },
  23: { file: "g5", name: "RogueDice" },
  24: { file: "g5", name: "BlossomFarm" },
  25: { file: "g5", name: "ThunderStrike" },
};

interface Props { id: number; accent: string; }

export default function GameRenderer({ id, accent }: Props) {
  const entry = MAP[id];
  const Loader = (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#94a3b8" }}>
      Loading game…
    </div>
  );
  if (!entry) return <div style={{color:"white",padding:"2rem"}}>Game not found</div>;

  const gameProps = { accent };

  if (entry.file === "g1") return (
    <Suspense fallback={Loader}>
      <G1 name={entry.name} {...gameProps} />
    </Suspense>
  );
  if (entry.file === "g2") return (
    <Suspense fallback={Loader}>
      <G2 name={entry.name} {...gameProps} />
    </Suspense>
  );
  if (entry.file === "g3") return (
    <Suspense fallback={Loader}>
      <G3 name={entry.name} {...gameProps} />
    </Suspense>
  );
  if (entry.file === "g4") return (
    <Suspense fallback={Loader}>
      <G4 name={entry.name} {...gameProps} />
    </Suspense>
  );
  return (
    <Suspense fallback={Loader}>
      <G5 name={entry.name} {...gameProps} />
    </Suspense>
  );
}

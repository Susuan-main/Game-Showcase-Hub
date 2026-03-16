import { useEffect } from "react";
import GameRenderer from "../games/GameRenderer";

interface GameModalProps {
  game: { id: number; title: string; emoji: string; accent: string };
  onClose: () => void;
}

export default function GameModal({ game, onClose }: GameModalProps) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="gm-overlay" onClick={onClose}>
      <div className="gm-box" onClick={e => e.stopPropagation()}>
        <div className="gm-header" style={{ borderBottom: `2px solid ${game.accent}` }}>
          <span style={{ fontSize: "1.4rem" }}>{game.emoji}</span>
          <span className="gm-title">{game.title}</span>
          <button className="gm-close" onClick={onClose}>✕</button>
        </div>
        <div className="gm-body">
          <GameRenderer id={game.id} accent={game.accent} />
        </div>
      </div>
    </div>
  );
}

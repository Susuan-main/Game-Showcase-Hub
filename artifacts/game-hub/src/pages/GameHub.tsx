import { useEffect, useState } from "react";
import "../styles.css";
import GameModal from "../components/GameModal";
import {
  initParticles,
  initScrollReveal,
  initCardStaggerAnimation,
  initCardTiltEffect,
  initStatCountUp,
  initFilterTabs,
  initLogoHoverEffect,
} from "../animations.js";

const GAMES = [
  { id: 1, emoji: "⚔️", title: "Shadow Blade", genre: "Action", description: "Slice through darkness with legendary swords in this fast-paced hack-and-slash.", rating: 4.8, players: "2.4M", badge: "hot", accent: "#ec4899", glow: "rgba(236,72,153,0.3)" },
  { id: 2, emoji: "🚀", title: "Cosmic Drift", genre: "Arcade", description: "Navigate asteroid fields and warp through galaxies in this endless space adventure.", rating: 4.6, players: "1.8M", badge: "new", accent: "#06b6d4", glow: "rgba(6,182,212,0.3)" },
  { id: 3, emoji: "🧩", title: "Mind Maze", genre: "Puzzle", description: "Challenge your intellect with mind-bending puzzles across 200+ unique levels.", rating: 4.7, players: "3.1M", badge: "top", accent: "#7c3aed", glow: "rgba(124,58,237,0.3)" },
  { id: 4, emoji: "🏁", title: "Turbo Rush", genre: "Racing", description: "Blaze through neon-lit circuits at breakneck speeds in the ultimate racing experience.", rating: 4.5, players: "1.2M", badge: "hot", accent: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  { id: 5, emoji: "🌿", title: "Verdant Quest", genre: "RPG", description: "Explore a lush open world full of mythical creatures, secrets, and epic loot.", rating: 4.9, players: "5.6M", badge: "top", accent: "#10b981", glow: "rgba(16,185,129,0.3)" },
  { id: 6, emoji: "💣", title: "Blast Squad", genre: "Shooter", description: "Team up with friends to eliminate enemies in explosive multiplayer battles.", rating: 4.4, players: "4.0M", badge: "hot", accent: "#ef4444", glow: "rgba(239,68,68,0.3)" },
  { id: 7, emoji: "🏰", title: "Castle Wars", genre: "Strategy", description: "Build your fortress and conquer rival kingdoms in this real-time strategy epic.", rating: 4.6, players: "2.2M", badge: "new", accent: "#7c3aed", glow: "rgba(124,58,237,0.3)" },
  { id: 8, emoji: "👻", title: "Phantom Hunt", genre: "Horror", description: "Survive one terrifying night in a haunted mansion where nothing is as it seems.", rating: 4.3, players: "890K", badge: "new", accent: "#8b5cf6", glow: "rgba(139,92,246,0.3)" },
  { id: 9, emoji: "⛏️", title: "Pixel Depths", genre: "Sandbox", description: "Mine, craft, and build your dream world in this beloved block-building adventure.", rating: 4.9, players: "9.8M", badge: "top", accent: "#10b981", glow: "rgba(16,185,129,0.3)" },
  { id: 10, emoji: "🥊", title: "Iron Fist", genre: "Fighting", description: "Master devastating combos and defeat champions in the ultimate fighting tournament.", rating: 4.5, players: "1.5M", badge: "hot", accent: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  { id: 11, emoji: "🎯", title: "Sniper Elite", genre: "Shooter", description: "Take long-range precision shots across sprawling realistic battlefield environments.", rating: 4.4, players: "1.1M", badge: null, accent: "#64748b", glow: "rgba(100,116,139,0.3)" },
  { id: 12, emoji: "🧟", title: "Dead Rising", genre: "Survival", description: "Scavenge for resources and fend off hordes of undead in this post-apocalyptic world.", rating: 4.6, players: "3.3M", badge: "hot", accent: "#ef4444", glow: "rgba(239,68,68,0.3)" },
  { id: 13, emoji: "🏄", title: "Wave Rider", genre: "Sports", description: "Catch the perfect wave and pull off insane tricks in stunning tropical arenas.", rating: 4.2, players: "670K", badge: "free", accent: "#06b6d4", glow: "rgba(6,182,212,0.3)" },
  { id: 14, emoji: "🔮", title: "Arcane Rising", genre: "RPG", description: "Cast powerful spells, forge alliances, and reshape the fate of the magical realm.", rating: 4.8, players: "4.1M", badge: "top", accent: "#7c3aed", glow: "rgba(124,58,237,0.3)" },
  { id: 15, emoji: "🚂", title: "Rail Empire", genre: "Strategy", description: "Build a vast railroad network and dominate the industrial revolution era.", rating: 4.3, players: "880K", badge: "new", accent: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  { id: 16, emoji: "🐉", title: "Dragon Siege", genre: "Action", description: "Tame fearsome dragons and rain fire upon enemy castles in this epic fantasy war.", rating: 4.7, players: "3.7M", badge: "hot", accent: "#ef4444", glow: "rgba(239,68,68,0.3)" },
  { id: 17, emoji: "🌌", title: "Star Forge", genre: "Sandbox", description: "Colonize distant planets, harvest rare minerals, and build interstellar civilizations.", rating: 4.6, players: "2.0M", badge: "new", accent: "#06b6d4", glow: "rgba(6,182,212,0.3)" },
  { id: 18, emoji: "⚽", title: "Pro League", genre: "Sports", description: "Lead your club to glory across full seasons with realistic physics and tactics.", rating: 4.5, players: "6.2M", badge: "top", accent: "#10b981", glow: "rgba(16,185,129,0.3)" },
  { id: 19, emoji: "🕵️", title: "Dark Agency", genre: "Stealth", description: "Complete covert ops without being detected in this cinematic spy thriller.", rating: 4.4, players: "1.3M", badge: null, accent: "#475569", glow: "rgba(71,85,105,0.3)" },
  { id: 20, emoji: "🌊", title: "Ocean Depths", genre: "Adventure", description: "Dive into the mysterious deep sea, discover ancient ruins and terrifying creatures.", rating: 4.7, players: "2.8M", badge: "new", accent: "#06b6d4", glow: "rgba(6,182,212,0.3)" },
  { id: 21, emoji: "🏹", title: "Forest Archer", genre: "Action", description: "Master the bow and arrow as an elven ranger protecting the sacred woodland.", rating: 4.3, players: "960K", badge: "free", accent: "#10b981", glow: "rgba(16,185,129,0.3)" },
  { id: 22, emoji: "🤖", title: "Mech Storm", genre: "Shooter", description: "Pilot massive combat mechs and wage war in futuristic city battlegrounds.", rating: 4.6, players: "2.5M", badge: "hot", accent: "#ec4899", glow: "rgba(236,72,153,0.3)" },
  { id: 23, emoji: "🎲", title: "Rogue Dice", genre: "Roguelike", description: "Roll the dice and face randomized dungeons, loot, and bosses in every run.", rating: 4.8, players: "1.7M", badge: "top", accent: "#8b5cf6", glow: "rgba(139,92,246,0.3)" },
  { id: 24, emoji: "🌺", title: "Blossom Farm", genre: "Casual", description: "Grow a beautiful garden, trade with neighbors, and build your perfect countryside life.", rating: 4.5, players: "7.4M", badge: "free", accent: "#ec4899", glow: "rgba(236,72,153,0.3)" },
  { id: 25, emoji: "⚡", title: "Thunder Strike", genre: "Arcade", description: "Unleash electric combos and defeat waves of enemies in this lightning-fast beat-em-up.", rating: 4.7, players: "3.0M", badge: "hot", accent: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
];

const GENRES = ["All", "Action", "Arcade", "Puzzle", "Racing", "RPG", "Shooter", "Strategy", "Horror", "Sandbox", "Fighting", "Survival", "Sports", "Adventure", "Roguelike", "Casual", "Stealth"];

type Game = typeof GAMES[0];

export default function GameHub() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [openGame, setOpenGame] = useState<Game | null>(null);

  const filteredGames = activeGenre === "All"
    ? GAMES
    : GAMES.filter((g) => g.genre === activeGenre);

  useEffect(() => {
    initParticles();
    initLogoHoverEffect();
    initStatCountUp();

    const scrollObserver = initScrollReveal();
    return () => scrollObserver?.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      initCardStaggerAnimation();
      initCardTiltEffect();
    }, 100);
    return () => clearTimeout(timer);
  }, [filteredGames]);

  return (
    <>
      {openGame && (
        <GameModal game={openGame} onClose={() => setOpenGame(null)} />
      )}
      <section className="hero-section">
        <div className="hero-bg-grid" />
        <div className="hero-particles" />

        <div className="logo-container">
          <span className="logo-icon">🎮</span>
          <h1 className="logo-title">GameHub</h1>
          <p className="logo-tagline">Your Ultimate Gaming Destination</p>
          <div className="hero-badge">
            <span>🟢</span>
            <span>25 Games Available Now</span>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>Scroll</span>
          <span className="scroll-arrow">↓</span>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item reveal">
            <span className="stat-number" data-target="25" data-suffix="">0</span>
            <span className="stat-label">Games</span>
          </div>
          <div className="stat-item reveal">
            <span className="stat-number" data-target="50" data-suffix="M+">0</span>
            <span className="stat-label">Players</span>
          </div>
          <div className="stat-item reveal">
            <span className="stat-number" data-target="12" data-suffix="">0</span>
            <span className="stat-label">Genres</span>
          </div>
          <div className="stat-item reveal">
            <span className="stat-number" data-target="99" data-suffix="%">0</span>
            <span className="stat-label">Uptime</span>
          </div>
        </div>
      </div>

      <main className="games-section">
        <div className="section-header reveal">
          <span className="section-label">Library</span>
          <h2 className="section-title">Browse All Games</h2>
          <p className="section-subtitle">Discover your next favourite — from epic RPGs to quick casual games</p>
        </div>

        <div className="filter-tabs reveal">
          {GENRES.map((genre) => (
            <button
              key={genre}
              className={`filter-tab${activeGenre === genre ? " active" : ""}`}
              data-genre={genre}
              onClick={() => setActiveGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="games-grid">
          {filteredGames.map((game) => (
            <article
              key={game.id}
              className="game-card"
              style={{ "--card-glow": game.glow, "--card-accent": game.accent, cursor: "pointer" } as React.CSSProperties}
              onClick={() => setOpenGame(game)}
            >
              <div className="game-card-image">
                <div
                  className="game-card-img-bg"
                  style={{ background: `radial-gradient(ellipse at 50% 50%, ${game.glow} 0%, #13131a 70%)` }}
                >
                  {game.emoji}
                </div>
                <div className="game-card-overlay" />
                {game.badge && (
                  <span className={`game-card-badge badge-${game.badge}`}>
                    {game.badge === "hot" ? "🔥 Hot" : game.badge === "new" ? "✨ New" : game.badge === "top" ? "👑 Top" : "🎁 Free"}
                  </span>
                )}
              </div>

              <div className="game-card-content">
                <p className="game-card-genre">{game.genre}</p>
                <h3 className="game-card-title">{game.title}</h3>
                <p className="game-card-description">{game.description}</p>

                <div className="game-card-footer">
                  <div>
                    <div className="game-card-rating">
                      ⭐ {game.rating}
                    </div>
                    <div className="game-card-players">
                      👥 {game.players} players
                    </div>
                  </div>
                  <button className="play-btn">▶ Play</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-logo">GameHub</div>
        <p>© 2026 GameHub. All games reserved.</p>
      </footer>
    </>
  );
}

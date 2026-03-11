import json
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

GAMES = [
    {"id": 1, "emoji": "⚔️", "title": "Shadow Blade", "genre": "Action", "description": "Slice through darkness with legendary swords in this fast-paced hack-and-slash.", "rating": 4.8, "players": "2.4M", "badge": "hot", "accent": "#ec4899"},
    {"id": 2, "emoji": "🚀", "title": "Cosmic Drift", "genre": "Arcade", "description": "Navigate asteroid fields and warp through galaxies in this endless space adventure.", "rating": 4.6, "players": "1.8M", "badge": "new", "accent": "#06b6d4"},
    {"id": 3, "emoji": "🧩", "title": "Mind Maze", "genre": "Puzzle", "description": "Challenge your intellect with mind-bending puzzles across 200+ unique levels.", "rating": 4.7, "players": "3.1M", "badge": "top", "accent": "#7c3aed"},
    {"id": 4, "emoji": "🏁", "title": "Turbo Rush", "genre": "Racing", "description": "Blaze through neon-lit circuits at breakneck speeds in the ultimate racing experience.", "rating": 4.5, "players": "1.2M", "badge": "hot", "accent": "#f59e0b"},
    {"id": 5, "emoji": "🌿", "title": "Verdant Quest", "genre": "RPG", "description": "Explore a lush open world full of mythical creatures, secrets, and epic loot.", "rating": 4.9, "players": "5.6M", "badge": "top", "accent": "#10b981"},
    {"id": 6, "emoji": "💣", "title": "Blast Squad", "genre": "Shooter", "description": "Team up with friends to eliminate enemies in explosive multiplayer battles.", "rating": 4.4, "players": "4.0M", "badge": "hot", "accent": "#ef4444"},
    {"id": 7, "emoji": "🏰", "title": "Castle Wars", "genre": "Strategy", "description": "Build your fortress and conquer rival kingdoms in this real-time strategy epic.", "rating": 4.6, "players": "2.2M", "badge": "new", "accent": "#7c3aed"},
    {"id": 8, "emoji": "👻", "title": "Phantom Hunt", "genre": "Horror", "description": "Survive one terrifying night in a haunted mansion where nothing is as it seems.", "rating": 4.3, "players": "890K", "badge": "new", "accent": "#8b5cf6"},
    {"id": 9, "emoji": "⛏️", "title": "Pixel Depths", "genre": "Sandbox", "description": "Mine, craft, and build your dream world in this beloved block-building adventure.", "rating": 4.9, "players": "9.8M", "badge": "top", "accent": "#10b981"},
    {"id": 10, "emoji": "🥊", "title": "Iron Fist", "genre": "Fighting", "description": "Master devastating combos and defeat champions in the ultimate fighting tournament.", "rating": 4.5, "players": "1.5M", "badge": "hot", "accent": "#f59e0b"},
    {"id": 11, "emoji": "🎯", "title": "Sniper Elite", "genre": "Shooter", "description": "Take long-range precision shots across sprawling realistic battlefield environments.", "rating": 4.4, "players": "1.1M", "badge": None, "accent": "#64748b"},
    {"id": 12, "emoji": "🧟", "title": "Dead Rising", "genre": "Survival", "description": "Scavenge for resources and fend off hordes of undead in this post-apocalyptic world.", "rating": 4.6, "players": "3.3M", "badge": "hot", "accent": "#ef4444"},
    {"id": 13, "emoji": "🏄", "title": "Wave Rider", "genre": "Sports", "description": "Catch the perfect wave and pull off insane tricks in stunning tropical arenas.", "rating": 4.2, "players": "670K", "badge": "free", "accent": "#06b6d4"},
    {"id": 14, "emoji": "🔮", "title": "Arcane Rising", "genre": "RPG", "description": "Cast powerful spells, forge alliances, and reshape the fate of the magical realm.", "rating": 4.8, "players": "4.1M", "badge": "top", "accent": "#7c3aed"},
    {"id": 15, "emoji": "🚂", "title": "Rail Empire", "genre": "Strategy", "description": "Build a vast railroad network and dominate the industrial revolution era.", "rating": 4.3, "players": "880K", "badge": "new", "accent": "#f59e0b"},
    {"id": 16, "emoji": "🐉", "title": "Dragon Siege", "genre": "Action", "description": "Tame fearsome dragons and rain fire upon enemy castles in this epic fantasy war.", "rating": 4.7, "players": "3.7M", "badge": "hot", "accent": "#ef4444"},
    {"id": 17, "emoji": "🌌", "title": "Star Forge", "genre": "Sandbox", "description": "Colonize distant planets, harvest rare minerals, and build interstellar civilizations.", "rating": 4.6, "players": "2.0M", "badge": "new", "accent": "#06b6d4"},
    {"id": 18, "emoji": "⚽", "title": "Pro League", "genre": "Sports", "description": "Lead your club to glory across full seasons with realistic physics and tactics.", "rating": 4.5, "players": "6.2M", "badge": "top", "accent": "#10b981"},
    {"id": 19, "emoji": "🕵️", "title": "Dark Agency", "genre": "Stealth", "description": "Complete covert ops without being detected in this cinematic spy thriller.", "rating": 4.4, "players": "1.3M", "badge": None, "accent": "#475569"},
    {"id": 20, "emoji": "🌊", "title": "Ocean Depths", "genre": "Adventure", "description": "Dive into the mysterious deep sea, discover ancient ruins and terrifying creatures.", "rating": 4.7, "players": "2.8M", "badge": "new", "accent": "#06b6d4"},
    {"id": 21, "emoji": "🏹", "title": "Forest Archer", "genre": "Action", "description": "Master the bow and arrow as an elven ranger protecting the sacred woodland.", "rating": 4.3, "players": "960K", "badge": "free", "accent": "#10b981"},
    {"id": 22, "emoji": "🤖", "title": "Mech Storm", "genre": "Shooter", "description": "Pilot massive combat mechs and wage war in futuristic city battlegrounds.", "rating": 4.6, "players": "2.5M", "badge": "hot", "accent": "#ec4899"},
    {"id": 23, "emoji": "🎲", "title": "Rogue Dice", "genre": "Roguelike", "description": "Roll the dice and face randomized dungeons, loot, and bosses in every run.", "rating": 4.8, "players": "1.7M", "badge": "top", "accent": "#8b5cf6"},
    {"id": 24, "emoji": "🌺", "title": "Blossom Farm", "genre": "Casual", "description": "Grow a beautiful garden, trade with neighbors, and build your perfect countryside life.", "rating": 4.5, "players": "7.4M", "badge": "free", "accent": "#ec4899"},
    {"id": 25, "emoji": "⚡", "title": "Thunder Strike", "genre": "Arcade", "description": "Unleash electric combos and defeat waves of enemies in this lightning-fast beat-em-up.", "rating": 4.7, "players": "3.0M", "badge": "hot", "accent": "#f59e0b"},
]


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        genre = params.get("genre", [None])[0]
        search = params.get("search", [None])[0]
        badge = params.get("badge", [None])[0]

        results = GAMES

        if genre and genre.lower() != "all":
            results = [g for g in results if g["genre"].lower() == genre.lower()]

        if search:
            query = search.lower()
            results = [g for g in results if query in g["title"].lower() or query in g["description"].lower() or query in g["genre"].lower()]

        if badge:
            results = [g for g in results if g.get("badge") == badge.lower()]

        payload = {
            "total": len(results),
            "games": results,
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        pass

import json
from http.server import BaseHTTPRequestHandler


STATS = {
    "total_games": 25,
    "total_players": "50M+",
    "total_genres": 12,
    "uptime_percent": 99,
    "featured": [
        {"title": "Verdant Quest", "rating": 4.9, "genre": "RPG"},
        {"title": "Pixel Depths", "rating": 4.9, "genre": "Sandbox"},
        {"title": "Arcane Rising", "rating": 4.8, "genre": "RPG"},
    ],
    "genre_breakdown": [
        {"genre": "Action", "count": 3},
        {"genre": "Arcade", "count": 2},
        {"genre": "RPG", "count": 2},
        {"genre": "Shooter", "count": 3},
        {"genre": "Strategy", "count": 2},
        {"genre": "Sandbox", "count": 2},
        {"genre": "Sports", "count": 2},
        {"genre": "Survival", "count": 1},
        {"genre": "Horror", "count": 1},
        {"genre": "Racing", "count": 1},
        {"genre": "Puzzle", "count": 1},
        {"genre": "Others", "count": 5},
    ],
}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(STATS).encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        pass

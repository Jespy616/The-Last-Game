from os import system, getenv
from dotenv import load_dotenv
import os
import unittest
import subprocess
import json
import threading

load_dotenv()

apiKey = getenv("GROQ_API_KEY")

a = ["stone", "grass", "dirt", "wood"]
b = ["castle", "swamp", "cave", "forest"]

'''
Example use cases for command line arguments
'''
# system(f"python3 src/backend/ai/ai_agent.py -f a") # Missing API key
# system(f"python3 src/backend/ai/ai_agent.py -k api_key -f a") # Invalid number of rooms
# system(f"python3 src/backend/ai/ai_agent.py -k api_key -f 1 1") # Invalid area
# system(f"python3 src/backend/ai/ai_agent.py -k api_key -f 1 swamp {a}") # missing wall tile
# system(f"python3 src/backend/ai/ai_agent.py -k BAD-API-KEY -s none castle \"no previous story\"") # bad API key
# print("\n\n")

# system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -f 15 castle {b} {b}") # Floor generation
# system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -e 10 {a}") # Enemy generation
# system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -w 10 {a}") # Weapon generation
# system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -s none castle \"no previous story\"") # Story generation

# system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -f 15 castle {b} {b} -e 10 {a} -w 10 {a}") # Floor, enemy, weapon generation    
# system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -f 15 castle {b} {b} -e 10 {a} -w 10 {a} -s none Castle \"This will be the first story\"") # All generation


class TestAI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.api_key = getenv("GROQ_API_KEY")
        cls.floor_tiles = ["castle", "swamp", "cave", "forest"]
        cls.wall_tiles = ["stone", "grass", "dirt", "wood"]
        
        # Run the AI agent once with all generation options
        cmd = ["python3", "src/backend/ai/ai_agent.py", 
               "-k", cls.api_key,
               "-f", "10", "castle", json.dumps(cls.floor_tiles), json.dumps(cls.wall_tiles),
               "-e", "5", json.dumps(cls.wall_tiles),
               "-w", "5", json.dumps(cls.wall_tiles),
               "-s", "none", "castle", "\"no previous story\""]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"AI agent failed to run: {result.stderr}")
            
        try:
            cls.ai_result = json.loads(result.stdout)
        except json.JSONDecodeError:
            raise RuntimeError(f"Failed to parse JSON output: {result.stdout}")
    
    def test_complete_response_structure(self):
        """Test that the response contains all expected top-level components"""
        self.assertIn("floors", self.ai_result)
        self.assertIn("enemies", self.ai_result)
        self.assertIn("weapons", self.ai_result)
        self.assertIn("story", self.ai_result)
    
    def test_floor_generation(self):
        """Test floor generation functionality"""
        floors = self.ai_result["floors"]
        
        # Check for required components in the floors output
        self.assertIn("rooms", floors)
        self.assertIn("floorMap", floors)
        self.assertIn("adjacencyMatrix", floors)
        self.assertIn("floorTiles", floors)
        self.assertIn("wallTiles", floors)
        
        # Check rooms structure
        rooms = floors["rooms"]
        self.assertIsInstance(rooms, dict)
        self.assertGreater(len(rooms), 0)
        
        # Check individual room structure (using first room as example)
        first_room_key = list(rooms.keys())[0]
        first_room = rooms[first_room_key]
        self.assertIsInstance(first_room, list)
        self.assertGreater(len(first_room), 0)
        
        # Check floorMap structure
        floor_map = floors["floorMap"]
        self.assertIsInstance(floor_map, list)
        self.assertGreater(len(floor_map), 0)
        
        # Check adjacencyMatrix structure
        adjacency = floors["adjacencyMatrix"]
        self.assertIsInstance(adjacency, list)
        self.assertGreater(len(adjacency), 0)
        
        # Test room layout contents
        for room_key, room_layout in rooms.items():
            self.assertIsInstance(room_layout, list)
            for row in room_layout:
                self.assertIsInstance(row, list)
                # If there are elements in this row, check them
                if row:
                    for cell in row:
                        self.assertIn(cell, ["w", "."])
    
    def test_enemy_generation(self):
        """Test enemy generation functionality"""
        enemies = self.ai_result["enemies"]
        self.assertIsInstance(enemies, list)
        self.assertGreater(len(enemies), 0)  # Should have at least one enemy
        
        # Check enemy structure and stat ranges
        for enemy in enemies:
            self.assertIn("attack", enemy)
            self.assertIn("health", enemy)
            self.assertIn("sprite", enemy)
            
            # Check numeric fields
            self.assertIsInstance(enemy["attack"], (int, float))
            self.assertIsInstance(enemy["health"], (int, float))
            
            # Check ranges
            self.assertGreater(enemy["health"], 0)
            self.assertGreater(enemy["attack"], 0)
            # Sprite should be one of the wall tiles
            self.assertIn(enemy["sprite"].replace("\"", ""), self.wall_tiles)
    
    def test_weapon_generation(self):
        """Test weapon generation functionality"""
        weapons = self.ai_result["weapons"]
        self.assertIsInstance(weapons, list)
        self.assertGreater(len(weapons), 0)  # Should have at least one weapon
        
        # Check weapon structure and ranges
        for weapon in weapons:
            self.assertIn("attack", weapon)
            self.assertIn("type", weapon)
            self.assertIn("sprite", weapon)
            
            # Check fields
            self.assertIsInstance(weapon["attack"], (int, float))
            self.assertIsInstance(weapon["type"], int)
            
            # Check ranges
            self.assertGreater(weapon["attack"], 0)
            self.assertIn(weapon["type"], [0, 1, 2, 3])
            self.assertIn(weapon["sprite"].replace("\"", ""), self.wall_tiles)
    
    def test_story_generation(self):
        """Test story generation functionality"""
        story = self.ai_result["story"]
        self.assertIsInstance(story, str)
        self.assertGreater(len(story), 50)  # Story should have reasonable length
    
    def test_invalid_api_key(self):
        """Test behavior with invalid API key"""
        cmd = ["python3", "src/backend/ai/ai_agent.py",
               "-k", "invalid_api_key", 
               "-s", "0", "castle", "\"no previous story\"",
               json.dumps(self.floor_tiles), json.dumps(self.wall_tiles)]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        self.assertNotEqual(result, "Invalid API Key", "Process should fail with invalid API key")
            
if __name__ == "__main__":
    unittest.main()

from os import system, getenv
from dotenv import load_dotenv
import os

load_dotenv()

apiKey = getenv("GROQ_API_KEY")

a = ["stone", "grass", "dirt", "wood"]
b = ["castle", "swamp", "cave", "forest"]

# system(f"python3 src/backend/ai/ai_agent.py -f a") # Missing API key
# system(f"python3 src/backend/ai/ai_agent.py -k api_key -f a") # Invalid number of rooms
# system(f"python3 src/backend/ai/ai_agent.py -k api_key -f 1 1") # Invalid area
# system(f"python3 src/backend/ai/ai_agent.py -k api_key -f 1 swamp {a}") # missing wall tile
# print("\n\n")

# system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -f 15 castle {b} {b}") # Floor generation
# system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -e 10 {a}") # Enemy generation
# system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -w 10 {a}") # Weapon generation
# system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -s none castle \"no previous story\"") # Story generation

# system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -f 15 castle {b} {b} -e 10 {a} -w 10 {a}") # Floor, enemy, weapon generation    
system(f"python3 src/backend/ai/ai_agent.py -k {apiKey} -f 15 castle {b} {b} -e 10 {a} -w 10 {a} -s none castle \"no previous story\"") # All generation
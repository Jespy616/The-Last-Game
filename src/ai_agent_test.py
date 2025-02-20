from os import system, getenv

apiKey = getenv("GROQ_API")

a = [i for i in range(1, 6)]
b = [i for i in range(6, 10)]

# system(f"python3 src/ai_agent.py -f a") # Missing API key
# system(f"python3 src/ai_agent.py -k api_key -f a") # Invalid number of rooms
# system(f"python3 src/ai_agent.py -k api_key -f 1 1") # Invalid area
# system(f"python3 src/ai_agent.py -k api_key -f 1 swamp {a}") #missing wall tile
# print("\n\n")
system(f"python3 src/ai_agent.py -k {apiKey} -f 15 swamp {a} {b}") #missing wall tiles
from os import system, getenv

apiKey = getenv("GROQ_API_KEY")

a = [i for i in range(1, 6)]
b = [i for i in range(6, 10)]

# system(f"python3 src/backend/ai/ai_agent.py -f a") # Missing API key
# system(f"python3 src/backend/ai/ai_agent.py -k api_key -f a") # Invalid number of rooms
# system(f"python3 src/backend/ai/ai_agent.py -k api_key -f 1 1") # Invalid area
# system(f"python3 src/backend/ai/ai_agent.py -k api_key -f 1 swamp {a}") # missing wall tile
# print("\n\n")
print(a)
print(b)
system(f"python3.11 ai/ai_agent.py -k {apiKey} -f 3 castle {a} {b}") # missing wall tiles
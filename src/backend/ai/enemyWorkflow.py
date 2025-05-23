from groq import Groq
from pydantic import BaseModel, Field
from random import randint, choice
import json
import threading

# Constants for defining the enemy stats range
ATTACK_MIN = 1
ATTACK_MAX = 10
HEALTH_MIN = 1
HEALTH_MAX = 10

# Define the enemy model for the LLM and validating the response
class Enemy(BaseModel):
    attack: int = Field(..., description="The attack power of the enemy")
    health: int = Field(..., description="The health of the enemy")
    sprite: str = Field(..., description="The sprite of the enemy")

# Main function for enemy generation
def enemyWorkflow(spriteList, numEnemies, apiKey):
    agent = Groq(api_key=apiKey, timeout=5)
    enemies = []
    threads = []
    
    # Threading function to create an enemy
    def createEnemy():
        enemy = makeEnemy(agent, spriteList)
        if enemy is not None:
            enemies.append(enemy)
    
    for i in range(numEnemies):
        thread = threading.Thread(target=createEnemy)
        threads.append(thread)
        thread.start()
    
    for thread in threads:
        thread.join()

    enemies_json = {
        "enemies": [json.loads(enemy.json()) for enemy in enemies]
    }

    return enemies_json


def makeEnemy(agent, spriteList):
    """
    Prompts the LLM to create an enemy with attack, health, and sprite\n
    """
    try:  # silences errors from the agent - prevents bad output messing up the server
        chat_completion = agent.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"You are a game designer that outputs enemies in JSON.\n The JSON object must use the schema: {json.dumps(Enemy.model_json_schema(), indent=2)}"
                },
                {
                    "role": "user",
                    "content": f"Create an enemy with an attack value between {ATTACK_MIN} and {ATTACK_MAX} inclusive, a health value between {HEALTH_MIN} and {HEALTH_MAX} inclusive. Pick one of the following: low attack with high health, high attack with low helath, or high attack with high health. Select a sprite from the following list: {json.dumps(spriteList)}. Be creative when making enemies"
                }
            ],
            model="llama3-8b-8192",
            temperature=1,
            stream=False,
            response_format={"type": "json_object"}
        )
        enemy = Enemy.model_validate_json(chat_completion.choices[0].message.content)
    except Exception as e:
        enemy = Enemy(attack=randint(ATTACK_MIN, ATTACK_MAX), health=randint(HEALTH_MIN, HEALTH_MAX), sprite=choice(spriteList))
        return enemy
    return enemy

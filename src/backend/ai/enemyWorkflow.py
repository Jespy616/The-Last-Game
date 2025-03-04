from groq import Groq
from pydantic import BaseModel, Field
from random import randint, choice
import json


ATTACK_MIN = 1
ATTACK_MAX = 10
HEALTH_MIN = 1
HEALTH_MAX = 10


class Enemy(BaseModel):
    attack: int = Field(..., description="The attack power of the enemy")
    health: int = Field(..., description="The health of the enemy")
    sprite: str = Field(..., description="The sprite of the enemy")


def enemyWorkflow(spriteList, apiKey):
    agent = Groq(api_key=apiKey, timeout=5)
    makeEnemy(agent, spriteList)


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
                    "content": f"Create an enemy with an attack value between {ATTACK_MIN} and {ATTACK_MAX}, a health value between {HEALTH_MIN} and {HEALTH_MAX}, and select a sprite from the following list: {json.dumps(spriteList)}."
                }
            ],
            model="llama3-70b-8192",
            temperature=1,
            stream=False,
            response_format={"type": "json_object"}
        )
        print(chat_completion.choices[0].message.content)
        enemy = Enemy.model_validate_json(chat_completion.choices[0].message.content)
    except Exception as e:
        print(e)
        enemy = Enemy(attack=randint(ATTACK_MIN, ATTACK_MAX), health=randint(HEALTH_MIN, HEALTH_MAX), sprite=choice(spriteList))
        return enemy
    return enemy



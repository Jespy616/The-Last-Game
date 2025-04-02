from groq import Groq
from pydantic import BaseModel, Field
from random import randint, choice
import json
import threading

# Constants for weapon stats generation
ATTACK_MIN = 1
ATTACK_MAX = 10
TYPES = [0, 1, 2, 3] # Melee, Line, AOE, Sweep


# Pydantic model for prompting the LLM and validating the response
class WeaponBase(BaseModel):
    attack: int = Field(..., description="The attack power of the weapon")
    type: int = Field(..., description="The attack type of the weapon")
    sprite: str = Field(..., description="The sprite of the weapon")


# Main function for weapon generation
def weaponWorkflow(spriteList, numWeapons, apiKey):
    agent = Groq(api_key=apiKey, timeout=5)
    weapons = []
    threads = []
    
    # Threading function
    def createWeapon():
        weapon = makeWeapon(agent, spriteList)
        if weapon is not None:
            weapons.append(weapon)
    
    for i in range(numWeapons):
        thread = threading.Thread(target=createWeapon)
        threads.append(thread)
        thread.start()
    
    for thread in threads:
        thread.join()

    weapons_json = {
        "weapons": [json.loads(weapon.json()) for weapon in weapons]
    }
    
    return weapons_json


def makeWeapon(agent, spriteList):
    """
    Prompts the LLM to create a weapon with attack, type, and sprite\n
    """
    try: # silences errors from the agent - prevents bad output messing up the server
        chat_completion = agent.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"You are in charge of creating a weapon with attack, type, and sprite. The JSON object must use the schema: {json.dumps(WeaponBase.model_json_schema(), indent=2)}"
                },
                {
                    "role": "user",
                    "content": f"Create a weapon with an attack value between {ATTACK_MIN} and {ATTACK_MAX} inclusive, a random type value from {TYPES}. Select a sprite from the following list: {json.dumps(spriteList)}. Be creative when making weapons"
                }
            ],
            model="llama3-8b-8192",
            temperature=1,
            stream=False,
            response_format={"type": "json_object"}
        )
        weapon = WeaponBase.model_validate_json(chat_completion.choices[0].message.content)
    except Exception as e:
        weapon = WeaponBase(attack=randint(ATTACK_MIN, ATTACK_MAX), type=choice(TYPES), sprite=choice(spriteList))
    return weapon
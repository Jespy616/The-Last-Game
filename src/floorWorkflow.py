from groq import Groq
import json
from pydantic import BaseModel, Field
from typing import List
import threading

class Room(BaseModel):
    tiles: List[List[str]] = Field(..., description="2D array representing the room tiles")

    def __str__(self):
        room = ""
        for row in self.tiles:
            room += " ".join(row) + "\n"
        return room


class Floor(BaseModel):
    pass


def floorWorkflow(numFloors, floorTiles, wallTiles, areaTo, apiKey):
    # TODO - Implement the workflow for creating floors
    agent = Groq(api_key=apiKey)
    rooms = []
    threads = []

    def create_room():
        room = makeRooms(agent)
        rooms.append(room)

    for i in range(numFloors):
        thread = threading.Thread(target=create_room)
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

    for room in rooms:
        print(room)
        print()
    print("Total rooms:", len(rooms))



def makeRooms(agent):
    # TODO - Implement LLM prompt for making rooms
    chat_completion = agent.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": f"You are a floor planner that outputs rooms in JSON.\n The JSON object must use the schema: {json.dumps(Room.model_json_schema(), indent=2)}"
            },
            {
                "role": "user",
                "content": f"Create a room with a 2D array of tiles. Each room should be 9 tiles tall and 13 tiles wide Each tile can be one of the following characters: 'w' for walls '.' for floors. Be creative when creating rooms."
            }
        ],
        model="llama3-70b-8192",
        temperature=0.9,
        stream=False,
        response_format={"type": "json_object"}
    )
    rooms = Room.model_validate_json(chat_completion.choices[0].message.content)
    return rooms

def checkRooms(room, chestCount):
    # TODO - Implement logic for checking rooms
    pass

def fixRoom(room):
    # TODO - Implement logic for fixing rooms
    pass

def connectRooms(roomCount, apiKey):
    # TODO - Implement LLM prompt for creating floor map
    pass

def createAdjacency(floorMap, roomCount):
    # TODO - Implement logic for creating adjacency list
    pass

def chooseTiles(floorTiles, wallTiles, areaTo):
    # TODO - Implement LLM prompt for choosing tiles
    pass
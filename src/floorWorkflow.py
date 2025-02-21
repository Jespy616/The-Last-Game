from groq import Groq
import json
from pydantic import BaseModel, Field
from typing import List
import threading
import heapq
from copy import deepcopy
from defaults import floorDefaults

ROOM_WIDTH = 13
ROOM_HEIGHT = 9

class Room(BaseModel):
    tiles: List[List[str]] = Field(..., description="2D array representing the room tiles")

    def __str__(self):
        room = ""
        for row in self.tiles:
            room += " ".join(row) + "\n"
        return room
    
    def __len__(self):
        return len(self.tiles)
    
    def __iter__(self):
        for row in self.tiles:
            yield row
    
    def __getitem__(self, index):
        return self.tiles[index]


class Floor(BaseModel):
    pass


def floorWorkflow(numFloors, floorTiles, wallTiles, areaTo, apiKey):
    agent = Groq(api_key=apiKey, timeout=5)
    rooms = []
    threads = []

    # def createRoom():
        # room = makeRooms(agent)
        # if room is not None:
            # rooms.append(room)

    # for i in range(numFloors):
        # thread = threading.Thread(target=createRoom)
        # threads.append(thread)
        # thread.start()

    # for thread in threads:
        # thread.join()

    # Use this line for testing without LLM
    rooms = [floorDefaults[f"room{i+1}"] for i in range(len(floorDefaults))]

    roomCount = 0
    for room in rooms:
        status, reason = checkRooms(room, 0)
        print(f"\nRoom: {roomCount}, Status {status}, Reason: {reason}")
        while not status:
            fixRoom(room, reason)
            status, reason = checkRooms(room, 0)
            print(f"Room: {roomCount}, Status {status}, Reason: {reason}")
        if reason != "Valid":
            pass
        for row in room:
            print(" ".join(row))
        roomCount += 1
    print("Total rooms:", len(rooms))



def makeRooms(agent):
    try: # silences errors from the agent - prevents bad ouput messing up the server
        chat_completion = agent.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"You are a floor planner that outputs rooms in JSON.\n The JSON object must use the schema: {json.dumps(Room.model_json_schema(), indent=2)}"
                },
                {
                    "role": "user",
                    "content": f"Create a room with a 2D array of tiles. Each room must be {ROOM_HEIGHT} tiles tall and {ROOM_WIDTH} tiles wide and should have no empty tiles. Each tile can be only one of the following characters: 'w' for walls '.' for floors. Be creative when creating rooms."
                }
            ],
            model="llama3-70b-8192",
            temperature=0.9,
            stream=False,
            response_format={"type": "json_object"}
        )
        rooms = Room.model_validate_json(chat_completion.choices[0].message.content)
    except Exception as e:
        print(e)
        return
    return rooms


def checkRooms(room, chestCount):
    # TODO - Implement logic for checking chests
    # TODO - Implement logic for checking rooms
    # print(room, end="")

    # Check if the room is random characters
    for row in room:
        for item in row:
            if item not in ["w", ".", "*"]:
                return True, "Garbage"

    # Check if room is the correct size
    if len(room) != ROOM_HEIGHT:
        return True, "Height"
    for row in room:
        if len(row) != ROOM_WIDTH:
            return False, "Width"
        
    # Check if borders are walls
    for i in range(ROOM_HEIGHT):
        if room[i][0] != "w" or room[i][ROOM_WIDTH - 1] != "w":
            return False, "Borders"
    for i in range(ROOM_WIDTH):
        if room[0][i] != "w" or room[ROOM_HEIGHT - 1][i] != "w":
            return False, "Borders"

    # Check if all tiles are connected
    floodStart, floodX, floodY = getFloodStart(room)

    if floodStart != ".":
        return False, "Connections"

    floodFill(room, floodX, floodY, ".", "$")
    
    for row in room:
        if "." in row:
            floodFill(room, floodX, floodY, "$", ".")
            return False, "Connections"
    floodFill(room, floodX, floodY, "$", ".")
        
    # Check if doors are reachable
    doorPos = [(ROOM_HEIGHT // 2, 0), (ROOM_HEIGHT // 2, ROOM_WIDTH - 1), (0, ROOM_WIDTH // 2), (ROOM_HEIGHT - 1, ROOM_WIDTH // 2)]
    roomCopy = deepcopy(room)

    for i in range(len(doorPos)):
        roomCopy[doorPos[i][0]][doorPos[i][1]] = "."
    
    floodFill(roomCopy, floodX, floodY, ".", "*")
    for row in roomCopy:
        if "." in row:
            return True, "Doors"
    
    # Check if borders are walls
    for i in range(ROOM_HEIGHT):
        if room[i][0] != "w" or room[i][ROOM_WIDTH - 1] != "w":
            return False, "Borders"
    for i in range(ROOM_WIDTH):
        if room[0][i] != "w" or room[ROOM_HEIGHT - 1][i] != "w":
            return False, "Borders"
        
    return True, "Valid"


def fixRoom(room, reason):
    if reason == "Garbage":
        pass
    elif reason == "Height":
        pass
    elif reason == "Width":
        for row in room:
            while len(row) < ROOM_WIDTH:
                row.insert(len(row) - 1, ".")
    elif reason == "Borders":
        for i in range(ROOM_HEIGHT):
            if room[i][0] != "w":
                room[i][0] = "w"
            if room[i][ROOM_WIDTH - 1] != "w":
                room[i][ROOM_WIDTH - 1] = "w"
        for i in range(ROOM_WIDTH):
            if room[0][i] != "w":
                room[0][i] = "w"
            if room[ROOM_HEIGHT - 1][i] != "w":
                room[ROOM_HEIGHT - 1][i] = "w"
    elif reason == "Connections":
        floodFill(room, 1, 1, ".", "$")
        path = aStar(room, "$", ".", "w")
        for tile in path:
            room[tile[0]][tile[1]] = "."
        floodFill(room, 1, 1, "$", ".")
    elif reason == "Doors":
        pass




def connectRooms(roomCount):
    # TODO - Implement LLM prompt for creating floor map
    pass


def createAdjacency(floorMap, roomCount):
    # TODO - Implement logic for creating adjacency list
    pass


def chooseTiles(floorTiles, wallTiles, areaTo):
    # TODO - Implement LLM prompt for choosing tiles
    pass

def getFloodStart(arr):
    floodX = 1
    floodY = 1
    floodStart = arr[floodY][floodX]
    while (floodStart != "." or floodStart != "*") and floodY < ROOM_HEIGHT - 2 and floodX < ROOM_WIDTH - 2:
        floodX += 1
        if floodX == ROOM_WIDTH - 1:
            floodX = 1
            floodY += 1
        floodStart = arr[floodY][floodX]
    return floodStart, floodX, floodY


def floodFill(array, x, y, target, replacement):
    # Flood fill algorithm 
    # Replaces all instances of target with replacement starting at (x,y) to check if all tiles are connected
    if target == replacement:
        return

    rows, cols = len(array), len(array[0])
    stack = [(x, y)]

    while stack:
        cx, cy = stack.pop()
        if array[cy][cx] == target:
            array[cy][cx] = replacement
            if cx > 0: stack.append((cx - 1, cy))
            if cx < cols - 1: stack.append((cx + 1, cy))
            if cy > 0: stack.append((cx, cy - 1))
            if cy < rows - 1: stack.append((cx, cy + 1))


def aStar(array, startTile, goalTile, wallTile):
    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    def neighbors(node):
        dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        result = []
        for dir in dirs:
            neighbor = (node[0] + dir[0], node[1] + dir[1])
            if 0 <= neighbor[0] < len(array) and 0 <= neighbor[1] < len(array[0]):
                result.append(neighbor)
        return result

    start = None
    goal = None

    for y in range(len(array)):
        for x in range(len(array[0])):
            if array[y][x] == startTile:
                start = (y, x)
            if array[y][x] == goalTile:
                goal = (y, x)

    if not start or not goal:
        return []

    openSet = []
    heapq.heappush(openSet, (0, start))
    cameFrom = {}
    gScore = {start: 0}
    fScore = {start: heuristic(start, goal)}

    while openSet:
        _, current = heapq.heappop(openSet)

        if current == goal:
            path = []
            while current in cameFrom:
                current = cameFrom[current]
                if array[current[0]][current[1]] == wallTile:
                    path.append(current)
            return path

        for neighbor in neighbors(current):
            tentativeGScore = gScore[current] + 1

            if neighbor not in gScore or tentativeGScore < gScore[neighbor]:
                cameFrom[neighbor] = current
                gScore[neighbor] = tentativeGScore
                fScore[neighbor] = tentativeGScore + heuristic(neighbor, goal)
                heapq.heappush(openSet, (fScore[neighbor], neighbor))

    return []

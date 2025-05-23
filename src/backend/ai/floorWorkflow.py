from groq import Groq
import json
from pydantic import BaseModel, Field
from typing import List
import threading
import heapq
from copy import deepcopy
from defaults import roomDefaults
from random import randint, shuffle, choice

# Constants defining room dimensions
ROOM_WIDTH = 13
ROOM_HEIGHT = 9

# Pydantic models for room and tiles
# Used to tell the LLM what the structure of the room and tiles should be
# and to validate the room and tiles created by the LLM
class Room(BaseModel):
    """
    Represents a room in the floor plan\n
    Used to define the structure and validate the room created by the LLM\n
    """
    tiles: List[List[str]] = Field(..., description="2D array representing the room tiles")
    def __init__(self, tiles: List[List[str]]):
        super().__init__(tiles=tiles)

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

class Tiles(BaseModel):
    """
    Represents the tiles used in the room\n
    Used to define the structure and validate the tiles created by the LLM\n
    """
    floor: str = Field(..., description="The tile used for the floor")
    wall: str = Field(..., description="The tile used for the walls")
    def __init__(self, floor: str, wall: str):
        super().__init__(floor=floor, wall=wall)

    def __str__(self):
        return f"Floor: {self.floor}, Wall: {self.wall}"

    def __len__(self):
        return 2
    
    def __iter__(self):
        yield self.floor
        yield self.wall
    
    def __getitem__(self, index):
        if index == 0:
            return self.floor
        elif index == 1:
            return self.wall
        else:
            raise IndexError


# Main function for creating rooms
def floorWorkflow(numFloors, floorTiles, wallTiles, areaTo, apiKey):
    """
    Defines the basic workflow for creating rooms created by the LLM:\n
    1. Create rooms\n
    2. Check rooms\n
    3. Fix rooms\n
    4. Connect rooms\n
    5. Creates adjacency list\n
    6. Choose tiles\n
    """
    agent = Groq(api_key=apiKey, timeout=5)
    rooms = []
    floorTiles = [choice(floorTiles)]
    wallTiles = [choice(wallTiles)]
    threads = []

    # Threading functions
    def createRoom():
        room = makeRooms(agent)
        if room is not None:
            rooms.append(room)
    
    def pickTiles():
        floors, walls= chooseTiles(floorTiles, wallTiles, areaTo, agent)
        if floors is not None and walls is not None:
            floorTiles[0] = floors
            wallTiles[0] = walls
    

    # Start threads for creating rooms and picking tiles
    for i in range(numFloors):
        thread = threading.Thread(target=createRoom)
        threads.append(thread)
        thread.start()
    
    thread = threading.Thread(target=pickTiles)
    threads.append(thread)
    thread.start()
    
    for thread in threads:
        thread.join()

    # Build the floor plan procedurally
    floorMap = makeFloor(numFloors)
    # Build the adjacency matrix
    adjMatrix = createRoomAdjacency(floorMap, numFloors)

    # Check rooms and fix them if necessary
    for i, room in enumerate(rooms):
        status, reason = checkRooms(room)
        # If the room is invalid, fix it
        while not status:
            fixRoom(room, reason)
            status, reason = checkRooms(room)
        if reason != "Valid" and reason != "Doors":
            room = roomDefaults[f"room{randint(1, len(roomDefaults))}"]
        if reason == "Doors":
            # Check to see if the doors are connected to the other rooms
            # using the adjacency matrix
            room = checkDoors(room, adjMatrix, i)

    # Create JSON object
    roomsDict = {}
    count = 1
    for room in rooms:
        roomsDict[f"room{count}"] = room.model_dump()["tiles"]
        count += 1

    result = {
        "rooms": roomsDict,
        "floorMap": floorMap,
        "adjacencyMatrix": adjMatrix,
        "floorTiles": floorTiles[0],
        "wallTiles": wallTiles[0]
    }

    # Convert to JSON string and return it
    result_json = json.dumps(result, indent=4)
    return result_json


def makeRooms(agent):
    """
    Prompts the LLM to create a ROOM_HEIGHTxROOM_WIDTH room\n
    """
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
            temperature=1,
            stream=False,
            response_format={"type": "json_object"}
        )
        rooms = Room.model_validate_json(chat_completion.choices[0].message.content)
    except Exception as e:
        rooms = Room(roomDefaults[f"room{randint(1, len(roomDefaults))}"])
    return rooms


def checkRooms(room):
    """
    Checks if the room is valid\n
    Evaluates if unrecognized symbols, incorrect height, incorrect width, missing borders, disconnected tiles, unreachable doors\n
    """
    # Check if the room is random characters
    for row in room:
        for item in row:
            if item not in ["w", "."]:
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

    # Use modified flood fill algorithm to check if all tiles are connected
    floodFill(room, floodX, floodY, ".", "$")
    
    # Check if all tiles are connected
    for row in room:
        if "." in row:
            floodFill(room, floodX, floodY, "$", ".")
            return False, "Connections"
    # reset the room
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


def checkDoors(room, adjMatrix, roomIndex):
    _, floodX, floodY = getFloodStart(room.tiles)
    
    # Check if doors are reachable
    doorPos = [(ROOM_HEIGHT // 2, 0), (ROOM_HEIGHT // 2, ROOM_WIDTH - 1), (0, ROOM_WIDTH // 2), (ROOM_HEIGHT - 1, ROOM_WIDTH // 2)]
    directions = ["W", "E", "N", "S"]
    roomCopy = deepcopy(room.tiles)

    for i in range(len(doorPos)):
        if directions[i] in adjMatrix[roomIndex]:
            roomCopy[doorPos[i][0]][doorPos[i][1]] = "."
    
    # Place empty spaces where the doors are
    for i in range(ROOM_HEIGHT):
        if roomCopy[i][0] == "w":
            roomCopy[i][0] = "*"
        if roomCopy[i][ROOM_WIDTH - 1] == "w":
            roomCopy[i][ROOM_WIDTH - 1] = "*"
    for i in range(ROOM_WIDTH):
        if roomCopy[0][i] == "w":
            roomCopy[0][i] = "*"
        if roomCopy[ROOM_HEIGHT - 1][i] == "w":
            roomCopy[ROOM_HEIGHT - 1][i] = "*"
    
    # Check if the doors are reachable
    floodFill(roomCopy, floodX, floodY, ".", "$")
    
    while True: # repeat until all doors are reachable
        _, floodX, floodY = getFloodStart(roomCopy)
        for i in range(len(directions)):
            if directions[i] in adjMatrix[roomIndex] and roomCopy[doorPos[i][0]][doorPos[i][1]] != "$":
                # If the door is not reachable, find a path to it and remove the wall
                floodFill(roomCopy, floodX, floodY, ".", "$")
                path = aStar(roomCopy, ".", "$", "w", "*")
                for tile in path:
                    room.tiles[tile[0]][tile[1]] = "."
                    roomCopy[tile[0]][tile[1]] = "."
                floodFill(roomCopy, floodX, floodY, "$", ".")
        
        # Reset the roomCopy
        floodFill(roomCopy, floodX, floodY, ".", "$")
        rows = 0
        for row in roomCopy:
            if "." not in row:
                rows += 1
        if rows == ROOM_HEIGHT:
            break

    # Apply changes from roomCopy back to the original room
    for y in range(ROOM_HEIGHT):
        for x in range(ROOM_WIDTH):
            if roomCopy[y][x] == "$":
                room.tiles[y][x] = "."

    return room


def fixRoom(room, reason):
    """Fixes the room based on the reason it failed the checkRooms function\n
    If the room contains invalid symbols or is the wrong height, it will be discarded\n
    """
    if reason == "Garbage" or reason == "Height":
        # Throw the room out
        pass
    elif reason == "Width":
        # Add or remove columns to make the room the correct width
        for row in room:
            while len(row) < ROOM_WIDTH:
                row.insert(len(row) - 1, ".")
            while len(row) > ROOM_WIDTH:
                row.pop()
    elif reason == "Borders":
        # Add walls to the borders
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
        # Use flood fill to connect all tiles
        floodFill(room, 1, 1, ".", "$")
        path = aStar(room, "$", ".", "w")
        for tile in path:
            room[tile[0]][tile[1]] = "."
        floodFill(room, 1, 1, "$", ".")


def makeFloor(roomCount):
    """
    Generates a random floor plan with roomCount rooms
    """
    # defines the size of the floor
    FLOOR_WIDTH = (roomCount + 2) // 2
    FLOOR_HEIGHT = (roomCount + 2) // 2

    floor = [[0 for _ in range(FLOOR_WIDTH)] for _ in range(FLOOR_HEIGHT)]
    roomsRemaining = [i for i in range(1, roomCount + 1)]
    shuffle(roomsRemaining)
    previousRooms = [[randint(0, FLOOR_WIDTH - 1), randint(0, FLOOR_HEIGHT - 1)]]
    floor[previousRooms[0][0]][previousRooms[0][1]] = roomsRemaining.pop()

    # Function to calculate the density of a room
    # Density is the number of adjacent rooms to a given room
    # Used to determine the best location to place a room
    def calculateDensity(x, y):
        density = 0
        for i in range(max(0, x - 1), min(FLOOR_WIDTH, x + 2)):
            for j in range(max(0, y - 1), min(FLOOR_HEIGHT, y + 2)):
                if floor[i][j] != 0:
                    density += 1
        return density

    while roomsRemaining:
        room = roomsRemaining.pop()
        placedRoom = choice(previousRooms)
        x = placedRoom[0]
        y = placedRoom[1]

        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]  # Only horizontal and vertical directions
        shuffle(directions)

        bestDirection = None
        lowestDensity = float('inf')

        # Find the best direction to place the room based on density and a random room
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < FLOOR_WIDTH and 0 <= ny < FLOOR_HEIGHT and floor[nx][ny] == 0:
                # Ensure the new room is adjacent to an existing room
                if (nx > 0 and floor[nx - 1][ny] != 0) or (nx < FLOOR_WIDTH - 1 and floor[nx + 1][ny] != 0) or \
                   (ny > 0 and floor[nx][ny - 1] != 0) or (ny < FLOOR_HEIGHT - 1 and floor[nx][ny + 1] != 0):
                    density = calculateDensity(nx, ny)
                    if density < lowestDensity:
                        lowestDensity = density
                        bestDirection = (dx, dy)

        # If a direction was found, place the room and add it to the list of previous rooms
        # Otherwise, reinsert the room at the beginning of the list
        if bestDirection:
            x += bestDirection[0]
            y += bestDirection[1]
            floor[x][y] = room
            previousRooms.append([x, y])
        else:
            roomsRemaining.insert(0, room)  # Reinsert the room at the beginning of the list

    return floor


def createRoomAdjacency(floorMap, roomCount):
    adjMatrix = [["" for _ in range(roomCount)] for _ in range(roomCount)]

    # Loops through the floor map and adds the appropriate directions to the adjacency matrix
    for i in range(len(floorMap)):
        for j in range(len(floorMap[i])):
            if floorMap[i][j] == 0:
                continue
            
            if j > 0 and floorMap[i][j - 1] != 0 and floorMap[i][j] <= roomCount and floorMap[i][j - 1] <= roomCount:
                adjMatrix[floorMap[i][j] - 1][floorMap[i][j - 1] - 1] = "W"
                adjMatrix[floorMap[i][j - 1] - 1][floorMap[i][j] - 1] = "E"

            if j < len(floorMap[i]) - 1 and floorMap[i][j + 1] != 0 and floorMap[i][j] <= roomCount and floorMap[i][j + 1] <= roomCount:
                adjMatrix[floorMap[i][j] - 1][floorMap[i][j + 1] - 1] = "E"
                adjMatrix[floorMap[i][j + 1] - 1][floorMap[i][j] - 1] = "W"

            if i > 0 and floorMap[i - 1][j] != 0 and floorMap[i][j] <= roomCount and floorMap[i - 1][j] <= roomCount:
                adjMatrix[floorMap[i][j] - 1][floorMap[i - 1][j] - 1] = "N"
                adjMatrix[floorMap[i - 1][j] - 1][floorMap[i][j] - 1] = "S"

            if i < len(floorMap) - 1 and floorMap[i + 1][j] != 0 and floorMap[i][j] <= roomCount and floorMap[i + 1][j] <= roomCount:
                adjMatrix[floorMap[i][j] - 1][floorMap[i + 1][j] - 1] = "S"
                adjMatrix[floorMap[i + 1][j] - 1][floorMap[i][j] - 1] = "N"

    return adjMatrix


def chooseTiles(floorTiles, wallTiles, areaTo, agent):
    """
    Prompts the LLM to choose the tiles for the room\n
    """
    try:
        chat_completion = agent.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"You are a floor designer that is in charge of picking the tiles in a room. You will be given the floor and wall tiles to choose from and the area to place the room in. Format your response as a JSON object with the schema: {json.dumps(Tiles.model_json_schema(), indent=2)}"
                },
                {
                    "role": "user",
                    "content": f"Choose the best fitting floor tiles from {floorTiles} best fitting wall tile from {wallTiles} to fit the map for the {areaTo} area."
                }
            ],
                model="llama3-70b-8192",
                temperature=1,
                stream=False,
                response_format={"type": "json_object"}
        )
        tiles = Tiles.model_validate_json(chat_completion.choices[0].message.content)
    except Exception as e:
        print(e)
        tiles = Tiles(floor=choice(floorTiles), wall=choice(wallTiles))
    return tiles.floor, tiles.wall


# from here to the bottom of file are helper functions for room creation and checks
def getFloodStart(arr):
    """Finds the starting point for the flood fill algorithm\n
    Used to check if all tiles are connected in a room\n
    """
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
    """Flood fill algorithm\n 
    Replaces all instances of target with replacement starting at (x,y) to check if all tiles are connected\n
    Used to check if all tiles are connected in a room\n
    See this article for more details: https://en.wikipedia.org/wiki/Flood_fill
    """
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


def aStar(array, startTile, goalTile, wallTile, ignoreTile=None): 
    """ A* pathfinding algorithm\n
    Finds the shortest path between two tiles in a 2D array\n
    Replaces tiles in order to make the room connected
    """
    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    def neighbors(node):
        dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        result = []
        for dir in dirs:
            neighbor = (node[0] + dir[0], node[1] + dir[1])
            if 0 <= neighbor[0] < len(array) and 0 <= neighbor[1] < len(array[0]):
                if ignoreTile is None or array[neighbor[0]][neighbor[1]] != ignoreTile:
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
            if start and goal:
                break
        if start and goal:
            break

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


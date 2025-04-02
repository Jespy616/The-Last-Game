from argparse import ArgumentParser
from sys import exit
import re
import json
import threading
from floorWorkflow import floorWorkflow
from enemyWorkflow import enemyWorkflow
from weaponWorkflow import weaponWorkflow
from storyWorkflow import storyWorkflow

def main():
    parser = ArgumentParser(description='Prompt the Groq LLM')

    # API key argument - Is the only required argument
    parser.add_argument("-k", "--api_key", help="API key for the Groq LLM", required=True)

    # Floor argument
    floorHelp = "-f {Number of rooms} {area to} {floor tiles} {wall tiles}"
    parser.add_argument("-f", "--floor", nargs="*", help=floorHelp)

    # Enemy argument
    enemyHelp = "-e {Number of enemies} {sprite list}"
    parser.add_argument("-e", "--enemy", nargs="*", help=enemyHelp)

    # Weapon argument
    weaponHelp = "-w {number of weapons} {sprite list}"
    parser.add_argument("-w", "--weapon", nargs="*", help=weaponHelp)

    # Story argument
    parser.add_argument("-s", "--story", nargs="*")
    args = parser.parse_args()
    
    apiKey = args.api_key

    # Results are stored in these variables to allow for threading
    # Defaulted to None if the argument is not provided
    floors = None
    enemies = None
    weapons = None
    story = None
    threads = []

    if args.floor:
        # Function to allow threading
        def floor_thread_func():
            # Nonlocal variable to allow for assignment to the outer scope
            nonlocal floors
            # Convert the list of arguments to a string
            args.floor = ' '.join(args.floor)
            # Parse the floor argument with the parseFloor function
            roomCount, area, floorTiles, wallTiles = parseFloor(args.floor, parser)
            floors = floorWorkflow(roomCount, floorTiles, wallTiles, area, apiKey)
        
        floor_thread = threading.Thread(target=floor_thread_func)
        threads.append(floor_thread)
        floor_thread.start()

    if args.enemy:
        # Threading function
        def enemy_thread_func():
            # Nonlocal variable to allow for assignment to the outer scope
            nonlocal enemies
            # Convert the list of arguments to a string
            args.enemy = " ".join(args.enemy)
            # Get the number of enemies
            numEnemies = args.enemy.split(" ", 1)[0]
            if numEnemies.isnumeric():
                numEnemies = int(numEnemies)
            else:
                print("Invalid number of enemies")
                parser.print_help()
                exit(0)
            args.enemy = args.enemy.replace(f"{numEnemies} ", "")
            # Get the sprite list using the parseList function
            spriteList = parseList(args.enemy, parser, "Invalid enemy sprite list")
            enemies = enemyWorkflow(spriteList, numEnemies, apiKey)
        
        enemy_thread = threading.Thread(target=enemy_thread_func)
        threads.append(enemy_thread)
        enemy_thread.start()

    if args.weapon:
        # Same format as the enemy argument parsing
        # Threading function
        def weapon_thread_func():
            nonlocal weapons
            args.weapon = " ".join(args.weapon)
            numWeapons = args.weapon.split(" ", 1)[0]
            if numWeapons.isnumeric():
                numWeapons = int(numWeapons)
            else:
                print("Invalid number of weapons")
                parser.print_help()
                exit(0)
            args.weapon = args.weapon.replace(f"{numWeapons} ", "")
            spriteList = parseList(args.weapon, parser, "Invalid weapon sprite list")
            weapons = weaponWorkflow(spriteList, numWeapons, apiKey)
        
        weapon_thread = threading.Thread(target=weapon_thread_func)
        threads.append(weapon_thread)
        weapon_thread.start()
        
    if args.story:
        # Threading function
        def storyThreadFunc():
            nonlocal story
            # Convert the list of arguments to a string
            story = " ".join(args.story)
            # Split the argument based on the first 2 spaces
            # ensures that the first 2 are areas and story stays intact
            if len(story.split(" ", 2)) != 3:
                print("Invalid story format")
                parser.print_help()
                exit(0)
            prevArea = story.split(" ", 1)[0]
            nextArea = story.split(" ", 2)[1]
            prevStory = story.split(" ", 2)[2]
            story = storyWorkflow(prevArea, nextArea, prevStory, apiKey)
        
        storyThread = threading.Thread(target=storyThreadFunc)
        threads.append(storyThread)
        storyThread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()

    # Create the output JSON from the results
    outputJson = {}
    if floors:
        if isinstance(floors, str):
            outputJson["floors"] = json.loads(floors)
        else:
            outputJson["floors"] = floors
    if enemies:
        outputJson["enemies"] = enemies["enemies"]
    if weapons:
        outputJson["weapons"] = weapons["weapons"]
    if story:
        outputJson["story"] = story

    outputJson = json.dumps(outputJson, indent=4)
    print(outputJson)


def parseList(parseString, parser, errorMsg):
    # Use regex to find the first array 
    pattern = re.compile(r'\[([^\]]+)\]')
    match = pattern.search(parseString)
    # if the pattern is found, get the first array 
    if match:
        arr = match.group(1)
        if ',' in arr:
            arr = arr.split(',')
        else:
            arr = arr.split()
        arr = [item.strip() for item in arr]
        results = list(arr)
    else:
        # if not found, print error message and help
        print(errorMsg)
        parser.print_help()
        exit(0)
    return results


def parseFloor(floorStr, parser):
    # get the number of rooms
    if floorStr.split(" ", 1)[0].isnumeric():
        roomCount = int(floorStr.split(" ", 1).pop(0))
    else:
        print("Invalid number of rooms")
        parser.print_help()
        exit(0)
    # remove number of rooms from the string
    floorStr = floorStr.replace(f"{roomCount} ", "")
    
    # get the area
    if floorStr.split(" ", 1)[0].isalpha():
        area = floorStr.split(" ", 1).pop(0)
    else:
        print("Invalid area")
        parser.print_help()
        exit(0)
    # remove the area from the string
    floorStr = floorStr.replace(f"{area} ", "")

    floorTiles = parseList(floorStr, parser, "Invalid floor tiles")
    # Remove the parsed floor tiles from the string
    floorStr = floorStr.replace(f"[{' '.join(floorTiles)}]", "").replace(f"[{', '.join(floorTiles)}]", "", 1).strip()
    wallTiles = parseList(floorStr, parser, "Invalid wall tiles")

    return roomCount, area, floorTiles, wallTiles


if __name__ == '__main__':
    main()

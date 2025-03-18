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
    parser.add_argument("-k", "--api_key", help="API key for the Groq LLM", required=True)
    floorHelp = "-f {Number of rooms} {area to} {floor tiles} {wall tiles}"
    parser.add_argument("-f", "--floor", nargs="*", help=floorHelp)
    enemyHelp = "-e {Number of enemies} {sprite list}"
    parser.add_argument("-e", "--enemy", nargs="*", help=enemyHelp)
    weaponHelp = "-w {number of weapons} {sprite list}"
    parser.add_argument("-w", "--weapon", nargs="*", help=weaponHelp)
    parser.add_argument("-s", "--story", nargs="*")
    args = parser.parse_args()
    
    apiKey = args.api_key
    floors = None
    enemies = None
    weapons = None
    story = None
    threads = []

    if args.floor:
        def floor_thread_func():
            nonlocal floors
            args.floor = ' '.join(args.floor)
            roomCount, area, floorTiles, wallTiles = parseFloor(args.floor, parser)
            floors = floorWorkflow(roomCount, floorTiles, wallTiles, area, apiKey)
        
        floor_thread = threading.Thread(target=floor_thread_func)
        threads.append(floor_thread)
        floor_thread.start()

    if args.enemy:
        def enemy_thread_func():
            nonlocal enemies
            args.enemy = " ".join(args.enemy)
            numEnemies = args.enemy.split(" ", 1)[0]
            if numEnemies.isnumeric():
                numEnemies = int(numEnemies)
            else:
                print("Invalid number of enemies")
                parser.print_help()
                exit(0)
            args.enemy = args.enemy.replace(f"{numEnemies} ", "")
            spriteList = parseList(args.enemy, parser, "Invalid enemy sprite list")
            enemies = enemyWorkflow(spriteList, numEnemies, apiKey)
        
        enemy_thread = threading.Thread(target=enemy_thread_func)
        threads.append(enemy_thread)
        enemy_thread.start()

    if args.weapon:
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
        def storyThreadFunc():
            nonlocal story
            story = " ".join(args.story)
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

    outputJson = {}
    if floors:
        if isinstance(floors, str):
            outputJson["floors"] = json.loads(floors)
        else:
            outputJson["floors"] = floors
    if enemies:
        outputJson["enemies"] = enemies
    if weapons:
        outputJson["weapons"] = weapons
    if story:
        outputJson["story"] = story

    outputJson = json.dumps(outputJson, indent=4)
    print(outputJson)


def parseList(parseString, parser, errorMsg):
    # Use regex to find the first array 
    pattern = re.compile(r'\[([^\]]+)\]')
    match = pattern.search(parseString)
    if match:
        tiles = match.group(1)
        if ',' in tiles:
            tiles = tiles.split(',')
        else:
            tiles = tiles.split()
        tiles = [tile.strip() for tile in tiles]
        floorTiles = list(tiles)
    else:
        print(errorMsg)
        parser.print_help()
        exit(0)
    return floorTiles


def parseFloor(floorStr, parser):
    if floorStr.split(" ", 1)[0].isnumeric():
        roomCount = int(floorStr.split(" ", 1).pop(0))
    else:
        print("Invalid number of rooms")
        parser.print_help()
        exit(0)
    floorStr = floorStr.replace(f"{roomCount} ", "")
    
    if floorStr.split(" ", 1)[0].isalpha():
        area = floorStr.split(" ", 1).pop(0)
    else:
        print("Invalid area")
        parser.print_help()
        exit(0)
    floorStr = floorStr.replace(f"{area} ", "")

    floorTiles = parseList(floorStr, parser, "Invalid floor tiles")
    # Remove the parsed floor tiles from the string
    floorStr = floorStr.replace(f"[{' '.join(floorTiles)}]", "").replace(f"[{', '.join(floorTiles)}]", "").strip()
    wallTiles = parseList(floorStr, parser, "Invalid wall tiles")

    # print("Room count:", roomCount)
    # print("Area:", area)
    # print("Floor tiles:", floorTiles)
    # print("Wall tiles:", wallTiles)

    return roomCount, area, floorTiles, wallTiles


if __name__ == '__main__':
    main()

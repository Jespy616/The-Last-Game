from argparse import ArgumentParser
from sys import exit
import re
import json
from floorWorkflow import floorWorkflow
from enemyWorkflow import enemyWorkflow
from weaponWorkflow import weaponWorkflow

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

    # Splits the floor arguments into usable data
    if args.floor:
        args.floor = ' '.join(args.floor)
        roomCount,  area, floorTiles, wallTiles = parseFloor(args.floor, parser)
        floors = floorWorkflow(roomCount, floorTiles, wallTiles, area, apiKey)

    if args.enemy:
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


    if args.weapon:
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
        
    if args.story:
        pass # TODO implement story parsing

    outputJson = {}
    if floors:
        outputJson["floors"] = floors
    if enemies:
        outputJson["enemies"] = enemies
    if weapons:
        outputJson["weapons"] = weapons
    print(json.dumps(outputJson))


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

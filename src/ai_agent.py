from argparse import ArgumentParser
from sys import exit
import re

def main():
    parser = ArgumentParser(description='Prompt the Groq LLM')
    parser.add_argument("-k", "--api_key", help="API key for the Groq LLM", required=True)
    floorHelp = "-f {Number of rooms} {area to} {floor tiles} {wall tiles}"
    parser.add_argument("-f", "--floor", nargs="*", help=floorHelp)
    parser.add_argument("-w", "--weapon", nargs="?")
    parser.add_argument("-s", "--story", nargs="*")
    args = parser.parse_args()
    
    api_key = args.api_key
    floorStr = ""

    # Splits the floor arguments into usable data
    if args.floor:
        args.floor = ' '.join(args.floor)
        floorStr = args.floor
        parseFloor(floorStr, parser)

    if args.weapon:
        pass # TODO implement weapon parsing

    if args.story:
        pass # TODO implement story parsing


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

        return roomCount, area, floorTiles, wallTiles

if __name__ == '__main__':
    main()

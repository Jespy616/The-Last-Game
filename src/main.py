
from argparse import ArgumentParser

def main():
    parser = ArgumentParser(description='Prompt the LLM')
    parser.add_argument("-f", "--floor", nargs="*")
    parser.add_argument("-w", "--weapon", nargs="?")
    parser.add_argument("-s", "--story", nargs="*")
    args = parser.parse_args()
    
    if args.floor:
        args.floor = ' '.join(args.floor)
    
    print(args)

if __name__ == '__main__':
    main()

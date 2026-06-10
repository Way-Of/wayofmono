import os
import re
import sys
import argparse

def safe_filename(title):
    # Remove illegal filename characters
    return re.sub(r'[\\/*?:"<>|]', "", title).strip()

def main():
    parser = argparse.ArgumentParser(description="Save HTML content to a local file.")
    parser.add_argument("--title", required=True, help="Report title (used as filename)")
    args = parser.parse_args()

    # Read all content from standard input (STDIN), which is not subject to shell parameter length limits
    try:
        content = sys.stdin.read()
        if not content:
            print("Error: No content received from STDIN.", file=sys.stderr)
            sys.exit(1)

        filename = f"{safe_filename(args.title)}.html"

        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"Successfully generated: {os.path.abspath(filename)}")
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
r"""
Get Recommendations - Called by Node.js backend
Returns similar Polyvore outfits for uploaded image
"""

import sys
import json
import argparse
from pathlib import Path

# Add ml directory to path
sys.path.insert(0, str(Path(__file__).parent))

from recommendation import find_similar_outfits

def main():
    parser = argparse.ArgumentParser(description='Get fashion recommendations')
    parser.add_argument('--image', required=True, help='Path to uploaded image')
    parser.add_argument('--top-k', type=int, default=5, help='Number of recommendations')
    
    args = parser.parse_args()
    
    try:
        # Get recommendations
        results = find_similar_outfits(args.image, top_k=args.top_k)
        
        # Output as JSON for Node.js to parse
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()

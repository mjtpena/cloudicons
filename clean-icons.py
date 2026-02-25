#!/usr/bin/env python3
import json
import sys

def clean_icons_json(filename):
    """Remove icons with names starting with . from JSON file"""
    with open(filename, 'r') as f:
        data = json.load(f)

    original_count = len(data['Icons'])

    # Filter out icons with names starting with .
    data['Icons'] = [icon for icon in data['Icons'] if not icon['name'].startswith('.')]

    new_count = len(data['Icons'])
    removed_count = original_count - new_count

    # Update the Count field
    data['Count'] = new_count

    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

    return removed_count, original_count, new_count

if __name__ == '__main__':
    filename = '/Users/mjtpena/dev/cloudicons/wwwroot/data/aws.json'
    removed, original, new = clean_icons_json(filename)
    print(f"AWS icons cleaned:")
    print(f"  Original count: {original}")
    print(f"  Removed: {removed} (invalid icons with . prefix)")
    print(f"  New count: {new}")

#!/bin/bash

# Usage:
# ./incrementVersionPatch.sh /path/to/your/project

# Check for required argument
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/to/project"
  exit 1
fi

# Variables
PROJECT_ROOT="$1"
PACKAGE_JSON="${PROJECT_ROOT}/package.json"

# Check if package.json exists
if [ ! -f "$PACKAGE_JSON" ]; then
  echo "Error: package.json not found in ${PROJECT_ROOT}"
  exit 1
fi

# Read the current version
CURRENT_VERSION=$(jq -r '.version' "$PACKAGE_JSON")

if [ -z "$CURRENT_VERSION" ]; then
  echo "Error: version field not found in package.json"
  exit 1
fi

# Extract major, minor, and patch numbers
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Increment the patch number
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

# Update the version field using jq
jq --arg new_version "$NEW_VERSION" '.version = $new_version' "$PACKAGE_JSON" > "${PACKAGE_JSON}.tmp" && mv "${PACKAGE_JSON}.tmp" "$PACKAGE_JSON"

if [ $? -eq 0 ]; then
  echo "Version updated to $NEW_VERSION in $PACKAGE_JSON"
else
  echo "Failed to update version in $PACKAGE_JSON"
  exit 1
fi

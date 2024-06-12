#!/bin/bash

# Variables
PROJECT_ROOT="/path/to/your/project"
NEW_VERSION="1.2.3"

# Path to package.json
PACKAGE_JSON="${PROJECT_ROOT}/package.json"

# Check if package.json exists
if [ ! -f "$PACKAGE_JSON" ]; then
  echo "Error: package.json not found in ${PROJECT_ROOT}"
  exit 1
fi

# Update the version field using jq
jq --arg new_version "$NEW_VERSION" '.version = $new_version' "$PACKAGE_JSON" > "${PACKAGE_JSON}.tmp" && mv "${PACKAGE_JSON}.tmp" "$PACKAGE_JSON"

if [ $? -eq 0 ]; then
  echo "Version updated to $NEW_VERSION in $PACKAGE_JSON"
else
  echo "Failed to update version in $PACKAGE_JSON"
  exit 1
fi

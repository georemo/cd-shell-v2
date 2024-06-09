#!/bin/bash

# Source and destination directories
PROJ_DIR="$HOME/cd-projects/cd-shell"
DIST_DIR="$HOME/cd-projects/cd-shell-dist"
SOURCE_DIR="$HOME/cd-projects/cd-shell/dist/cd-shell"
DEST_DIR="$HOME/cd-projects/cd-shell-dist"

cd "$PROJ_DIR"
ng build cd-shell


# Copy the contents of the source directory to the destination directory recursively
# The --exclude option ensures that .git directories are not copied
rsync -av --delete --exclude '.git' "$SOURCE_DIR"/ "$DEST_DIR"

# Verify the operation
if [ $? -eq 0 ]; then
  echo "Contents copied successfully from $SOURCE_DIR to $DEST_DIR"
else
  echo "An error occurred while copying the contents."
fi

###########################################
# SYNC WITH REPOSITORY

cd "$DIST_DIR"
echo "current directory:"
echo $(pwd)

# Add all changes to the staging area
git add .

# Commit the changes with the provided commit message
git commit -m "-"

# Check if the commit was successful
if [ $? -ne 0 ]; then
  echo "Commit failed. Please check the error messages above."
  exit 1
fi

# Force push to the specified branch
git push --force

# Check if the push was successful
if [ $? -eq 0 ]; then
  echo "Changes have been force-pushed to the remote repository."
else
  echo "Failed to push changes. Please check the error messages above."
  exit 1
fi
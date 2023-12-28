#!/bin/bash

# Specify the input folder containing PNG files

# Loop through all PNG files in the input folder
for file in "$input_folder"/*.png; do
    # Get the base filename (without extension)
    base_filename=$(basename -- "$file" .png)

    # Convert the PNG file to WebP with the same filename
    convert "$file" "$input_folder/$base_filename.webp"
done

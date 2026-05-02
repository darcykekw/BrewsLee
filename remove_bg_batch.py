import os
from rembg import remove
from PIL import Image

menu_dir = r"c:\Users\darcy\Desktop\Tap N' Brew\coffeeshop\public\menu"

files = [
    "Caramel Macchiato.png",
    "Coffee Mocha - Sundae Swirl.png",
    "Creamy Vanilla - Sundae Swirl.png",
    "Hot Choco.png",
    "Iced Black Americano.png",
    "Iced Choco.png",
    "Matcha Latte.png",
    "Milk Tea - Sundae Swirl.png",
    "Spanish Latte.png",
]

for filename in files:
    filepath = os.path.join(menu_dir, filename)
    if os.path.exists(filepath):
        print(f"Processing {filename}...")
        input_image = Image.open(filepath)
        output_image = remove(input_image)
        output_image.save(filepath)
        print(f"Saved {filename}")
    else:
        print(f"File not found: {filename}")

print("Done.")

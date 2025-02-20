
import os
import shutil

# Manba papka (hozirgi joriy papka)
source_folder = "."

# Maqsadli papka
destination_folder = "links"

# Agar "links" papkasi mavjud bo'lmasa, uni yaratamiz
os.makedirs(destination_folder, exist_ok=True)

# Barcha .txt fayllarni topib ko'chiramiz
for file in os.listdir(source_folder):
    if file.endswith(".txt"):  # Faqat .txt fayllar uchun
        source_path = os.path.join(source_folder, file)
        destination_path = os.path.join(destination_folder, file)
        shutil.move(source_path, destination_path)
        print(f"Moved: {file} -> {destination_folder}")
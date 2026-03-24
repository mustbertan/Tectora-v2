import os
import json

class ProjectMemory:
    def __init__(self, folder_path):
        self.path = os.path.join(folder_path, "tect_memory.json")
        self.data = {"proje_amaci": "", "mimari_kararlar": [], "dosya_yapisi": {}, "tamamlanan_gorevler": []}

    def kaydet(self):
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=4, ensure_ascii=False)

    def oku(self):
        if os.path.exists(self.path):
            with open(self.path, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        return self.data
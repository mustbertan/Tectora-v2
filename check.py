from __future__ import annotations

import importlib.util
import os


def module_exists(name: str) -> bool:
    return importlib.util.find_spec(name) is not None


if __name__ == "__main__":
    print("Tectora ortam kontrolü")
    print("ANTHROPIC_API_KEY tanımlı:", bool(os.environ.get("ANTHROPIC_API_KEY")))
    for module in ["fastapi", "pydantic", "uvicorn", "anthropic"]:
        print(f"{module}:", module_exists(module))

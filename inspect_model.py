"""
Inspect the internal H5 structure of best_model.h5 to confirm
what paths the LiteMalariaModel should use.
"""
import h5py
import sys
import os

MODEL_PATHS = [
    r"backend\model\best_model.h5",
    r"best_model.h5",
    r"best_model.keras",
    r"backend\model\best_model.keras",
]

def find_model():
    base = os.path.dirname(os.path.abspath(__file__))
    for p in MODEL_PATHS:
        full = os.path.join(base, p)
        if os.path.exists(full):
            return full
    return None

def print_h5_structure(path, indent=0):
    with h5py.File(path, "r") as f:
        def visitor(name, obj):
            prefix = "  " * (name.count("/"))
            kind = "GROUP" if isinstance(obj, h5py.Group) else f"DATASET shape={obj.shape}"
            print(f"{prefix}{name}  [{kind}]")
        f.visititems(visitor)

path = find_model()
if not path:
    print("ERROR: No model file found!")
    sys.exit(1)

print(f"Inspecting: {path}\n{'='*60}")
print_h5_structure(path)
print(f"\n{'='*60}")
print("Done. Copy these paths and compare to lite_model.py.")

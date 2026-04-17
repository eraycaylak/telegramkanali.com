import sys

filepath = r"app/[slug]/page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Find start: first line after empty lines at 167-170 that's orphaned data
# Find end: line that starts 'function getCityFromSlug'
start_idx = None
end_idx = None

for i, line in enumerate(lines):
    if start_idx is None and "description: 'Kripto telegram kanallar" in line and i > 165:
        start_idx = i
    if end_idx is None and 'function getCityFromSlug' in line:
        end_idx = i
        break

print(f"Orphaned data: lines {start_idx+1} to {end_idx} (0-indexed: {start_idx} to {end_idx-1})")
print(f"Start line content: {lines[start_idx].rstrip()[:80]}")
print(f"End line content: {lines[end_idx].rstrip()[:80]}")

# Build new content: everything before start_idx + everything from end_idx
new_lines = lines[:start_idx] + lines[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Done! New total lines: {len(new_lines)}")

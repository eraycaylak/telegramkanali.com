import re

for f in ['tier1', 'tier2', 'tier3']:
    content = open(f'lib/crypto-pages/{f}.ts', 'r', encoding='utf-8').read()
    keys = re.findall(r"^  '([a-z0-9-]+)': \{", content, re.MULTILINE)
    print(f'{f}: {len(keys)} pages')
    for k in keys:
        print(f'  - {k}')

print()
print(f'Total: {sum(len(re.findall(r"^  \'([a-z0-9-]+)\': \{", open(f"lib/crypto-pages/{t}.ts", encoding="utf-8").read(), re.MULTILINE)) for t in ["tier1","tier2","tier3"])} pages')

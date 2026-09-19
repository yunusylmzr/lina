#!/bin/sh
# index.html içindeki js/css adreslerine sürüm etiketi basar; tarayıcı eski dosyayı önbellekten veremez.
cd "$(dirname "$0")"
python3 - "$@" <<'PY'
import re, sys, time
v = sys.argv[1] if len(sys.argv) > 1 else time.strftime('%y%m%d%H%M')
s = open('index.html', encoding='utf-8').read()
s = re.sub(r'(src="js/[a-z]+\.js)(\?v=[^"]*)?"', lambda m: f'{m.group(1)}?v={v}"', s)
s = re.sub(r'(href="style\.css)(\?v=[^"]*)?"', lambda m: f'{m.group(1)}?v={v}"', s)
s = re.sub(r'(href="manifest\.json)(\?v=[^"]*)?"', lambda m: f'{m.group(1)}?v={v}"', s)
open('index.html', 'w', encoding='utf-8').write(s)
print('sürüm', v)
PY

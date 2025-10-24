"""
命令行交互脚本：根据用户输入的开头（1个汉字 / 2个汉字 / 单字拼音）
从 data/idiom.json 中查找匹配成语，随机返回最多 5 条。

该脚本不依赖第三方库，使用条目中的 `pinyin` 字段进行拼音匹配。
"""

import json
import os
import random
import re
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDIOM_PATH = os.path.join(ROOT, "data", "idiom.json")


def normalize_str(s):
    if s is None:
        return ""
    if not isinstance(s, str):
        s = str(s)
    # NFKD 分解，再去掉重音符号
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(ch for ch in s if not unicodedata.category(ch).startswith('M'))
    # 去掉非字母/汉字/空格的字符
    s = re.sub(r'[^0-9A-Za-z\u4e00-\u9fff\s]', '', s)
    return s.strip()


def extract_pinyin_tokens(raw_pinyin):
    """把原始 pinyin 字段规范化并按空白分词，返回 token 列表（小写，去掉数字/声调符号）"""
    if not raw_pinyin:
        return []
    s = normalize_str(raw_pinyin)
    s = re.sub(r'\d', '', s)
    tokens = [t.lower() for t in re.split(r'\s+', s) if t]
    return tokens


def load_idioms(path):
    if not os.path.exists(path):
        print(f"找不到文件: {path}")
        return []
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"读取 JSON 出错: {e}")
        return []

    items = []
    if isinstance(data, list):
        for entry in data:
            if isinstance(entry, str):
                items.append({'word': entry, 'pinyin': None})
            elif isinstance(entry, dict):
                word = None
                for key in ('word', 'idiom', 'name', 'chengyu', 'text'):
                    if key in entry and isinstance(entry[key], str):
                        word = entry[key]
                        break
                if not word:
                    for v in entry.values():
                        if isinstance(v, str):
                            word = v
                            break
                pinyin = None
                for key in entry.keys():
                    if 'pin' in key.lower() or key.lower() in ('py', 'pinyin'):
                        val = entry.get(key)
                        if isinstance(val, str) and val.strip():
                            pinyin = val
                            break
                items.append({'word': word or '', 'pinyin': pinyin})
    elif isinstance(data, dict):
        for k, v in data.items():
            word = k
            pinyin = None
            if isinstance(v, str):
                pinyin = v
            elif isinstance(v, dict):
                for key in v.keys():
                    if 'pin' in key.lower() or key.lower() in ('py', 'pinyin'):
                        val = v.get(key)
                        if isinstance(val, str) and val.strip():
                            pinyin = val
                            break
            items.append({'word': word, 'pinyin': pinyin})

    items = [it for it in items if it.get('word')]
    return items


def is_ascii_letters(s):
    return bool(re.fullmatch(r'[A-Za-z]+', s))


def find_matches(items, q):
    q = q.strip()
    if not q:
        return []

    q_norm = normalize_str(q).lower()

    if is_ascii_letters(q_norm):
        matches = []
        for it in items:
            p = it.get('pinyin')
            if not p:
                continue
            tokens = extract_pinyin_tokens(p)
            if not tokens:
                continue
            first = tokens[0]
            if first == q_norm:
                matches.append(it['word'])
        return matches

    matches = [it['word'] for it in items if it['word'].startswith(q)]
    return matches


def main():
    items = load_idioms(IDIOM_PATH)
    if not items:
        print("未从 data/idiom.json 中读取到可用成语（请确认文件存在且条目内包含成语文本）")
        return

    try:
        while True:
            q = input('请输入开头（1汉字/2汉字 或 单字拼音），回车退出: ').strip()
            if q == '':
                print('退出。')
                break
            matches = find_matches(items, q)
            if not matches:
                print('未找到匹配的成语。')
            else:
                count = min(5, len(matches))
                sample = random.sample(matches, count)
                print(f'共找到 {len(matches)} 条，随机返回 {len(sample)} 条：')
                for i, w in enumerate(sample, 1):
                    print(f'{i}. {w}')
            print()
    except (KeyboardInterrupt, EOFError):
        print('\n退出。')


if __name__ == '__main__':
    main()

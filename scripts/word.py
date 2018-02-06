# -*- coding: utf-8 -*-

"""

author: pwxcoo
date: 2018-02-05 
description: 抓取下载汉字并保存

"""

import requests,json
from bs4 import BeautifulSoup

def downloader(url):
    """
    下载汉字并保存
    """
    response = requests.get(url)

    if response.status_code != 200:
        print(f'{url} is failed!')
        return
    
    print(f'{url} is parsing')
    html = BeautifulSoup(response.content.decode('gbk', errors='ignore'), "lxml")
    a = html.find_all('a', target="_blank")

    prefix = 'http://www.zd9999.com'
    words = [prefix + w.get('href') for w in a]

    res = []
    for i in range(0, len(words)):
        response = requests.get(words[i])
        print(f'{[words[i]]} is parsing')
        if response.status_code != 200:
            print(f'{words[i]} is failed!')
            continue

        wordhtml = BeautifulSoup(response.content.decode('gbk', errors='ignore'), "lxml")
        tr = wordhtml.find_all('table')[5].find_all('tr')
        explanation = tr[6].find_all('td')[1].text
        res.append({'word': tr[2].find_all('td')[1].text.strip(),\
                    'strokes': tr[3].find_all('td')[1].text.strip(),\
                    'pinyin': tr[4].find_all('td')[1].text.strip(),\
                    'radicals': tr[5].find_all('td')[1].text.strip(),\
                    'explanation': explanation[explanation.find('\r\n'):].strip()})
    return res

if __name__ == '__main__':
    res = downloader('http://www.zd9999.com/zi/index.htm')
    for i in range(2, 102):
        res += downloader(f'http://www.zd9999.com/zi/index_{i}.htm')
    print(len(res))
    with open('word.json', mode='w+', encoding='utf-8') as json_file:
        json.dump(res, json_file, ensure_ascii=False)
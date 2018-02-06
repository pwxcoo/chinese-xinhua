# -*- coding: utf-8 -*-

"""

author: pwxcoo
date: 2018-02-05 
description: 抓取下载成语并保存

"""

import requests, json
from bs4 import BeautifulSoup

def downloader(url):
    """
    下载成语并保存
    """
    response = requests.get(url)

    if response.status_code != 200:
        print(f'{url} is failed!')
        return
    
    print(f'{url} is parsing')
    html = BeautifulSoup(response.content.decode('gbk', errors='ignore'), "lxml")
    table = html.find_all('table')[-2]

    prefix = 'http://www.zd9999.com'
    words = [prefix + a.get('href') for a in table.find_all('a')]

    res = []
    for i in range(0, len(words)):
        response = requests.get(words[i])
        print(f'{[words[i]]} is parsing')
        if response.status_code != 200:
            print(f'{words[i]} is failed!')
            continue

        wordhtml = BeautifulSoup(response.content.decode('gbk', errors='ignore'), "lxml")
        explanation = wordhtml.find_all('table')[-3].find_all('tr')
        res.append({'word':explanation[0].text.strip(),\
                    'pinyin': explanation[1].find_all('tr')[0].find_all('td')[1].text.strip(),\
                    'explanation': explanation[1].find_all('tr')[1].find_all('td')[1].text.strip(),\
                    'derivation': explanation[1].find_all('tr')[2].find_all('td')[1].text.strip(),\
                    'example': explanation[1].find_all('tr')[3].find_all('td')[1].text.strip()})
    return res

if __name__ == '__main__':
    res = downloader('http://www.zd9999.com/cy/')
    for i in range(2, 199):
        res += downloader(f'http://www.zd9999.com/cy/index_{i}.htm')
    print(len(res))
    with open('chengyu.json', mode='w+', encoding='utf-8') as json_file:
        json.dump(res, json_file, ensure_ascii=False)
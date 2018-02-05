# -*- coding: utf-8 -*-

"""

author: pwxcoo
date: 2018-02-04 
description: 抓取下载歇后语并保存

"""

import requests, json
from bs4 import BeautifulSoup

destination_site = ['http://xhy.5156edu.com/html2/xhy.html', 'http://xhy.5156edu.com/html2/xhy_2.html']


def downloader(url):
    """
    下载歇后语并保存
    """
    response = requests.get(url)
    if response.status_code != 200:
        print(f'{url} is failed!')
        return
    print(f'{url} is parsing')
    html = BeautifulSoup(response.content.decode('gbk'), "lxml")
    tr = html.find('table', style='word-break:break-all').find_all('tr')
    return [{'riddle':t.find_all('td')[0].text, 'answer':t.find_all('td')[1].text} for t in tr][1:]

if __name__ == '__main__':
    res = downloader('http://xhy.5156edu.com/html2/xhy.html')
    for i in range(2, 282):
        res += downloader(f'http://xhy.5156edu.com/html2/xhy_{i}.html')
    print(len(res))
    with open('xiehouyu.json', mode='w+', encoding='utf-8') as json_file:
        json.dump(res, json_file, ensure_ascii=False)

"""

author: pwxcoo
date: 2018-08-02 
description: 多线程抓取下载词语并保存

"""

import requests, csv
from bs4 import BeautifulSoup
import time
from multiprocessing.dummy import Pool as ThreadPool

def downloader(url):
    """
    下载词语并保存
    """
    res = []
    try:
        response = requests.get(url)
        
        if response.status_code != 200:
            print(f'{url} is failed!')
            return len(res)

        print(f'{url} is parsing')
        html = BeautifulSoup(response.content.decode('gbk', errors='ignore'), "lxml")
        a = html.find_all('a', target="_blank")
        
        prefix = 'http://www.zd9999.com'
        words = [prefix + w.get('href') for w in a]
    
        for i in range(0, len(words)):
            print(f'{[words[i]]} is parsing')

            try:
                response  = requests.get(words[i])
                wordhtml = BeautifulSoup(response.content.decode('gbk', errors='ignore').replace('<br/>', '\n').replace('<br>', '\n')\
                            , "lxml")
                td = wordhtml.find_all('table')[5].find_all('td')
                res.append([td[0].text.strip(), td[1].text.strip()])
     
            except Exception as e:
                with open('../data/error.csv', mode='a+', encoding='utf-8', newline='') as error_file:
                    csv.writer(error_file).writerows([0, e, words[i]])
                print(f'{words[i]} is failed! {e}')
                continue

    except Exception as e:
        with open('../data/error.csv', mode='a+', encoding='utf-8', newline='') as error_file:
            csv.writer(error_file).writerows([1, e, url])
        print(f'{url} is failed! {e}')

    with open('../data/ci.csv', mode='a+', encoding='utf-8', newline='') as csv_file:
        csv.writer(csv_file).writerows(res)
    
    return len(res)

if __name__ == '__main__':
    start_time = time.time()

    pool = ThreadPool(100)
    urls = ['http://www.zd9999.com/ci/index.htm']
    for i in range(2, 1959):
        urls.append(f'http://www.zd9999.com/ci/index_{i}.htm')
    responses = pool.map(downloader, urls)
    pool.close()
    pool.join()
     
    end_time = time.time()
    
    print(f'总共耗时 {end_time - start_time}, 抓取了 {sum(responses)} 条数据')
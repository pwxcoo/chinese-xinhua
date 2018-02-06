import pandas as pd

chengyu = pd.read_json('chengyu.json')  

replace = {'ā':'a', 'á':'a', 'ǎ':'a', 'à':'a', 'ō':'o', 'ó':'o', 'ǒ':'o', 'ò':'o',\
           'ē':'e', 'é':'e', 'ě':'e', 'è':'e'}
def abbreviation(pinyin):
    each = pinyin.split(' ')
    return ''.join(list(map(lambda x: replace[x[:1]] if x[:1] in replace else x[:1], each)))

chengyu['abbreviation'] = chengyu['pinyin'].apply(abbreviation)

chengyu.to_json('idiom.json', force_ascii=False, orient='records')
    
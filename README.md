# chinese-xinhua
中华新华字典数据库和API。收录包括 14032 条歇后语，16142 个汉字，31648 个成语。

对性能没需求的话，可以用我的新华字典API。所有的数据放在 data/ 目录。

# Project Structure
```
chinese-xinhua/
|
+- .vscode/
|  |
|  +- launch.json <-- VSCode 配置文件
|
+- data/ <-- 数据文件夹
|  |
|  +- idiom.json <-- 成语
|  |
|  +- word.json <-- 汉字
|  |
|  +- xiehouyu.json <-- 歇后语
|
+- scripts/ <-- 脚本文件夹
|  |
|  +- addAbbreviation.py <-- 给成语添加首字母缩写的脚本
|  |
|  +- chengyu.py <-- 下载成语脚本
|  |
|  +- word.py <-- 下载汉字脚本
|  |
|  +- xiehouyu.py <-- 下载歇后语脚本
```

## 数据库介绍
### 成语（idiom.json)
```
[
    {
        "derivation": "语出《法华经·法师功德品》下至阿鼻地狱。”",
        "example": "但也有少数意志薄弱的……逐步上当，终至堕入～。★《上饶集中营·炼狱杂记》",
        "explanation": "阿鼻梵语的译音，意译为无间”，即痛苦无有间断之意。常用来比喻黑暗的社会和严酷的牢狱。又比喻无法摆脱的极其痛苦的境地。",
        "pinyin": "ā bí dì yù",
        "word": "阿鼻地狱",
        "abbreviation": "abdy"
    },
    ...
]
```

### 汉字（word.json)
```
[
    {
        "word": "嗄",
        "strokes": "13",
        "pinyin": "á",
        "radicals": "口",
        "explanation": "嗄〈叹〉 同啊”。表示省悟或惊奇 嗄!难道这里是没有地方官的么?--宋·佚名《新编五代史平话》 嗄á叹词。在句首，〈表〉疑问或反问～，这是什么？～，你想干什么？\"嗄\"另见shà㈠。 嗄shà ⒈声音嘶哑～声。 嗄a 1.助词。表示强调﹑肯定或辩解。 2.助词。方言。表示疑问或反诘。 嗄xià 1.见\"嗄饭\"。 2.见\"嗄程\"。"
    },
    ...
]
```

### 歇后语（xiehouyu.json)
```
[
    {
        "riddle": "飞机上聊天",
        "answer": "高谈阔论"
    },
    ...
]
```

## API 接口
`GET`、`POST`均可。用`GET`做示例，`POST`同理。返回数据格式为`JSON`。
### 成语

#### 示例1（直接请求成语）：
需要两个参数
- `type=idiom` 表示需要请求成语
- `word=兴高采烈 ` 表示请求的成语
```
http://pwxcoo.com/dictionary?type=idiom&word=兴高采烈   
```
[示例一](http://pwxcoo.com/dictionary?type=idiom&word=%E5%85%B4%E9%AB%98%E9%87%87%E7%83%88)

#### 示例2（请求拼音首字母缩写）：
需要两个参数
- `type=idiom` 表示需要请求成语
- `word=xgcl ` 表示请求的成语拼音首字母缩写
```
http://pwxcoo.com/dictionary?type=idiom&abbreviation=xgcl   
```
[示例二](http://pwxcoo.com/dictionary?type=idiom&abbreviation=xgcl)

### 歇后语

#### 示例1（请求歇后语）：
需要两个参数
- `type=xiehouyu` 表示需要请求歇后语
- `riddle=王婆 ` 表示请求的歇后语的语面。可以模糊匹配
```
http://pwxcoo.com/dictionary?type=xiehouyu&riddle=王婆   
```
[示例一](http://pwxcoo.com/dictionary?type=xiehouyu&riddle=%E7%8E%8B%E5%A9%86)

### 汉字

#### 示例1（直接请求汉字）：
需要两个参数
- `type=word` 表示需要请求汉字
- `word=吴` 表示请求的汉字
```
http://pwxcoo.com/dictionary?type=word&word=吴   
```
[示例一](http://pwxcoo.com/dictionary?type=word&word=%E5%90%B4)


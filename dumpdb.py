#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json

from db import engine, Base
from db.modal import Idiom, Word, Phrase, Riddle

Base.metadata.create_all(engine)


def read_and_save_idiom():
    with open('data/idiom.json', 'r') as f:
        json_list = json.load(f)
        for item in json_list:
            idiom = Idiom()
            idiom.word = item['word']
            idiom.pinyin = item['pinyin']
            idiom.abbreviation = item['abbreviation']
            idiom.derivation = item['derivation']
            idiom.example = item['example']
            idiom.explanation = item['explanation']
            idiom.save_if_not_exist()


def save_word():
    with open('data/word.json', 'r') as f:
        json_list = json.load(f)
        for item in json_list:
            word = Word()
            word.word = item['word']
            word.oldword = item['oldword']
            word.strokes = item['strokes']
            word.pinyin = item['pinyin']
            word.radicals = item['radicals']
            word.explanation = item['explanation']
            word.more = item['more']
            word.save_if_not_exist()


def save_phrase():
    with open('data/ci.json', 'r') as f:
        json_list = json.load(f)
        for item in json_list:
            phrase = Phrase()
            phrase.word = item['ci']
            phrase.explanation = item['explanation']
            phrase.save_if_not_exist()


def save_riddle():
    with open('data/xiehouyu.json', 'r') as f:
        json_list = json.load(f)
        for item in json_list:
            riddle = Riddle()
            riddle.riddle = item['riddle']
            riddle.answer = item['answer']
            riddle.save_if_not_exist()


if __name__ == '__main__':
    read_and_save_idiom()
    save_word()
    save_phrase()
    save_riddle()

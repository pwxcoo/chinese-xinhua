#!/usr/bin/env python
# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String

from db import Base, Session


class CRUDMixin(object):
    id = Column(Integer, primary_key=True, autoincrement=True)
    session = Session()

    @classmethod
    def create(cls, **kwargs):
        instance = cls(**kwargs)
        return instance.save()

    @classmethod
    def batch_save(self, list_obj):
        try:
            self.session.bulk_save_objects(list_obj)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            print("batch save error ", e)

    def save(self):
        self.session.add(self)
        self.session.commit()
        return self

    def delete(self):
        self.session.delete(self)
        return self.session.commit()


class Idiom(CRUDMixin, Base):
    __tablename__ = 'idiom'
    word = Column(String(50), unique=True, index=True)
    pinyin = Column(String(50))
    abbreviation = Column(String(50))
    derivation = Column(String(10240))
    example = Column(String(10240))
    explanation = Column(String(10240))

    def save_if_not_exist(self):
        indb = self.session.query(Idiom).filter_by(word=self.word).first()
        if not indb:
            print("saving to db " + self.word)
            self.save()
        else:
            print("already in db " + self.word)

    def query_by_word(self, word):
        return self.session.query(Idiom).filter(Idiom.word.ilike('%{}%'.format(word)))

    def query_by_abbr(self, abbr):
        return self.session.query(Idiom).filter(Idiom.abbreviation.ilike('%{}%'.format(abbr)))


class Word(CRUDMixin, Base):
    __tablename__ = 'word'
    word = Column(String(50), index=True)
    oldword = Column(String(50))
    strokes = Column(String(50))
    pinyin = Column(String(50))
    radicals = Column(String(50))
    explanation = Column(String(2048))
    more = Column(String(2048))

    def save_if_not_exist(self):
        indb = self.session.query(Word).filter_by(word=self.word).first()
        if not indb:
            print("saving " + self.word)
            self.save()
        else:
            print("already in db " + self.word)


class Phrase(CRUDMixin, Base):
    __tablename__ = 'phrase'
    word = Column(String(50), unique=True, index=True)
    explanation = Column(String(2048))

    def save_if_not_exist(self):
        indb = self.session.query(Phrase).filter_by(word=self.word).first()
        if not indb:
            print("saving " + self.word)
            self.save()
        else:
            print("already in db " + self.word)


class Riddle(CRUDMixin, Base):
    __tablename__ = 'riddle'
    riddle = Column(String(1024), unique=True, index=True)
    answer = Column(String(1024))

    def save_if_not_exist(self):
        indb = self.session.query(Riddle).filter_by(riddle=self.riddle).first()
        if not indb:
            print("saving " + self.riddle)
            self.save()
        else:
            print("already in db " + self.riddle)

    def query(self,word):
        return self.session.query(Riddle).filter(Riddle.riddle.ilike('%{}%'.format(word)))
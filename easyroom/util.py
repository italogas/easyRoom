# coding: utf-8

def decodeLatin(str_text):
	return str(str_text.replace("\\xe9", "é").replace("\\xe1", "á").replace("\\xe3", "ã").replace("\\xed", "í").replace("\\xf3", "ó").replace("\\xf4", "ô"))

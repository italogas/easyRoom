# coding: utf-8

def decodeLatin(str_text):
	return str(str_text.replace("\\xe9", "é").replace("\\xe1", "á").replace("\\xe3", "ã").replace("\\xed", "í").replace("\\xf3", "ó").replace("\\xf4", "ô"))

def validate(date_text):
    try:
        datetime.datetime.strptime(date_text, '%d/%m/%Y')
    except ValueError:
        raise ValueError("Formato de data incorreto,  siga o modelo: dd/mm/yyyy")


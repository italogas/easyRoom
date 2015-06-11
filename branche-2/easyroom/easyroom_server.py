# coding: utf-8
from flask import Flask, render_template, send_from_directory, Blueprint
import sys
import subprocess
from DBManager import *
#from flask.ext.cache import Cache

server_api = Blueprint('server_api', __name__)
#server_api.config["CACHE_TYPE"] = "null"

@server_api.route('/test')
@server_api.route('/test/')
@server_api.route('/test/<string:expression>', methods=['GET'])
def load_stress(expression='test'):
    return str(expression)

@server_api.route('/getusers')
@server_api.route('/getusers/')
def getusers():
    return str(get_all_users())

@server_api.route('/getvagas')
@server_api.route('/getvagas/')
def getvagas():
    return str(get_all_vacancys())



@server_api.route('/getuser/<string:id>', methods=['GET'])
def getuser(id):
    return str(get_user_atts(id) )

@server_api.route('/getmoradia/<string:iduser>', methods=['GET'])
def getmoradia(iduser):
    return str(get_house_user(iduser))#"-6.6974075,-35.5360405"
  

@server_api.route('/updateuser/<string:id_>/<string:name_>/<string:email_>', methods=['GET'])
def updateuser(id_, name_, email_):
    return str(update_user(id=id_, name=name_, email=email_))

@server_api.route('/updateuseratt/<string:id_>', defaults={'name_': "NULL", 'imgurl_': "NULL", 'date_birth_': "NULL", 'phone_':"NULL", 'sex_': "NULL"}, methods=['GET'])
@server_api.route('/updateuseratt/<string:id_>/<string:name_>',  defaults={'imgurl_': "NULL", 'date_birth_': "NULL", 'phone_':"NULL", 'sex_': "NULL"}, methods=['GET'])
@server_api.route('/updateuseratt/<string:id_>/<string:name_>/<string:date_birth_>/<string:phone_>/<string:sex_>', defaults={'imgurl_': "NULL"}, methods=['GET'])
@server_api.route('/updateuseratt/<string:id_>/<string:name_>/<string:imgurl_>/<string:date_birth_>/<string:phone_>/<string:sex_>', methods=['GET'])
def updateusertt(id_, name_, imgurl_, date_birth_, phone_, sex_):
    date_birth_ = "-".join(date_birth_.split("*")[::-1])
    #print (id_, name_, imgurl_, date_birth_, sex_)
    s= update_user_att(id=id_, name=name_, imgurl=imgurl_, date_birth=date_birth_, phone=phone_, sex=sex_)
    #print getusers()
    return str(s)#update_user_att(id=id_, imgurl=imgurl_, name=name_, date_birth=date_birth_, sex=sex_))





@server_api.route('/addhouse/<string:id_>/<string:name_>/<string:address_>/<string:lat_>/<string:lng_>/<string:imgurl_>', methods=['GET'])
def addhouse(id_, name_, address_, lat_, lng_, imgurl_):
    return str(add_house(iduser=id_, name=name_, address=address_, lat=lat_, lng=lng_, imgurl=imgurl_))

@server_api.route('/addvaga/<string:id_>/<string:price_>/<string:tel_>/<string:description_>', methods=['GET'])
def addvaga(id_, price_, tel_, description_):
    return str(add_vaga(idmoradia=id_, price=price_, tel=tel_, description=description_))

@server_api.route('/getmoradiascoordenadas/<string:lat1_>/<string:lng1_>/<string:lat2_>/<string:lng2_>', methods=['GET'])
def getmoradiascoordenadas(lat1_, lng1_, lat2_, lng2_):
    return str(get_moradias_coordenadas(lat1=lat1_, lng1=lng1_, lat2=lat2_, lng2=lng2_))






#add_vaga(idmoradia="H2C50HF4UJU8B4JK5VB5", price="R$500,00", tel="83 9999-9999", description="vaga para 1 quarto")

# coding: utf-8
from flask import Flask, render_template, send_from_directory
import sys
import subprocess
from DBManager import *

app = Flask(__name__, static_url_path='')


@app.route('/test')
@app.route('/test/')
@app.route('/test/<string:expression>', methods=['GET'])
def load_stress(expression='test'):
    return str(expression)

@app.route('/getusers')
@app.route('/getusers/')
def getusers():
    return str(get_all_users())

@app.route('/getvagas')
@app.route('/getvagas/')
def getusers():
    return str(get_all_vacancys())



@app.route('/getuser/<string:id>', methods=['GET'])
def getuser(id):
    return str(get_user_atts(id) )

@app.route('/getmoradia/<string:iduser>', methods=['GET'])
def getmoradia(iduser):
    return str(get_house_user(iduser))#"-6.6974075,-35.5360405"


@app.route('/updateuser/<string:id_>/<string:name_>/<string:email_>', methods=['GET'])
def updateuser(id_, name_, email_):
    return str(pdate_user(id=id_, name=name_, email=email_))


@app.route('/addhouse/<string:id_>/<string:name_>/<string:address_>/<string:lat_>/<string:lng_>/<string:imgurl_>', methods=['GET'])
def addhouse(id_, name_, address_, lat_, lng_, imgurl_):
    return str(add_house(iduser=id_, name=name_, address=address_, lat=lat_, lng=lng_, imgurl=imgurl_))

@app.route('/addvaga/<string:id_>/<string:price_>/<string:tel_>/<string:description_>', methods=['GET'])
def addvaga(id_, price_, tel_, description_):
    return str(add_vaga(idmoradia=id_, price=price_, tel=tel_, description=description_))




#add_vaga(idmoradia="H2C50HF4UJU8B4JK5VB5", price="R$500,00", tel="83 9999-9999", description="vaga para 1 quarto")

@app.route('/')
@app.route('/home')
@app.route('/home/')
def pagehtml():
    return render_template('easyroom.html')

@app.route('/addmoradia')
@app.route('/addmoradia/')
def addmoradias():
    return render_template('add_moradias.html')


@app.route('/moradias')
@app.route('/moradias/')
def moradias():
    return render_template('moradias.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)

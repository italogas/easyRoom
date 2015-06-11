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
def getvagas():
    return str(get_all_vacancys())



@app.route('/getuser/<string:id>', methods=['GET'])
def getuser(id):
    return str(get_user_atts(id) )

@app.route('/getmoradia/<string:iduser>', methods=['GET'])
def getmoradia(iduser):
    #s = '''
	#<table class="table table-striped"><tr id="56O7BI8R6W0Q1T97DFXW"> <td>Casa: Casa 01<br></td><td></td><td>Rua Ana da Silva Meira, 649<br>Palmeira, Campina Grande - PB, 58401-128, Brasil</td><td><img src='images/casa-icon.png' /></td> <td><a  id="addVaga" class="button" onclick="addVaga('56O7BI8R6W0Q1T97DFXW')">Add Vaga</a> </td></tr>, <tr id="6RK76SJNM72DPV1HOH2I"> <td>Casa: Casa 01<br></td><td></td><td>Rua Ana da Silva Meira, 649<br>Palmeira, Campina Grande - PB, 58401-128, Brasil</td><td><img src='images/casa-icon.png' /></td> <td><a  id="addVaga" class="button" onclick="addVaga('6RK76SJNM72DPV1HOH2I')">Add Vaga</a> </td></tr>, <tr id="CFU7TZV5PTN0BAK0QGVK"> <td>Casa: Casa 01<br></td><td></td><td>Rua Ana da Silva Meira, 649<br>Palmeira, Campina Grande - PB, 58401-128, Brasil</td><td><img src='images/casa-icon.png' /></td> <td><a  id="addVaga" class="button" onclick="addVaga('CFU7TZV5PTN0BAK0QGVK')">Add Vaga</a> </td></tr>, <tr id="G8ISMZVXOO4167OB83Y4"> <td>Casa: Casa Z<br></td><td></td><td>Rua Ant\xf4nio Joaquim Pequeno, 92<br>Universitário, Campina Grande - PB, 58429-010, Brasil</td><td><img src='images/casa-icon.png' /></td> <td><a  id="addVaga" class="button" onclick="addVaga('G8ISMZVXOO4167OB83Y4')">Add Vaga</a> </td></tr>, <tr id="H2C50HF4UJU8B4JK5VB5"> <td>Apt: Edificio CG<br></td><td></td><td>Rua Assembléia de Deus, 3452-3492<br>Universitário, Campina Grande - PB, Brasil</td><td><img src='images/apt-icon.png' /></td> <td><a  id="addVaga" class="button" onclick="addVaga('H2C50HF4UJU8B4JK5VB5')">Add Vaga</a> </td></tr>, <tr id="L4D8E6U822QJJVDMRUZ3"> <td>Casa: Casa 01<br></td><td></td><td>Rua Ana da Silva Meira, 649<br>Palmeira, Campina Grande - PB, 58401-128, Brasil</td><td><img src='images/casa-icon.png' /></td> <td><a  id="addVaga" class="button" onclick="addVaga('L4D8E6U822QJJVDMRUZ3')">Add Vaga</a> </td></tr>, <tr id="L7ZU121HG9CLEG14ZOTX"> <td>Casa: Minha Casa<br></td><td></td><td>Rua Floranea, 82-138, Belém<br>PB, 58255-000, Brasil</td><td><img src='images/casa-icon.png' /></td> <td><a  id="addVaga" class="button" onclick="addVaga('L7ZU121HG9CLEG14ZOTX')">Add Vaga</a> </td></tr>, <tr id="TWWGMWG8CFMR0PM190Y3"> <td>Kitnet: kitnet do Antonio<br></td><td></td><td>Rua Manoel Barros de Oliveira, 385-397<br>Universitário, Campina Grande - PB, Brasil</td><td><img src='images/kitnet-icon.png' /></td> <td><a  id="addVaga" class="button" onclick="addVaga('TWWGMWG8CFMR0PM190Y3')">Add Vaga</a> </td></tr>, <tr id="W6ANX93DA5OW1S8SUXQR"> <td>Casa: Cassa xm<br></td><td></td><td>Rua Apr\xedgio Veloso, 1075-1157<br>Universitário, Campina Grande - PB, Brasil</td><td><img src='images/casa-icon.png' /></td> <td><a  id="addVaga" class="button" onclick="addVaga('W6ANX93DA5OW1S8SUXQR')">Add Vaga</a> </td></tr></table> '''
    #return s
    return get_house_user(iduser)#"-6.6974075,-35.5360405"
    


@app.route('/updateuser/<string:id_>/<string:name_>/<string:email_>', methods=['GET'])
def updateuser(id_, name_, email_):
    return str(update_user(id=id_, name=name_, email=email_))


@app.route('/addhouse/<string:id_>/<string:name_>/<string:address_>/<string:lat_>/<string:lng_>/<string:imgurl_>', methods=['GET'])
def addhouse(id_, name_, address_, lat_, lng_, imgurl_):
    return str(add_house(iduser=id_, name=name_, address=address_, lat=lat_, lng=lng_, imgurl=imgurl_))

@app.route('/addvaga/<string:id_>/<string:price_>/<string:tel_>/<string:description_>', methods=['GET'])
def addvaga(id_, price_, tel_, description_):
    return str(add_vaga(idmoradia=id_, price=price_, tel=tel_, description=description_))




#add_vaga(idmoradia="H2C50HF4UJU8B4JK5VB5", price="R$500,00", tel="83 9999-9999", description="vaga para 1 quarto")

@app.route('/')
def pagehtml():
    return render_template('easyroom.html')

@app.route('/home')
@app.route('/home/')
def home():
    return render_template('inicio.html')

@app.route('/addmoradia')
@app.route('/addmoradia/')
def addmoradias():
    return render_template('add_moradias.html')


@app.route('/moradias')
@app.route('/moradias/')
def moradias():
    return render_template('moradias.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, threaded=True)
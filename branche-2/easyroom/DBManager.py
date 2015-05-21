# coding: utf-8
import MySQLdb as mdb
from TokenManager import *
from util import *

con = mdb.connect('localhost', 'ubuntu', 'citta14', 'easyroom');
cur = con.cursor()

def create_user_table():
        sql = """CREATE TABLE USER (
                ID  CHAR(30) NOT NULL,
                NAME  CHAR(50),
                IMGURL  CHAR(50),
                EMAIL CHAR(25),
                IDMORADIA CHAR(30),
                DATE_BIRTH DATE,  
                SEX CHAR(1),
		PRIMARY KEY (ID))"""

        cur.execute("DROP TABLE IF EXISTS USER")
        cur.execute(sql)

def create_moradia_table():
        sql = """CREATE TABLE MORADIA (
                ID  CHAR(30) NOT NULL,
		IDDONO CHAR(30),
                NAME  CHAR(50),
		ADDRESS CHAR(200),
		LAT CHAR(30),
                LNG CHAR(30),
                IMGURL  CHAR(50),
                PRIMARY KEY (ID))"""

        cur.execute("DROP TABLE MORADIA;")
        cur.execute(sql)
        con.commit()


def create_vaga_table():
        sql = """CREATE TABLE VAGA (
                ID  CHAR(30) NOT NULL,
                IDMORADIA CHAR(30),
                STATUS  CHAR(20),
                TEL CHAR(20),
                PRICE CHAR(20),
		DESCRIPTION VARCHAR(100),
		PRIMARY KEY (ID))"""

        cur.execute("DROP TABLE IF EXISTS VAGA;")
        cur.execute(sql)
        con.commit()


def del_moradias(userid):
	sql = """DELETE FROM MORADIA WHERE IDDONO = """+userid
	try:
        	cur.execute(sql)
	        con.commit()
		return "Sucess"
	except:
		return "Error"


## Insert or update user in DB ##
def update_user(id, name="NULL", imgurl="NULL", email="NULL", idmoradia="NULL", date_birth="NULL", sex="NULL"):
	l = [('id', id),('name', name), ('imgurl', imgurl), ('email', email), ('idmoradia', idmoradia),('date_birth',  date_birth), ('sex', sex)]
	l1 = [(atid, "'"+attr+"'") for (atid, attr) in l if attr != "NULL"]
	l2 = [(atid, attr) for (atid, attr) in l if attr == "NULL"]
	l = l1+l2
	dic_att = {}
	for (key, value) in l:
		dic_att[key] = value
	
	#print dic_att
	update  = """ON DUPLICATE KEY UPDATE name=%s, imgurl=%s, idmoradia=%s"""%(dic_att['name'], dic_att['imgurl'], dic_att['idmoradia'])
	sql = """INSERT INTO USER (id, name, imgurl, email, idmoradia, date_birth, sex ) VALUES(%s, %s, %s, %s, %s, %s, %s) """%(dic_att['id'], dic_att['name'], dic_att['imgurl'], dic_att['email'], dic_att['idmoradia'], dic_att['date_birth'], dic_att['sex'])
	#print (sql+update)
	try:
		cur.execute(sql+update)
		con.commit()
		return "Ok, success."
	except:
		return "Error."


## Get all users from DB ##
def get_all_users():
	sql = "SELECT name, id FROM USER"
	cur.execute(sql)
	rows = cur.fetchall()

       	return rows
        
def get_user_atts(id):
	sql = "SELECT * FROM USER WHERE id='%s'"%id
	cur.execute(sql)
        rows = cur.fetchall()
	return rows

## Get all m from DB ##
def get_all_houses():
        sql = "SELECT * FROM MORADIA"
        cur.execute(sql)
        rows = cur.fetchall()
	out = str(rows)
	#print decodeLatin(out)
	return decodeLatin(out)

## Get all vacancy from DB ##
def get_all_vacancys():
        sql = "SELECT * FROM VAGA"
        cur.execute(sql)
        rows = cur.fetchall()
        out = str(rows)
        #print decodeLatin(out)
        return decodeLatin(out)



def get_house_user(id):
        sql = "SELECT CONCAT('<tr id=\"', id, '\"> <td>',name,'</td><td>','</td><td>', address, '</td><td>',imgurl, '</td> <td><a  id=\"addVaga\" class=\"button\" onclick=\"addVaga{', id, '}', '\">Add Vaga</a> </td></tr>') FROM MORADIA  WHERE iddono='%s'"%id
        cur.execute(sql)
        rows = cur.fetchall()
        format_str = decodeLatin(str(rows)).replace("(", "").replace("),", "").replace(",)", "").replace(")", "").replace("'", "")
	
	format_str = format_str.replace("images*", "<img src='images/").replace(".png", ".png' />").replace("{", "('").replace("}", "')")
	return "<table>"+format_str+"</table>"

## Insert house on DB ##
def add_house(id=id_generator(20), name="NULL", iduser="NULL", address="NULL", lat="NULL", lng="NULL", imgurl="NULL"):
        l = [('id', id),('name', name), ('iddono', iduser), ('address', address), ('lat', lat),('lng', lng), ('imgurl', imgurl)]
        l1 = [(atid, "'"+attr+"'") for (atid, attr) in l if attr != "NULL"]
        l2 = [(atid, attr) for (atid, attr) in l if attr == "NULL"]
        l = l1+l2
        dic_att = {}
        for (key, value) in l:
                dic_att[key] = value

        #print dic_att
        #update  = """ON DUPLICATE KEY UPDATE name=%s, imgurl=%s, idmoradia=%s"""%(dic_att['name'], dic_att['imgurl'], dic_att['idmoradia'])
        sql = """INSERT INTO MORADIA (id, name, iddono, address, lat, lng, imgurl) VALUES(%s, %s, %s, %s, %s, %s, %s) """%(dic_att['id'], dic_att['name'], dic_att['iddono'], dic_att['address'], dic_att['lat'], dic_att['lng'], dic_att['imgurl'])
        #print (sql+update)
        try:
        	cur.execute(sql)
	        con.commit()
        	return "Ok, success."
        except:
                return "Error."

## Insert vacancy on DB ##
def add_vaga(id=id_generator(20), price="NULL", idmoradia="NULL", tel="NULL", description="NULL", status="ABERTA"):
        l = [('id', id),('price', price), ('idmoradia', idmoradia), ('tel', tel), ('description', description), ('status',status)]
        l1 = [(atid, "'"+attr+"'") for (atid, attr) in l if attr != "NULL"]
        l2 = [(atid, attr) for (atid, attr) in l if attr == "NULL"]
        l = l1+l2
        dic_att = {}
        for (key, value) in l:
                dic_att[key] = value

        #print dic_att
        #update  = """ON DUPLICATE KEY UPDATE name=%s, imgurl=%s, idmoradia=%s"""%(dic_att['name'], dic_att['imgurl'], dic_att['idmoradia'])
        sql = """INSERT INTO VAGA (id, price, idmoradia, tel, description, status) VALUES(%s, %s, %s, %s, %s, %s) """%(dic_att['id'], dic_att['price'], dic_att['idmoradia'], dic_att['tel'], dic_att['description'], dic_att['status'])
        #print (sql+update)
        try:
                cur.execute(sql)
                con.commit()
                return "Ok, success."
        except:
                return "Error."


def main():
        create_user_table()

#main()
#print create_vaga_table()
#print add_vaga(idmoradia="H2C50HF4UJU8B4JK5VB5", price="R$500,00", tel="83 9999-9999", description="vaga para 1 quarto")
#print del_moradias("106816106609413634823")
#print get_all_houses()
#create_moradia_table()
print get_all_vacancys()
#print get_house_user("106816106609413634823")

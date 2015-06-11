# coding: utf-8
import MySQLdb as mdb
from TokenManager import *
from DB_UserManager import *
from util import *

#con = mdb.connect('localhost', 'ubuntu', 'citta14', 'easyroom');
#cur = con.cursor()



def conect():
	con = mdb.connect('localhost', 'ubuntu', 'citta14', 'easyroom');
	cur = con.cursor()
	return con, cur

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
	con, cur = conect()
	sql = """DELETE FROM MORADIA WHERE IDDONO = """+userid
	try:
        	cur.execute(sql)
	        con.commit()
		cur.close()
		con.close()
		return "Sucess"
	except:
		return "Error"


## Insert or update user in DB ##
def update_user(id, name="NULL", imgurl="NULL", email="NULL", phone="NULL", date_birth="NULL", sex="NULL"):
        con, cur = conect()
	l = [('id', id),('name', name), ('imgurl', imgurl), ('email', email), ('phone', phone),('date_birth',  date_birth), ('sex', sex)]
	l1 = [(atid, "'"+attr+"'") for (atid, attr) in l if attr != "NULL"]
	l2 = [(atid, attr) for (atid, attr) in l if attr == "NULL"]
	l = l1+l2
	dic_att = {}
	for (key, value) in l:
		dic_att[key] = value
	
	#print dic_att
	update  = """ON DUPLICATE KEY UPDATE name=COALESCE(name, %s), imgurl=%s"""%(dic_att['name'], dic_att['imgurl'])
	sql = """INSERT INTO USER (id, name, imgurl, email, phone, date_birth, sex ) VALUES(%s, %s, %s, %s, %s, %s, %s) """%(dic_att['id'], dic_att['name'], dic_att['imgurl'], dic_att['email'], dic_att['phone'], dic_att['date_birth'], dic_att['sex'])
	#print (sql+update)
	try:
		cur.execute(sql+update)
		con.commit()
                cur.close()
                con.close()

		return "Ok, success."
	except:
		return "Error."


## Get all users from DB ##
def get_all_users():
        con, cur = conect()

	sql = "SELECT name, id FROM USER"
	cur.execute(sql)
	rows = cur.fetchall()
	cur.close()
	con.close()

       	return rows
        
def get_user_atts(id):
        con, cur = conect()
        sql_init = "SET group_concat_max_len=15000;"

	sql = '''SELECT 
 GROUP_CONCAT(CONCAT('{"id": "', id, '", "name": "', name, 
        '", "imgurl": "', COALESCE(imgurl, ""),
        '", "date_birth": "', COALESCE(date_birth, ""),
        '", "phone": "', COALESCE(phone, ""),
        '", "sex": "', COALESCE(sex, ""),
        '"}')        
        ) AS json FROM USER WHERE id='%s' '''%id
	cur.execute(sql_init)
	cur.execute(sql)
        rows = cur.fetchall()
	cur.close()
	con.close()

	return rows

## Get all m from DB ##
def get_all_houses():
	con, cur = conect()        
	sql = "SELECT * FROM MORADIA"
        cur.execute(sql)
        rows = cur.fetchall()
	out = str(rows)
        cur.close()
        con.close()

	return decodeLatin(out)

## Get all vacancy from DB ##
def get_all_vacancys():
	con, cur = conect()
        sql = "SELECT * FROM VAGA"
        cur.execute(sql)
        rows = cur.fetchall()
        out = str(rows)
	cur.close()
        con.close()
        
	return decodeLatin(out)



def get_house_user(id):
	con, cur = conect()
        sql = "SELECT CONCAT('<tr id=\"', id, '\"> <td>',name,'</td><td>','</td><td>', address, '</td><td>',imgurl, '</td> <td><a  id=\"addVaga\" class=\"button\" onclick=\"addVaga{', id, '}', '\">Add Vaga</a> </td></tr>') FROM MORADIA  WHERE iddono='%s'"%id
        cur.execute(sql)
        rows = cur.fetchall()
        format_str = decodeLatin(str(rows)).replace("(", "").replace("),", "").replace(",)", "").replace(")", "").replace("'", "")
	
	format_str = format_str.replace("images*", "<img src='images/").replace(".png", ".png' />").replace("{", "('").replace("}", "')")
	return "<table class=\"table table-striped\">"+format_str+"</table>"

## Insert house on DB ##
def add_house(id=id_generator(20), name="NULL", iduser="NULL", address="NULL", lat="NULL", lng="NULL", imgurl="NULL"):
	con, cur = conect()
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
		cur.close()
	        con.close()
        	return "Ok, success."
        except:
                return "Error."

## Insert vacancy on DB ##
def add_vaga(id=id_generator(20), price="NULL", idmoradia="NULL", tel="NULL", description="NULL", status="ABERTA"):
        con, cur = conect()
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
		cur.close()
        	con.close()
                return "Ok, success."
        except:
                return "Error."



def get_moradias_coordenadas(lat1, lng1, lat2, lng2):
	con, cur = conect()
        sql_init = "SET group_concat_max_len=15000;"
        sql = '''
        SELECT GROUP_CONCAT(CONCAT('{"name": "', name, '", "address": "', address, 
        '", "lat": "', lat,
        '", "lng": "', lng,
        '", "imgurl": "', imgurl,
        '"}')        
        ) AS json FROM MORADIA WHERE ((lat+0) BETWEEN %s AND %s) AND ((lng+0) BETWEEN %s AND %s)'''%(lat1, lat2, lng1, lng2)

        #print sql
        try:
                cur.execute(sql_init)
                cur.execute(sql)
                rows = cur.fetchall()
		cur.close()
	        con.close()

                return rows

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
#print get_all_vacancys()
#print get_house_user("106816106609413634823")
#print update_user_att(u'123', u'antonio teste1111', 'NULL', 'NULL', 'NULL')
#print get_user_atts('123')
#print get_all_users()

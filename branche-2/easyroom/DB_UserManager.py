# coding: utf-8
import MySQLdb as mdb
from TokenManager import *
from util import *

def conect():
        con = mdb.connect('localhost', 'ubuntu', 'citta14', 'easyroom');
        cur = con.cursor()
        return con, cur


## Insert or update user in DB ##
def update_user_att(id, name="NULL", imgurl="NULL", date_birth="NULL", phone="NULL", sex="NULL"):
	con, cur = conect()
        l = [('id', id),('name', name), ('imgurl', imgurl), ('date_birth',  date_birth), ('phone', phone), ('sex', sex)]
        l1 = [(atid, "'"+attr+"'") for (atid, attr) in l if attr != "NULL"]
        l2 = [(atid, attr) for (atid, attr) in l if attr == "NULL"]
        l = l1+l2
        dic_att = {}
        for (key, value) in l:
                dic_att[key] = value

        #print dic_att
        sql = """
		UPDATE USER
		SET name = coalesce(%s, name), imgurl = coalesce(%s, imgurl), date_birth = coalesce(%s, date_birth),  phone = coalesce(%s, phone), sex = coalesce(%s, sex)
		WHERE
		    id = %s"""%(dic_att['name'], dic_att['imgurl'], dic_att['date_birth'], dic_att['phone'], dic_att['sex'], dic_att['id'])
        #print (sql)
        try:
		cur = con.cursor()
                cur.execute(sql)
                con.commit()
		cur.close()
		con.close()
                return "Ok, success."
        except:
                return "Error."

#print update_user_att(u'123', u'antonio teste', 'NULL', 'NULL', 'NULL')#(id='123', name='usuario 1')

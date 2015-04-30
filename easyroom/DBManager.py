import MySQLdb as mdb

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

def main():
        create_user_table()

#main()
#print update_user("1234", "usertest2", email="usertest2@example.com", sex="M")
print get_all_users()
#print get_user_atts("123")


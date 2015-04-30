## User Class ##

class User:
	def __init__(self, id, name="NULL", imgurl="NULL", email="NULL", idmoradia="NULL", date_birth="NULL", sex="NULL"):		
		self.id = id
		self.name = name 
		self.imgurl = imgurl 
		self.email = email 
		self.idmoradia = idmoradia 
		self.date_birth = date_birth 
		self.sex = sex 

	def name(self):
		return self.name
	def imgurl(self):
		return self.imgurl
	def email(self):
		return self.email
		
	def adiciona_moradia(self, idmoradia, endereco, latitude, longitude):
		#TODO
		#moradia = moradia(idmoradia, latitude, longitude)
		return "ok"
		
		
	

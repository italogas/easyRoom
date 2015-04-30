## System main class ##
from DBManager import *
import User

class System:
	## Call the DBManager to add a new user or upate if existis
	def updateuser(id_, name_, email_):
	    return update_user(id=id_, name=name_, email=email_)

	## Get all atts from a user			
	def getuser(id):
	    return str(get_user_atts(id) )

	## Get all users
	def getusers():
	    return str(get_all_users())

	## Add a new local
	def addlocal():
	    #TODO
	    return "ok"

from app import db, models
from functools import wraps
import json


## Insert or update user in DB ##
def update_user(id, name="NULL", imgurl="NULL", email="NULL", idmoradia="NULL", date_birth="NULL", sex="NULL"):
    
    u = models.User.query.get(id)
    
    if u is None:
    	
    	u = models.User(name=name, email=email,imgurl=imgurl,idmoradia=idmoradia,date_birth=date_birth,sex=sex)
        db.session.add(u)
        db.session.commit() 
    	
    	return 'OK'
    else:
    	
    	u.name = name
        u.imgurl = imgurl
        u.email = email
        u.idmoradia = idmoradia
        u.date_birth = date_birth
        u.sex = sex
        db.session.commit()
        
        return 'OK'


## Get all users from DB ##
def get_all_users():
    rows = models.User.query.all()
    return rows
        
def get_user_atts(id):
	rows = models.User.query.get(id)
	return rows
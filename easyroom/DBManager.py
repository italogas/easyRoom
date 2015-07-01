from app import db, models
import config
from functools import wraps
import json
import datetime
from util import *
from sqlalchemy.exc import IntegrityError


def jsonify(f):
    @wraps(f)
    def _wrapped(*args, **kwargs):
        from flask import jsonify as flask_jsonify
        try:
            result_dict = f(*args, **kwargs)
        except Exception as e:
            result_dict = dict(success=False)
            result_dict['content'] = 'Operation failed: ' + e.message
            if True:
                from traceback import format_exc
                result_dict['exc_info'] = format_exc(e)
        return flask_jsonify(**result_dict)
    return _wrapped


## Insert or update user in DB ##
def update_user(id, name="NULL", imgurl=None, email=None, date_birth="01/01/1900", sex=None):
    
    u = models.User.query.filter_by(oAuthId=id).first()
    
    #print date_
    try:

        if u is None:
    	    
    	    u = models.User(oAuthId=id,name=name, email=email)
            db.session.add(u)
            db.session.commit() 
    	
    	    return 'OK'
        else:
    	    date_ = datetime.datetime.strptime(date_birth, '%d/%m/%Y').date()
    	    u.name = name
            u.imgurl = imgurl
            u.email = email
            u.date_birth = date_
            u.sex = sex
            db.session.commit()
        
            return 'OK'
    except IntegrityError as e:
        db.session.rollback()
        print "I/O error({0}): {1}".format(e.params, e.orig)
        return 'Error'

## Get all users from DB ##
@jsonify
def get_all_users():
    rows = models.User.query.all()
    return dict(rows)
        
@jsonify
def get_user_atts(id):
    u = models.User.query.filter_by(oAuthId=id).first()
    retVal = dict(id=u.oAuthId,name=u.name,imgurl=u.imgurl,\
        date_birth=u.date_birth,phone=u.phone,sex=u.sex)
    return retVal

def del_moradias(userid):
    u = models.User.query.filter_by(oAuthId=userid).first()
    moradia = models.Moradia.query.filter_by(user_id=u.id).first()
    moradia.delete()
    db.session.commit()

def get_all_houses():
    rows = models.Moradia.query.all()
    return rows
def get_all_vacancys():
    rows = models.Vaga.query.all()
    return rows

@jsonify
def get_house_user(userid): 
   u = models.User.query.filter_by(oAuthId=userid).first()
   moradias = models.Moradia.query.filter_by(user_id=u.id)

   retVal = []
   for moradia in moradias:
      x = dict(nome=moradia.name,address=moradia.complemento,id=moradia.id,imgurl=moradia.imgurl)
      retVal.append(x)

   return dict(moradias=retVal)

@jsonify
def get_moradias_coordenadas(lat1, lng1, lat2, lng2, tipo_id):
    
    tipo = int(tipo_id)
    if tipo == 0:
        moradias = models.Moradia.query.\
            filter(models.Moradia.lat >= float(lat1), models.Moradia.lat <= float(lat2),\
            models.Moradia.lng >= float(lng1) , models.Moradia.lng <= float(lng2) ).all()
    
    else:
        moradias = models.Moradia.query.\
            filter(models.Moradia.lat >= float(lat1), models.Moradia.lat <= float(lat2),\
            models.Moradia.lng >= float(lng1) , models.Moradia.lng <= float(lng2), models.Moradia.tipo_id == tipo ).all() 
    print moradias
    retVal = []
    for moradia in moradias:
        x = dict(name=moradia.name,address=moradia.complemento,lat=moradia.lat,lng=moradia.lng,imgurl=moradia.imgurl)
        retVal.append(x)
    #print dict(retVal)    
    return dict(moradias=retVal)

def add_house(name="NULL", iduser="NULL", address="NULL", lat="NULL", lng="NULL", imgurl="NULL",tipo_id="1"):
    u = models.User.query.filter_by(oAuthId=iduser).first()
    #tipo = models.Tipo.query.get(iduser)
    #print u.id
    if u is None:
        return "Usuario invalido"
    else:
        moradia = models.Moradia(name=name, complemento=address,imgurl=imgurl,user_id=u.id,lat=lat,lng=lng,tipo_id=tipo_id)
        db.session.add(moradia)
        db.session.commit() 
        return 'OK'

def add_vaga(price="NULL", idmoradia="NULL", tel="NULL", description="NULL", status="1"):
    moradia = models.Moradia.query.get(idmoradia)
    if moradia is None:
        return "Moaradia invalida"
    else:
        vaga = models.Vaga(price=price, tel=tel,moradia_id=idmoradia,description=description,status_id=status)
        db.session.add(vaga)
        db.session.commit()
        return 'OK'
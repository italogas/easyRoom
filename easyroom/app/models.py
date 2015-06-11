from app import db
import json

class User(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    oAuthId = db.Column(db.String(30))
    name = db.Column(db.String(64),nullable=False)
    email = db.Column(db.String(120), index=True,nullable=False,unique=True)
    imgurl = db.Column(db.String(120))
    date_birth = db.Column(db.DateTime)
    sex = db.Column(db.String(1))
    moradias = db.relationship('Moradia', backref='dono', lazy='dynamic')

    def __repr__(self):
        return '<User %r>' % (self.name)

class UserLogin(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    oAuthType = db.Column(db.String(30))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))


class Moradia(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    rua = db.Column(db.String(64))
    name= db.Column(db.String(64))
    bairro = db.Column(db.String(64))
    cidade = db.Column(db.String(64))
    estado = db.Column(db.String(20))
    cep = db.Column(db.String(8))
    lat = db.Column(db.String(64))
    lng = db.Column(db.String(64))
    numero = db.Column(db.String(9))
    complemento = db.Column(db.String(140))
    imgurl = db.Column(db.String(120))
    vagas = db.relationship('Vaga', backref='moradia', cascade="delete" ,lazy='dynamic')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    tipo_id = db.Column(db.Integer, db.ForeignKey('tipo.id'))

    def __repr__(self):
        return '<Post %r>' % (self.rua)


class Tipo(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20))

    def __repr__(self):
        return 'Post %r>' % (self.tipo)

class Status(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String(20))

    def __repr__(self):
        return 'Post %r>' % (self.status)        

class Vaga(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(140))
    price = db.Column(db.Numeric(precision=2))
    tel = db.Column(db.String(20))
    status_id = db.Column(db.Integer, db.ForeignKey('status.id'))
    moradia_id = db.Column(db.Integer, db.ForeignKey('moradia.id'))
    
    def __repr__(self):
        return 'Post %r>' % (self.description)
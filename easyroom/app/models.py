from app import db
import json

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    imgurl = db.Column(db.String(120), index=True, unique=True)
    date_bird = db.Column(db.DateTime, index=True, unique=True)
    sexo = db.Column(db.String(1), index=True, unique=True)
    moradias = db.relationship('Moradia', backref='dono', lazy='dynamic')

    def __repr__(self):
        return '<User %r>' % (self.name)

class UserLogin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    oAuthType = db.Column(db.String(10))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))


class Moradia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rua = db.Column(db.String(64))
    bairro = db.Column(db.String(64))
    cidade = db.Column(db.String(64))
    estado = db.Column(db.String(20))
    cep = db.Column(db.String(8))
    latitude = db.Column(db.String(64))
    longitude = db.Column(db.String(64))
    numero = db.Column(db.String(9))
    complemento = db.Column(db.String(140))
    vagas = db.relationship('Vaga', backref='moradia', lazy='dynamic')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    tipo_id = db.Column(db.Integer, db.ForeignKey('tipo.id'))

    def __repr__(self):
        return '<Post %r>' % (self.rua)


class Tipo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20))

    def __repr__(self):
        return 'Post %r>' % (self.tipo)

class Vaga(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    informacoes = db.Column(db.String(140))
    moradia_id = db.Column(db.Integer, db.ForeignKey('moradia.id'))
    
    def __repr__(self):
        return 'Post %r>' % (self.informacoes)
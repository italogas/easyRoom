from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask_oauthlib.client import OAuth, OAuthException

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
oAuth = OAuth(app)

from app import views, models


#
import os
BASEDIR = os.path.abspath(os.path.dirname(__file__))
DEBUG = True
#Configuracao de banco de dados
HOST="localhost"
USER="ubuntu"
PASSWORD="citta14"
DB="easyroom"
SQLALCHEMY_DATABASE_URI='mysql://ubuntu:citta14@localhost/easyroom'

SQLALCHEMY_MIGRATE_REPO = os.path.join(BASEDIR, 'db_repository')
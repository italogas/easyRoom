from flask import Flask, render_template, send_from_directory
import sys
import subprocess
from DBManager import *

app = Flask(__name__, static_url_path='')


@app.route('/test')
@app.route('/test/')
@app.route('/test/<string:expression>', methods=['GET'])
def load_stress(expression='test'):
    return str(expression)

@app.route('/getusers')
@app.route('/getusers/')
def getusers():
    return str(get_all_users())

@app.route('/getuser/<string:id>', methods=['GET'])
def getuser(id):
    return str(get_user_atts(id) )


@app.route('/updateuser/<string:id_>/<string:name_>/<string:email_>', methods=['GET'])
def updateuser(id_, name_, email_):
    return update_user(id=id_, name=name_, email=email_)


@app.route('/')
@app.route('/home')
@app.route('/home/')
def pagehtml():
    return render_template('easyroom.html')




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)

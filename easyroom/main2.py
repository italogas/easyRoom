from flask import Flask, render_template, send_from_directory
import sys
import subprocess
from DBManager2 import *

app = Flask(__name__, static_url_path='')


def jsonify(f):
    @wraps(f)
    def _wrapped(*args, **kwargs):
        from flask import jsonify as flask_jsonify
        try:
            result_dict = f(*args, **kwargs)
        except Exception as e:
            result_dict = dict(success=False)
            result_dict['content'] = 'Operation failed: ' + e.message
            if app.config['DEBUG']:
                from traceback import format_exc
                result_dict['exc_info'] = format_exc(e)
        return flask_jsonify(**result_dict)
    return _wrapped


@app.route('/test')
@app.route('/test/')
@app.route('/test/<string:expression>', methods=['GET'])
def load_stress(expression='test'):
    return str(expression)

@app.route('/getusers')
@app.route('/getusers/')
@jsonify
def getusers():
    return str(get_all_users())

@app.route('/getuser/<string:id>', methods=['GET'])
@jsonify
def getuser(id):
    user = get_user_atts(id)
    return dict(nome=user.name,email=user.email)


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
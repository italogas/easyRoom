# coding: utf-8
from flask import Flask, render_template, send_from_directory
import sys
import subprocess

from easyroom_client import client_api
from easyroom_server import server_api


app = Flask(__name__, static_url_path='')
app.register_blueprint(client_api)
app.register_blueprint(server_api)

app.config["CACHE_TYPE"] = "null"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, threaded=True)
# coding: utf-8
from flask import Flask, render_template, send_from_directory, Blueprint
import sys
import subprocess

client_api = Blueprint('client_api', __name__)


@client_api.route('/')
def pagehtml():
    return render_template('easyroom.html')

@client_api.route('/home')
@client_api.route('/home/')
def home():
    return render_template('inicio.html')

@client_api.route('/addmoradia')
@client_api.route('/addmoradia/')
def addmoradias():
    return render_template('add_moradias.html')

@client_api.route('/buscarmoradia')
@client_api.route('/buscarmoradia/')
def buscarmoradia():
    return render_template('buscar_moradias.html')

@client_api.route('/moradias')
@client_api.route('/moradias/')
def moradias():
    return render_template('moradias.html')

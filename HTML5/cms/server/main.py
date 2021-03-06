#!/usr/bin/python
# -*- coding: utf-8 -*-

###############################################################################
#   
#  Bonsai server
#  
#  Main file.
#
################################################################################
from flask import Flask, jsonify, render_template, request
import json
from dao import Dao
import os
from jsonp import support_jsonp

# vars
app = Flask(__name__)
VERSION = 0.1

# config
app.config.update(dict(
    DEBUG=True,
    DB='testdb',
    HOSTNAME='localhost',
    USER='testuser',
    PASSWORD='testpass'
))

# API
@app.route('/get/<user>/<app_id>/',  methods=['GET'])
@support_jsonp
def get_data(user, app_id):
    # TODO user app_id
    # show the user profile for that user
    app_config = dd.get_app_config(user)
    res = jsonify(json.loads(app_config))
    print res.response
    return res

@app.route('/set/<user>/<app_id>/',  methods=['POST'])
@support_jsonp
def set_data(user, app_id):
    if request.headers['Content-Type'] == 'application/json':
        ok = dd.update_user_data(user, request.json, "TEST")
        if ok:
            res = "200 OK"
        else:
            res = "200 FAILED"
    else:
        return "415 Unsupported Media Type ;)"
    return res

@app.route('/features')
def features():
    return render_template('features.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard2.html', version=VERSION)

@app.route('/')
def welcome():
    return render_template('welcome.html', version=VERSION)

# main
if __name__ == '__main__':
    app.debug = True
    with Dao(app.config) as dd:
        app.run()
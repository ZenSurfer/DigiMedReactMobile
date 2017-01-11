'use strict';

import React, {Component} from 'react'
import {AsyncStorage, NetInfo} from 'react-native'
import SQLite from 'react-native-sqlite-storage'

function Env() {
    this.db = function() {
        return SQLite.openDatabase({name: "testDB10"})
    }
    this.interval = 1
    this.cloudUrl = 'https://demo.takeda.digimedemr.com/'
}

module.exports = Env;

'use strict';

import React, {Component} from 'react'
import {AsyncStorage, NetInfo} from 'react-native'
import SQLite from 'react-native-sqlite-storage'

function Env() {
    this.db = function() {
        return SQLite.openDatabase({name: "testDB5"})
    }
    this.interval = 1
    this.cloudUrl = 'http://192.168.1.41/imd5/public/'
}

module.exports = Env;

'use strict';

import React, {Component} from 'react'
import {AsyncStorage, NetInfo} from 'react-native'
import SQLite from 'react-native-sqlite-storage'

function Env() {
    this.db = function() {
        return SQLite.openDatabase({name: "testDB4"})
    }
    this.interval = 5
}

module.exports = Env;

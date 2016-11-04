'use strict'
import SQLite from 'react-native-sqlite-storage'

function Env() {
    this.doctor = {
        userID: 29,
        id: 3,
        name: 'Dr. Donald Platino Benas',
        type: 'Neurologist',
        initial: 'DPB',
    }
    this.db = function () {
        return SQLite.openDatabase({name : "testDB"})
    }
    this.setDoctor = function(id, name) {
        this.doctor = {id: id, name: name}
    }
    this.getDoctor = function() {
        return this.doctor
    }
}

module.exports = Env;

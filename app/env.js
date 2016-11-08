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
    this.setDoctor = function(v, i) {
        var doctor = this.doctor;
        doctor[i] = v;
        this.doctor =  doctor;
    }
    this.getDoctor = function() {
        return this.doctor
    }
}

module.exports = Env;

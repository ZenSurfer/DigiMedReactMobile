'use strict'
import {AsyncStorage} from 'react-native'
import SQLite from 'react-native-sqlite-storage'

function Env() {
    this.doctor = {
        userID: 29,
        id: 3,
        name: 'Dr. Donald Platino Benas',
        type: 'Neurologist',
        initial: 'DPB',
    }
    this.fcm = {
        token: 'copcqjx3ikk:APA91bEQwo7KUNAVBcnhFmgfQuxe14Yzh2W07oqjSoaElS36IH2mQWCyuvJYrs0OIM7MjUhhe65CZ0KyyZWntBCRc200Fq5WslOKyAJ3dOVsOYGodQJFcvikPtBUSlc2CzlpVGdX6edb',
    }
    this.db = function () {
        return SQLite.openDatabase({name : "testDB1"})
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

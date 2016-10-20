'use strict'
import SQLite from 'react-native-sqlite-storage'

function Env() {
        this.emrUrl = 'http://192.168.1.40/imd5/public/api/v2';
        this.doctor = {id: 1, name: 'Don'}
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

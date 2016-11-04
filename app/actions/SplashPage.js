'use strict';

import React, {Component} from 'react'
import {Text, View, Navigator, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity} from 'react-native'
import SQLite from 'react-native-sqlite-storage'
import RNFS from 'react-native-fs'
import Schema from '../database/schema.js'
import Populate from '../database/values.js'
import Demo from '../database/testDB.js'
import Styles from '../assets/Styles.js'
import Env from '../env.js'
import _ from 'lodash'

const {height, width} = Dimensions.get('window');
const EnvInstance = new Env()
const db = EnvInstance.db()

class SplashPage extends Component {
    constructor(props) {
        super(props)
    }
    componentWillMount() {
        RNFS.mkdir(RNFS.ExternalDirectoryPath + '/patient')
        RNFS.mkdir(RNFS.ExternalDirectoryPath + '/avatar')
    }
    componentDidMount() {
        db.transaction(function(tx) {
            _.forEach(Schema, (v, i) => {
                if(i !== 'index')
                    tx.executeSql("DROP TABLE IF EXISTS "+i);
                tx.executeSql(v);
            })
            _.forEach(Demo, (v, i) => {
                tx.executeSql("DELETE FROM "+i);
                if (i !== 'migrations') {
                    _.forEach(v, (vv, ii) => {
                        tx.executeSql("SELECT * FROM "+i+" WHERE id="+vv.id, [], (tx, rs) => {
                            if (_.keys(rs.rows.item(0)).length > 0) {
                                console.log(i)
                            } else {
                                var type = _.join(_.fill(Array(_.keys(vv).length), '?'), ',');
                                if (i === 'labItem' || i === 'labItemClass' || i === 'icds' || i === 'icdCategories' || i === 'cpts' || i === 'cptCategories' || (i === 'prescriptions' && _.keys(vv).length == 10)){
                                    console.log('passed: ', i)
                                } else {
                                    tx.executeSql("INSERT INTO "+i+" VALUES ("+type+")", _.values(vv), function(tx, rs) {
                                        console.log("insert: ", i);
                                    });
                                }
                            }
                        }, (tx, error) => {
                        });
                    })
                }
            })
            _.forEach(Populate, (v, i) => {
                tx.executeSql("DELETE FROM "+i);
                if (i !== 'migrations') {
                    _.forEach(v, (vv, ii) => {
                        tx.executeSql("SELECT * FROM "+i+" WHERE id="+vv.id, [], (tx, rs) => {
                            if (_.keys(rs.rows.item(0)).length > 0) {
                                console.log(i)
                            } else {
                                var type = _.join(_.fill(Array(_.keys(vv).length), '?'), ',');
                                if ((i === 'icds' && _.keys(vv).length == 4) ||  (i === 'prescriptions' && _.keys(vv).length == 10)){
                                    console.log('passed: ', i)
                                } else {
                                    tx.executeSql("INSERT INTO "+i+" VALUES ("+type+")", _.values(vv), function(tx, rs) {
                                        console.log("insert: ", i);
                                    });
                                }
                            }
                        }, (tx, error) => {
                        });
                    })
                }
            })
        }, (error) => { console.log('Transaction ERROR: ' + error.message);
        }, () => {
            setTimeout(() => {
                this.props.navigator.replace({
                    id: 'MainPage',
                    sceneConfig: Navigator.SceneConfigs.FadeAndroid
                });
            }, 1000);
        });
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#2962FF', alignItems: 'center', justifyContent: 'center'}}>
                {this.props.children}
                <Text style={{color: 'white', fontSize: 28, paddingBottom: 20}}>Verifying Requirements...</Text>
                <View style={styles.loading}>
                    <ActivityIndicator style={[styles.progress, {transform: [{scale: 1.5}]}]} animating={true} size={'large'} color={'#FFF'}/>
                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    loading: {
        alignItems: 'center',
        width: width,
    },
    progress: {
        width: width,
    },
})

module.exports = SplashPage;

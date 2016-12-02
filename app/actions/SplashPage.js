'use strict';

import React, {Component} from 'react'
import {Text, View, Navigator, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, AsyncStorage, ToastAndroid, ProgressBarAndroid, Animated, Easing} from 'react-native'
import RNFS from 'react-native-fs'
import Schema from '../database/schema.js'
import Populate from '../database/values.js'
import Demo from '../database/testDB.js'
import Styles from '../assets/Styles.js'
import Env from '../env.js'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/MaterialIcons'
import * as Animatable from 'react-native-animatable';

const {height, width} = Dimensions.get('window');
const EnvInstance = new Env()
const db = EnvInstance.db()

class SplashPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            progress: 0,
            title: 'Validating Requirements...',
            error: 1,
        }
    }
    componentWillMount() {
        RNFS.mkdir(RNFS.ExternalDirectoryPath + '/patient')
        RNFS.mkdir(RNFS.ExternalDirectoryPath + '/avatar')
        if (this.props.initial) {
            this.setState({title: 'Initial Configuration...'})
            this.initial();
        } else
            this.validate();
    }
    initial() {
        db.transaction((tx) => {
            _.forEach(Schema, (v, table) => {
                tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='"+table+"'", [], (tx, rs) => {
                    if (_.isUndefined(rs.rows.item(0))) {
                        tx.executeSql(v);
                    }
                })
            })
        }, (err) => console.log(err.message), () => {
            this.pull(this.parse('users', [
                {column: 'id' , condition: '=', value: this.props.doctorUserID},
            ])).then((data) => {
                db.transaction((tx) => {
                    tx.executeSql("SELECT * FROM "+data.table+" WHERE id=?", [this.props.doctorUserID], (tx, rs) => {
                        if (rs.rows.length > 0) {
                            tx.executeSql("DELETE FROM "+data.table+" WHERE id=?", [this.props.doctorUserID], (tx, rs) => {
                                tx.executeSql("INSERT INTO "+data.table+" VALUES ("+_.join(_.fill(Array(_.size(data.data[0])), '?'), ',')+")", _.values(data.data[0]), (tx, rs) => {
                                    console.log(data.table+': ', rs.rowsAffected)
                                }, err => console.log(err.message))
                            })
                        } else {
                            tx.executeSql("INSERT INTO "+data.table+" VALUES ("+_.join(_.fill(Array(_.size(data.data[0])), '?'), ',')+")", _.values(data.data[0]), (tx, rs) => {
                                console.log(data.table+': ', rs.rowsAffected)
                            }, err => console.log(err.message))
                        }
                    })
                })
            }).done()
            this.pull(this.parse('doctors', [
                {column: 'userID' , condition: '=', value: this.props.doctorUserID},
            ])).then((data) => {
                db.transaction((tx) => {
                    tx.executeSql("SELECT * FROM "+data.table+" WHERE userID=?", [this.props.doctorUserID], (tx, rs) => {
                        if (rs.rows.length > 0) {
                            tx.executeSql("DELETE FROM "+data.table+" WHERE userID=?", [this.props.doctorUserID], (tx, rs) => {
                                tx.executeSql("INSERT INTO "+data.table+" VALUES ("+_.join(_.fill(Array(_.size(data.data[0])), '?'), ',')+")", _.values(data.data[0]), (tx, rs) => {
                                    console.log(data.table+': ', rs.rowsAffected)
                                }, err => console.log(err.message))
                            })
                        } else {
                            tx.executeSql("INSERT INTO "+data.table+" VALUES ("+_.join(_.fill(Array(_.size(data.data[0])), '?'), ',')+")", _.values(data.data[0]), (tx, rs) => {
                                console.log(data.table+': ', rs.rowsAffected)
                            }, err => console.log(err.message))
                        }
                    })
                }, err => console.log(err.message), () => {
                    this.validate();
                })
            }).done()
        });
    }
    validate() {
        this.setState({title: 'Validating Requirements...'})
        var count = 1;
        _.forEach(Schema, (v, table) => {
            var isUndefined = false;
            db.transaction((tx) => {
                tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='"+table+"'", [], (tx, rs) => {
                    if (_.isUndefined(rs.rows.item(0)))
                        isUndefined = true;
                    else
                        isUndefined = false;
                })
            }, err => console.log(err.message), () => {
                count = count + 1;
                if (isUndefined) {
                    db.transaction(function(tx) {
                        _.forEach(Schema, (v, i) => {
                            tx.executeSql("DROP TABLE IF EXISTS "+i);
                        })
                    }, (err) => { console.log(err.message);
                    }, () => {
                        this.setState({title: 'Encountered Configuration Problem...'})
                        if (this.state.error == 4) {
                            this.setState({title: 'Cannot Fixed Problem Relogin...'})
                            setTimeout(() => {
                                this.props.navigator.replace({
                                    id: 'LoginPage',
                                    sceneConfig: Navigator.SceneConfigs.FadeAndroid
                                });
                            }, 1000)
                        } else {
                            this.setState({error: this.state.error + 1, title: 'Reinitialize Configuration ('+this.state.error+')...'})
                            this.initial();
                        }
                    });
                } else if (_.size(Schema) == count){
                    db.transaction((tx) => {
                        tx.executeSql("SELECT `doctors`.`userID`, `doctors`.`id`, ('Dr. ' || `doctors`.`firstname` || ' ' || `doctors`.`middlename` || ' ' || `doctors`.`lastname`) as name, `doctors`.`type`, `doctors`.`initial`, `users`.`password`, `doctors`.`imagePath`, `users`.`accountVerified`, `users`.`emailVerified` FROM `users` LEFT OUTER JOIN `doctors` ON `doctors`.`userID`=`users`.`id` WHERE `users`.`id`=? AND `users`.`userType`='doctor' AND (`users`.`deleted_at` in (null, 'NULL', '') OR `users`.`deleted_at` is null) LIMIT 1", [this.props.doctorUserID], (tx, rs) => {
                            console.log(rs.rows.item(0))
                            if (rs.rows.item(0).accountVerified !== null || rs.rows.item(0).emailVerified !== null) {
                                var doctor = _.omit(rs.rows.item(0), ['password', 'accountVerified', 'emailVerified']);
                                doctor['cloudUrl'] = this.props.cloudUrl;
                                AsyncStorage.setItem('doctor', JSON.stringify(doctor))
                                this.props.navigator.replace({
                                    id: 'AppointmentPage',
                                    sceneConfig: Navigator.SceneConfigs.FadeAndroid
                                });
                            } else {
                                this.props.navigator.replace({
                                    id: 'VerifyPage',
                                    passProps: {
                                        doctorUserID: this.props.doctorUserID,
                                        cloudUrl: this.props.cloudUrl
                                    },
                                    sceneConfig: Navigator.SceneConfigs.FadeAndroid
                                });
                            }
                        })
                    })
                }
            });
        })
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#2962FF', alignItems: 'center', justifyContent: 'center'}}>
                {this.props.children}
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Animatable.Text
                        animation="pulse"
                        iterationCount={'infinite'}
                        easing="ease-out">
                        <Icon name={'insert-drive-file'}  size={100} color={'#FFF'}/>
                    </Animatable.Text>
                    {/** <TouchableOpacity
                        style={{padding: 30, backgroundColor: '#FFF'}}
                        onPress={() => this.initial()}>
                        <Text>Initial</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{padding: 30, backgroundColor: '#FFF'}}
                        onPress={() => this.validate()}>
                        <Text>Validate</Text>
                    </TouchableOpacity>**/}
                </View>
                <View style={{position: 'absolute', bottom: 20, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    <View style={{flex: 1, alignItems: 'stretch'}}>
                        <Text style={{color: 'white', fontSize: 20, paddingBottom: 20, textAlign: 'center'}}>{this.state.title}</Text>
                        <View style={[styles.loading]}>
                            <ProgressBarAndroid
                                progress={this.state.progress}
                                indeterminate={!(this.state.progress > 0) ? true : false}
                                styleAttr={'Horizontal'}
                                color={'#FFF'}/>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
    async pull(param) {
        try {
            return await fetch(this.props.cloudUrl+'/api/v2/pull?'+param).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(err.message)
        }
    }
    parse(table, values) {
        var rows = []; var where = [];
        rows.push('table='+table)
        _.forEach(values, (v, i) => {
            where.push(encodeURIComponent('{') + this.jsonToQueryString(v) + encodeURIComponent('}'))
        })
        rows.push('where='+ encodeURIComponent('[') + _.join(where, encodeURIComponent(',')) + encodeURIComponent(']'))
        return _.join(rows, '&')
    }
    jsonToQueryString(json) {
        return Object.keys(json).map((key) => {
            return encodeURIComponent('"') + encodeURIComponent(key) + encodeURIComponent('"') + encodeURIComponent(":") + encodeURIComponent('"') + encodeURIComponent(json[key])+ encodeURIComponent('"');
        }).join(encodeURIComponent(','));
    }
}

var styles = StyleSheet.create({
    loading: {
        alignItems: 'stretch',
    }
})

module.exports = SplashPage;

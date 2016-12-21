'use strict';

import React, {Component} from 'react'
import {Text, View, Navigator, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, AsyncStorage, ToastAndroid, ProgressBarAndroid, Animated, Easing, NetInfo} from 'react-native'
import RNFS from 'react-native-fs'
import FCM from 'react-native-fcm';
import Schema from '../database/schema.js'
import moment from 'moment'
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
            doctor: {},
            token: '',
            progress: 0,
            title: 'Validating Requirements...',
            error: 1,
            doctorUserID: this.props.doctorUserID,
        }
    }
    componentWillMount() {
        FCM.getFCMToken().then(token => this.setState({token: token}));
        RNFS.mkdir(RNFS.ExternalDirectoryPath + '/patient')
        RNFS.mkdir(RNFS.ExternalDirectoryPath + '/avatar')
        var table = {}
        _.forEach(_.omit(Schema, ['index']), (v, i) => {
            table[i] = '';
        })
        this.setState({table: _.omit(table, ['migrations', 'password_resets'])});
    }
    componentDidMount() {
        this.updateCredentials().then(validate => {
            if (validate || this.state.doctorUserID) {
                if (this.props.initial) {
                    this.setState({title: 'Initial Configuration...'})
                    this.initial();
                } else
                    this.validate();
            } else {
                this.props.navigator.replace({
                    id: 'LoginPage',
                    sceneConfig: Navigator.SceneConfigs.FadeAndroid
                });
            }
        }).done();
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            if (!_.isNull(doctor)) {
                this.setState({doctorUserID: JSON.parse(doctor).userID})
                return true
            } else
                return false
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        }
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
            NetInfo.isConnected.fetch().then(isConnected => {
                if (isConnected) {
                    this.pull(this.parse('users', [
                        {column: 'id' , condition: '=', value: this.state.doctorUserID},
                    ])).then((data) => {
                        db.transaction((tx) => {
                            tx.executeSql("SELECT * FROM "+data.table+" WHERE id=?", [this.state.doctorUserID], (tx, rs) => {
                                if (rs.rows.length > 0) {
                                    tx.executeSql("DELETE FROM "+data.table+" WHERE id=?", [this.state.doctorUserID], (tx, rs) => {
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
                        {column: 'userID' , condition: '=', value: this.state.doctorUserID},
                    ])).then((data) => {
                        db.transaction((tx) => {
                            tx.executeSql("SELECT * FROM "+data.table+" WHERE userID=?", [this.state.doctorUserID], (tx, rs) => {
                                if (rs.rows.length > 0) {
                                    tx.executeSql("DELETE FROM "+data.table+" WHERE userID=?", [this.state.doctorUserID], (tx, rs) => {
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
                } else {
                    ToastAndroid.show('Connection problem!', 1000)
                    this.props.navigator.replace({
                        id: 'LoginPage',
                        sceneConfig: Navigator.SceneConfigs.FadeAndroid
                    });
                }
            })
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
                        tx.executeSql("SELECT `doctors`.`userID`, `doctors`.`id`, ('Dr. ' || `doctors`.`firstname` || ' ' || `doctors`.`middlename` || ' ' || `doctors`.`lastname`) as name, `doctors`.`type`, `doctors`.`initial`, `users`.`password`, `doctors`.`imagePath`, `users`.`accountVerified`, `users`.`emailVerified` FROM `users` LEFT OUTER JOIN `doctors` ON `doctors`.`userID`=`users`.`id` WHERE `users`.`id`=? AND `users`.`userType`='doctor' AND (`users`.`deleted_at` in (null, 'NULL', '') OR `users`.`deleted_at` is null) LIMIT 1", [this.state.doctorUserID], (tx, rs) => {
                            if (rs.rows.item(0).accountVerified !== null || rs.rows.item(0).emailVerified !== null) {
                                var doctor = _.omit(rs.rows.item(0), ['password', 'accountVerified', 'emailVerified']);
                                doctor['cloudUrl'] = EnvInstance.cloudUrl;
                                NetInfo.isConnected.fetch().then(isConnected => {
                                    if (isConnected) {
                                        this.register({
                                            userID: doctor.userID,
                                            doctorID: doctor.id,
                                            token: this.state.token,
                                            doctor: doctor,
                                        }).then((data) => {
                                            var table = 'mobile'
                                            this.importDate(table).then(importDate => {
                                                if (importDate === null) {
                                                    importDate = moment().year(2000).format('YYYY-MM-DD HH:mm:ss')
                                                }
                                                this.importData(table, importDate).then((data) => {
                                                    var currentImportDate = importDate;
                                                    if (data.total > 0) {
                                                        db.sqlBatch(_.transform(data.data, (result, n, i) => {
                                                            result.push(["INSERT OR REPLACE INTO "+table+" VALUES ("+_.join(_.fill(Array(_.size(n)), '?'), ',')+")", _.values(n)])
                                                            return true
                                                        }, []), () => {
                                                            currentImportDate = data.importdate;
                                                            this.updateImportDate(table, currentImportDate).then(msg => {
                                                                console.log(data.table+' import', msg)
                                                            }).done()
                                                        }, (err) => {
                                                            console.log(err.message)
                                                        });
                                                    } else {
                                                        currentImportDate = data.importdate;
                                                        this.updateImportDate(table, currentImportDate  ).then(msg => {
                                                            console.log(data.table+' import', msg)
                                                        }).done()
                                                    }
                                                }).done()
                                            }).done()
                                            doctor['mobileID'] = data.mobileID
                                            AsyncStorage.setItem('doctor', JSON.stringify(doctor))
                                            if (data.new) {
                                                AsyncStorage.setItem('importDate', JSON.stringify({}))
                                                AsyncStorage.setItem('exportDate', JSON.stringify({}))
                                            }
                                            this.props.navigator.replace({
                                                id: 'AppointmentPage',
                                                sceneConfig: Navigator.SceneConfigs.FadeAndroid
                                            });
                                        }).done()
                                    } else {
                                        db.transaction(tx => {
                                            tx.executeSql("SELECT id FROM mobile WHERE userID="+doctor.userID+" AND doctorID="+doctor.id+" ORDER BY created_at DESC LIMIT 1", [], (tx, rs) => {
                                                db.mobileID = rs.rows.item(0).id;
                                            })
                                        }, err => console.log(err.message), () => {
                                            doctor['mobileID'] = db.mobileID;
                                            AsyncStorage.setItem('doctor', JSON.stringify(doctor))
                                            ToastAndroid.show('Offline mode!', 1000)
                                            this.props.navigator.replace({
                                                id: 'AppointmentPage',
                                                sceneConfig: Navigator.SceneConfigs.FadeAndroid
                                            });
                                        })
                                    }
                                });
                            } else {
                                this.props.navigator.replace({
                                    id: 'VerifyPage',
                                    passProps: {
                                        doctorUserID: this.state.doctorUserID,
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
    async pull(param) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/pull?'+param).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(err.message)
        }
    }
    async register(param) {
        try {
            param = Object.keys(param).map((key) => {
                return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
            }).join('&');
            return await fetch(EnvInstance.cloudUrl+'/api/v2/register?'+param).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(err.message)
        }
    }
    async importDate(table) {
        try {
            var importDate = JSON.parse(await AsyncStorage.getItem('importDate'));
            return (_.isUndefined(importDate[table])) ? null : importDate[table];
        } catch (err) {
            return null;
        }
    }
    async importData(table, date) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/import?table='+table+'&date='+encodeURIComponent(date)).then((res) => {
                return res.json()
            });
        } catch (err) {
            return err.message;
        }
    }
    async updateImportDate(table, date) {
        try {
            var importDate = JSON.parse(await AsyncStorage.getItem('importDate'));
            importDate[table] = date;
            AsyncStorage.setItem('importDate', JSON.stringify(importDate));
            return 'updated '+date;
        } catch (err) {
            return err.message;
        }
    }
}

var styles = StyleSheet.create({
    loading: {
        alignItems: 'stretch',
    }
})

module.exports = SplashPage;

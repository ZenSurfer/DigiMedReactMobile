'use strict';

import React, {Component} from 'react'
import {Text, View, Navigator, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, AsyncStorage, ToastAndroid, ProgressBarAndroid, NetInfo} from 'react-native'
import RNFS from 'react-native-fs'
import Schema from '../../database/schema.js'
import Styles from '../../assets/Styles.js'
import Env from '../../env.js'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/MaterialIcons'
import IconFont from 'react-native-vector-icons/FontAwesome'
import * as Animatable from 'react-native-animatable'
import moment from 'moment'

const EnvInstance = new Env()
const db = EnvInstance.db()

class ImportPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            progress: 0,
            importFile: 0,
            title: 'Initializing Imported Data...',
        }
    }
    componentDidMount() {
        this.updateCredentials().done();
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            this.setState({doctorID: JSON.parse(doctor).id})
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            setTimeout(() => {
                this.validate();
            }, 1000)
        }
    }
    validate() {
        this.setState({title: 'Initializing Imported Data...', progress: 0, importFile: 0,})
        NetInfo.isConnected.fetch().then(isConnected => {
            if (isConnected) {
                var filterSchema = _.omit(Schema, ['cache', 'migrations', 'password_resets', 'userAccessLevel']);
                _.forEach(filterSchema, (v, table) => {
                    this.importDate(table).then(importDate => {
                        if (importDate === null) {
                            importDate = moment().year(2000).format('YYYY-MM-DD HH:mm:ss')
                        }
                        this.importData(table, importDate).then((data) => {
                            var currentImportDate = importDate;
                            if (data.total > 0) {
                                db.sqlBatch(_.transform(data.data, (result, n, i) => {
                                    result.push(["INSERT OR REPLACE INTO "+data.table+" VALUES ("+_.join(_.fill(Array(_.size(n)), '?'), ',')+")", _.values(n)])
                                    if (data.table === 'patients' || data.table === 'staff' || data.table === 'doctors' || data.table === 'nurses') {
                                        var path = RNFS.DocumentDirectoryPath+'/'+n.imagePath;
                                        var param = {id: n.id, type: data.table};
                                        this.importImage(Object.keys(param).map((key) => {
                                            return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
                                        }).join('&')).then((data) => {
                                            if (!_.isUndefined(data)) {
                                                if (data.success) {
                                                    RNFS.writeFile(path, decodeURIComponent(data.avatar), 'base64').then((success) => {
                                                        console.log("Successfully created!")
                                                    }).catch((err) => {
                                                        console.log("Error occured while creating image!")
                                                    });
                                                }
                                            }
                                        }).done();
                                    }
                                    if (data.table === 'patientImages') {
                                        var param = {id: n.id, type: data.table};
                                        var path = RNFS.DocumentDirectoryPath+'/patient/'+n.image;
                                        this.importImage(Object.keys(param).map((key) => {
                                            return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
                                        }).join('&')).then((data) => {
                                            if (!_.isUndefined(data)) {
                                                if (data.success) {
                                                    RNFS.writeFile(path, decodeURIComponent(data.avatar), 'base64').then((success) => {
                                                        console.log("Successfully created!")
                                                    }).catch((err) => {
                                                        console.log("Error occured while creating image!")
                                                    });
                                                }
                                            }
                                        }).done();
                                    }
                                    return true
                                }, []), () => {
                                    this.setState({title: 'Importing Data '+Math.round(((this.state.importFile + 1) / _.size(filterSchema)) * 100)+'%'})
                                    currentImportDate = data.importdate;
                                    this.updateImportDate(data.table, currentImportDate).then(msg => console.log(data.table, msg)).done()
                                    if ((this.state.importFile + 1) == _.size(filterSchema)) {
                                        this.props.navigator.replace({
                                            id: 'AppointmentPage',
                                            sceneConfig: Navigator.SceneConfigs.PushFromRight,
                                        });
                                        ToastAndroid.show('Importing Successfully Done!', 1000);
                                    } else
                                        this.setState({importFile: this.state.importFile + 1, progress: ((this.state.importFile + 1) / _.size(filterSchema))})
                                }, (err) => {
                                    if ((this.state.importFile + 1) == _.size(filterSchema)) {
                                        this.props.navigator.replace({
                                            id: 'AppointmentPage',
                                            sceneConfig: Navigator.SceneConfigs.PushFromRight,
                                        });
                                        ToastAndroid.show('Importing Successfully Done!', 1000);
                                    } else
                                        this.setState({importFile: this.state.importFile + 1, progress: ((this.state.importFile + 1) / _.size(filterSchema))})
                                });
                            } else {
                                currentImportDate = data.importdate;
                                if (_.isUndefined(data.table))
                                    console.log(data)
                                this.updateImportDate(data.table, currentImportDate).then(msg => console.log(data.table, msg)).done()
                                if ((this.state.importFile + 1) == _.size(filterSchema)) {
                                    this.props.navigator.replace({
                                        id: 'AppointmentPage',
                                        sceneConfig: Navigator.SceneConfigs.PushFromRight,
                                    });
                                    ToastAndroid.show('Importing Successfully Done!', 1000);
                                } else
                                    this.setState({importFile: this.state.importFile + 1, progress: ((this.state.importFile + 1) / _.size(filterSchema))})
                            }
                        }).done()
                    }).done()
                })
            } else {
                setTimeout(() => {
                    ToastAndroid.show('Connection Problem!', 1000);
                    this.props.navigator.replace({
                        id: 'AppointmentPage',
                        sceneConfig: Navigator.SceneConfigs.PushFromRight
                    });
                }, 3000)
            }
        })
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#2962FF', alignItems: 'center', justifyContent: 'center'}}>
                {this.props.children}
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    {!(this.state.progress >= 0.1) ? (
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <Animatable.Text
                                animation="pulse"
                                iterationCount={'infinite'}
                                easing="ease-out">
                                <Icon name={'insert-drive-file'}  size={100} color={'#FFF'}/>
                            </Animatable.Text>
                        </View>
                    ) : (
                        <View style={{flexDirection: 'row', justifyContent: 'center', height: 100}}>
                            <View style={{marginRight: -60, justifyContent: 'center'}}>
                                <IconFont name={'server'} size={35} color={'#FFF'}/>
                            </View>
                                <View style={{width: 200, justifyContent: 'center'}}>
                                    <View
                                        style={{paddingRight: 200 - (this.state.progress * 200), opacity: (this.state.progress>0.2) ? this.state.progress : 0.2, transform: [{scale: (this.state.progress>0.2) ? this.state.progress : 0.2}]}}>
                                        <Icon style={{textAlign: 'right'}}
                                            name={'insert-drive-file'} color={'#FFF'} size={60}/>
                                    </View>
                                </View>
                        </View>
                    )}
                </View>
                {/**<TouchableOpacity
                    style={{padding: 30, backgroundColor: '#FFF'}}
                    onPress={() => this.validate()}>
                    <Text>Validate</Text>
                </TouchableOpacity>**/}
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
    componentWillUnmount() {
        db.transaction((tx) => {
            tx.executeSql("SELECT `id`, `groupID`, `patientID`, `userID`, `firstname`, `middlename`, `lastname`, `nameSuffix`, `birthdate`, `initial`, `type`, `sex`, `status`, `address`, `phone1`, `phone2`, `email`, `imagePath`, `imageMime`, `allowAsPatient`, `deleted_at`, `created_at`, `updated_at` FROM doctors WHERE `doctors`.`id`= ?", [this.props.doctorID], function(tx, rs) {
                db.data = rs.rows.item(0);
            });
        }, (err) => {
            alert(err.message);
        }, () => {
            var doctorName = 'Dr. '+db.data.firstname+' '+db.data.middlename+' '+db.data.lastname;
            this.updateMobileID().then(data => {
                if (data) {
                    this.updateDoctorCredentials({
                        userID: db.data.userID,
                        id: db.data.id,
                        name: doctorName,
                        type: db.data.type,
                        initial: db.data.initial,
                        imagePath: db.data.imagePath,
                        mobileID: data.mobileID
                    }).done();
                }
            }).done();
        });
    }
    async updateDoctorCredentials(data) {
        try {
            await AsyncStorage.setItem('doctor', JSON.stringify(data))
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        }
    }
    async updateMobileID() {
        try {
            var mobile = await AsyncStorage.getItem('mobile');
            if (!_.isNull(mobile)) {
                return JSON.parse(mobile)
            } else
                return false
        } catch (err) {
            console.log('AsyncStorage error: ' + err.message);
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
    async importImage(param) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/image?'+param).then((response) => {
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
    async importData(table, date) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/import?table='+table+'&date='+encodeURIComponent(date)).then((res) => {
                return res.json()
            });
        } catch (err) {
            return err.message;
        }
        // try {
        //     return await fetch(EnvInstance.cloudUrl+'/api/v2/pull?'+param).then((response) => {
        //         return response.json()
        //     });
        // } catch (err) {
        //     console.log(err.message)
        // }
    }
}

var styles = StyleSheet.create({
    loading: {
        alignItems: 'stretch',
    }
})

module.exports = ImportPage;

'use strict';

import React, { Component } from 'react'
import { StyleSheet, Text, View, Navigator, ScrollView, ProgressBarAndroid, ToastAndroid, DrawerLayoutAndroid, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, Animated, AsyncStorage, NetInfo} from 'react-native'
import RNFS from 'react-native-fs'
import Schema from '../../database/schema.js'
import Icon from 'react-native-vector-icons/MaterialIcons'
import IconFont from 'react-native-vector-icons/FontAwesome'
import Styles from '../../assets/Styles'
import Env from '../../env.js'
import _ from 'lodash'
import * as Animatable from 'react-native-animatable'
import moment from 'moment'

const {height, width} = Dimensions.get('window');
const EnvInstance = new Env()
const db = EnvInstance.db()
var initialize = {}

class ExportPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            export: {},
            exportFile: 0,
            progress: 0,
            table: 'Initializing Exported Data...',
        }
    }
    componentDidMount() {
        this.updateCredentials().done();
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            this.setState({
                doctorID: JSON.parse(doctor).id,
                doctorUserID: JSON.parse(doctor).userID,
            })
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            setTimeout(() => {
                this.export();
            }, 1000)
        }
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#2962FF', justifyContent: 'center' , flexDirection: 'column'}}>
                {this.props.children}
                {!(this.state.progress >= 0.1) ? (
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        {/**<View style={{width: 200, justifyContent: 'center'}}>**/}
                            <Animatable.Text
                                animation="pulse"
                                iterationCount={'infinite'}
                                easing="ease-out">
                                <Icon name={'insert-drive-file'}  size={100} color={'#FFF'}/>
                            </Animatable.Text>
                        {/**</View>
                        <View style={{marginLeft: -60, justifyContent: 'center'}}>
                            <IconFont name={'server'} size={40} color={'#FFF'}/>
                        </View>**/}
                    </View>
                ) : (
                    <View style={{flexDirection: 'row', justifyContent: 'center', height: 100}}>
                        <View style={{width: 200, justifyContent: 'center'}}>
                            <Animated.View
                                style={{paddingLeft: (this.state.progress * 220), opacity: (1 - this.state.progress), transform: [{scale: (1 - this.state.progress)}]}}>
                                <Icon
                                    name={'insert-drive-file'} color={'#FFF'} size={60}/>
                            </Animated.View>
                        </View>
                        <View style={{marginLeft: -60, justifyContent: 'center'}}>
                            <IconFont name={'server'} size={35} color={'#FFF'}/>
                        </View>
                    </View>
                )}
                <View style={{position: 'absolute', bottom: 20, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    <View style={{flex: 1, alignItems: 'stretch'}}>
                        <Text style={{color: 'white', fontSize: 20, paddingBottom: 20, textAlign: 'center'}}>{this.state.table}</Text>
                        <View style={[styles.loading]}>
                            <ProgressBarAndroid
                                progress={this.state.progress}
                                indeterminate={!(this.state.progress > 0) ? true : false}
                                styleAttr={'Horizontal'}
                                color={'#FFF'}/>
                        </View>
                    </View>
                </View>
                {/**<TouchableOpacity
                    style={{marginTop: 20, padding: 30, backgroundColor: '#FFF'}}
                    onPress={() => this.export()}>
                    <Text style={{flex: 1, alignItems: 'stretch', }}>DEBUG</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{marginTop: 20, padding: 10}}
                    onPress={() => {
                        this.props.navigator.replacePreviousAndPop({
                            id: 'AppointmentPage'
                        });
                    }}>
                    <Text style={{color: '#FFF'}}>RETURN</Text>
                </TouchableOpacity>**/}
            </View>
        );
    }
    export() {
        this.setState({exportFile: 0})
        NetInfo.isConnected.fetch().then(isConnected => {
            if (isConnected) {
                var filterSchema =  _.omit(Schema, ['cache', 'migrations', 'password_resets', 'userAccessLevel']);
                db.transaction(tx => {
                    _.forEach(filterSchema, (v, table) => {
                        this.exportDate(table).then(exportDate => {
                            if (exportDate === null) {
                                exportDate = moment().year(2000).format('YYYY-MM-DD HH:mm:ss')
                            }
                            // tx.executeSql("SELECT * FROM "+table+" WHERE (created_at >= '"+exportDate+"' OR updated_at >= '"+exportDate+"')", [], (tx, rs) => {
                            tx.executeSql("SELECT * FROM "+table, [], (tx, rs) => {
                                var rows = [];
                                _.forEach(rs.rows, (v, i) => {
                                    rows.push(i+ '='+ encodeURIComponent('{') + this.jsonToQueryString(rs.rows.item(i)) + encodeURIComponent('}'))
                                    if (table == 'patientImages') {
                                        RNFS.exists(RNFS.ExternalDirectoryPath+'/patient/'+rs.rows.item(i).image).then((exist) => {
                                            if (exist)
                                                RNFS.readFile(RNFS.ExternalDirectoryPath+'/patient/'+rs.rows.item(i).image, 'base64').then((image) => {
                                                    this.exportImage({
                                                        imagePath: 'patient/'+rs.rows.item(i).image,
                                                        image: (image.toString().indexOf('dataimage/jpegbase64') !== -1) ? encodeURIComponent(_.replace(image.toString(), 'dataimage/jpegbase64','')) :  encodeURIComponent(image.toString())
                                                    }, table).done();
                                                })
                                        })
                                    }
                                    if (table == 'patients' || table == 'staff' || table == 'nurses' || table == 'doctors') {
                                        RNFS.exists(RNFS.ExternalDirectoryPath+'/'+rs.rows.item(i).image).then((exist) => {
                                            if (exist)
                                                RNFS.readFile(RNFS.ExternalDirectoryPath+'/'+rs.rows.item(i).image, 'base64').then((image) => {
                                                    this.exportImage({
                                                        imagePath: rs.rows.item(i).image,
                                                        image: (image.toString().indexOf('dataimage/jpegbase64') !== -1) ? encodeURIComponent(_.replace(image.toString(), 'dataimage/jpegbase64','')) :  encodeURIComponent(image.toString())
                                                    }, table).done();
                                                })
                                        })
                                    }
                                })
                                this.exportData(rows, table).then((data) => {
                                    if(!_.isUndefined(data) && data.success) {
                                        this.updateExportDate(v, data.exportdate).then(msg => console.log(data.table, msg)).done()
                                        this.setState({table: 'Exporting '+Math.round(((this.state.exportFile + 1) / _.size(filterSchema)) * 100)+'%'})
                                        // if ((data.insert + data.exist) !== _.size(rows)) {
                                        //     _.forEach(JSON.parse(data.error), (v, i) => {
                                        //         console.log(v)
                                        //     })
                                        // }
                                        // var res = {};
                                        // res['table'] = table;
                                        // res['request'] = _.size(rows);
                                        // res['response'] = data.insert + data.exist + _.size(JSON.parse(data.error));
                                        if ((this.state.exportFile + 1) == _.size(filterSchema)) {
                                            this.props.navigator.replace({
                                                id: 'AppointmentPage',
                                                sceneConfig: Navigator.SceneConfigs.PushFromRight,
                                            });
                                            ToastAndroid.show('Exporting successfully done!', 1000);
                                        } else
                                            this.setState({exportFile: this.state.exportFile + 1, progress: ((this.state.exportFile + 1) / _.size(filterSchema))})
                                    } else {
                                        if ((this.state.exportFile + 1) == _.size(filterSchema)) {
                                            this.props.navigator.replace({
                                                id: 'AppointmentPage',
                                                sceneConfig: Navigator.SceneConfigs.PushFromRight,
                                            });
                                            ToastAndroid.show('Exporting successfully done!', 1000);
                                        } else
                                            this.setState({exportFile: this.state.exportFile + 1, progress: ((this.state.exportFile + 1) / _.size(filterSchema))})
                                    }
                                }).catch((err) => {
                                    if ((this.state.exportFile + 1) == _.size(filterSchema)) {
                                        this.props.navigator.replace({
                                            id: 'AppointmentPage',
                                            sceneConfig: Navigator.SceneConfigs.PushFromRight,
                                        });
                                        ToastAndroid.show('Exporting successfully done!', 1000);
                                    } else
                                        this.setState({exportFile: this.state.exportFile + 1, progress: ((this.state.exportFile + 1) / _.size(filterSchema))})
                                }).done();
                            })
                        }).done()
                    })
                })
            } else {
                setTimeout(() => {
                    ToastAndroid.show('Connection problem!', 1000);
                    this.props.navigator.replace({
                        id: 'AppointmentPage',
                        sceneConfig: Navigator.SceneConfigs.PushFromRight
                    });
                }, 3000)
            }
        })
    }
    async exportImage(rows, table) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/storeimage?type='+table, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rows)
            }).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(table+':', err.message)
        }
    }
    async exportData(rows, table) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/export?table='+table, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: _.join(rows, '&')
            }).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(table+':', e.message)
        }
    }
    async exportDate(table) {
        try {
            var exportDate = JSON.parse(await AsyncStorage.getItem('exportDate'));
            return (_.isUndefined(exportDate[table])) ? null : exportDate[table];
        } catch (err) {
            return null;
        }
    }
    async updateExportDate(table, date) {
        try {
            var exportDate = JSON.parse(await AsyncStorage.getItem('exportDate'));
            exportDate[table] = date;
            AsyncStorage.setItem('exportDate', JSON.stringify(exportDate));
            return 'updated '+date;
        } catch (err) {
            return err.message;
        }
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
    },
})

module.exports = ExportPage;

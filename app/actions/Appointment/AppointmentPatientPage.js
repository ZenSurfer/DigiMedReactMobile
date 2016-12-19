'use strict';

import React, {Component} from 'react'
import {StyleSheet, Text, View, ListView, RefreshControl, Navigator, Dimensions, ToastAndroid, TouchableOpacity, TouchableNativeFeedback, Image, Alert, AsyncStorage, NetInfo, ActivityIndicator} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'
import _ from 'lodash'
import Styles from '../../assets/Styles'
import Env from '../../env'
import moment from 'moment'

const {height, width} = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()

class AppointmentPatientPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            doctorID: 0,
            refreshing: true,
            rowData: [],
            avatar: false,
            appointmentType: {
                'follow-up': 'Follow-Up',
                'admission': 'Hospital Admission',
                'diagnosis': 'Medical Diagnosis',
                'procedure': 'Procedure',
                'unspecified': 'Initial Check-Up',
            },
            syncing: false,
            syncingTitle: 'Syncing Appointments...',
        }
    }
    componentWillMount() {
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
                RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                    this.setState({avatar: (rs.toString().indexOf('dataimage/jpegbase64') !== -1) ? _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,') : 'data:image/jpeg;base64,'+rs.toString()})
                })
        })
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
                this.onRefresh();
            }, 1000)
        }
    }
    render() {
        return (
            <Navigator
                renderScene={this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={[Styles.navigationBar,{marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper(this.props.patientID, this.props.patientName, this.state.avatar)} />
                }/>
        );
    }
    renderScene(route, navigator) {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Appointment</Text>
                </View>
                {(this.state.syncing) ? (
                    <View style={{position: 'absolute', top: 74, zIndex: 1, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'center'}}>
                            <View style={{ backgroundColor: '#FF5722', flexDirection: 'row', padding: 15, paddingTop: 5, paddingBottom: 5, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}>
                                <ActivityIndicator color="#FFF" size={15}/>
                                <Text style={{textAlignVertical: 'center', paddingLeft: 10, color: '#FFF', fontSize: 11}}>{this.state.syncingTitle}</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View />
                )}
                <ListView
                    dataSource={ds.cloneWithRows(this.state.rowData)}
                    renderRow={(rowData, sectionID, rowID) => this.renderListView(rowData, rowID)}
                    enableEmptySections={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh.bind(this)}
                            />
                    }/>
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 24}]}
                    onPress={() => this.props.navigator.push({
                        id: 'AddAppointment',
                        passProps: {
                            patientID: this.props.patientID,
                            patientAvatar: this.props.patientAvatar,
                            patientName: this.props.patientName
                        }
                    })}>
                    <Icon name={'add'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        );
    }
    renderListView(rowData, rowID) {
        return (
            <View style={styles.listView}>
                <TouchableNativeFeedback
                    onPress={() => this.props.navigator.push({
                        id: 'EditAppointment',
                        passProps: {
                            appointmentID: rowData.id,
                            patientID: this.props.patientID,
                            patientAvatar: this.props.patientAvatar,
                            patientName: this.props.patientName
                        }
                    })}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <TouchableOpacity
                            style={{justifyContent: 'center', padding: 12, borderRadius: 50, backgroundColor: '#03A9F4', marginLeft: 16}}
                            onPress={() => Alert.alert(
                                'Note',
                                rowData.notes,
                                [{text: 'CLOSE'}]
                            )}>
                            <Icon style={{textAlignVertical: 'center', textAlign: 'center', color: '#FFF'}} name='announcement' size={20}/>
                        </TouchableOpacity>
                        <View style={[styles.listText, {flex: 1, alignItems: 'stretch'}]}>
                            <Text style={styles.listItem}>{rowData.id} {moment(rowData.date+' '+rowData.timeStart).format('MMMM DD, YYYY')}</Text>
                            <Text style={styles.listItemHead}>{this.state.appointmentType[rowData.type]}</Text>
                            <Text style={styles.listItem}>{moment(rowData.date+' '+rowData.timeStart).format('hh:mm A')} <Text style={{}}>to</Text> {moment(rowData.date+' '+rowData.timeEnd).format('hh:mm A')} </Text>
                            {/* <Text style={styles.listItem}>{rowData.id} {rowData.diagnosisID}</Text> */}
                        </View>
                    </View>
                </TouchableNativeFeedback>
            </View>
        )
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM appointments WHERE patientID=? AND doctorID =? AND (deleted_at in (null, 'NULL', '') OR deleted_at is null) ORDER BY date DESC, timeStart DESC", [this.props.patientID, this.state.doctorID], function(tx, rs) {
                db.data = rs.rows
            }, (err) =>  { alert(err.message); });
        }, (err) => { alert(err.message); }, () => {
            var rowData = [];
            _.forEach(db.data, function(v, i) {
                rowData.push(db.data.item(i))
            })
            this.setState({refreshing: false, rowData: rowData})
            this.updateData(['appointments']);
        })
    }
    componentWillReceiveProps(nextProps) {
        if (_.size(nextProps.navigator.getCurrentRoutes(0)) > 3) {
            this.setState({lastRoute: nextProps.navigator.getCurrentRoutes(0)[3].id})
        } else {
            if (this.state.lastRoute == 'AddAppointment' || this.state.lastRoute == 'EditAppointment') {
                this.setState({lastRoute: ''});
                this.onRefresh();
            }
        }
    }
    updateData(tables) {
        NetInfo.isConnected.fetch().then(isConnected => {
            if (isConnected) {
                _.forEach(tables, (table, ii) => {
                    this.exportDate(table).then(exportDate => {
                        if (exportDate === null) {
                            exportDate = moment().year(2000).format('YYYY-MM-DD HH:mm:ss')
                        }
                        db.transaction(tx => {
                            tx.executeSql("SELECT * FROM "+table+" WHERE (created_at>='"+exportDate+"' OR updated_at>='"+exportDate+"')", [], (tx, rs) => {
                                db.data = rs.rows;
                            })
                        }, (err) => console.log(err.message), () => {
                            var rows = [];
                            _.forEach(db.data, (v, i) => {
                                rows.push(i+ '='+ encodeURIComponent('{') + this.jsonToQueryString(db.data.item(i)) + encodeURIComponent('}'))
                            })
                            this.exportData(table, rows).then(data => {
                                if(!_.isUndefined(data) && data.success) {
                                    this.updateExportDate(table, data.exportdate).then(msg => console.log(data.table+' export', msg)).done()
                                    this.importDate(table).then(importDate => {
                                        if (importDate === null) {
                                            importDate = moment().year(2000).format('YYYY-MM-DD HH:mm:ss')
                                        }
                                        if (moment().diff(moment(importDate), 'minutes') >= EnvInstance.interval) {
                                            this.setState({syncing: true, syncingTitle: 'Syncing Appointments...'})
                                            this.importData(table, importDate).then((data) => {
                                                var currentImportDate = importDate;
                                                if (data.total > 0) {
                                                    db.sqlBatch(_.transform(data.data, (result, n, i) => {
                                                        result.push(["INSERT OR REPLACE INTO "+table+" VALUES ("+_.join(_.fill(Array(_.size(n)), '?'), ',')+")", _.values(n)])
                                                        return true
                                                    }, []), () => {
                                                        if(_.last(tables) === table)
                                                            this.setState({syncing: false})
                                                        currentImportDate = data.importdate;
                                                        this.updateImportDate(table, currentImportDate).then(msg => {
                                                            console.log(data.table+' import', msg)
                                                            if(_.last(tables) === table)
                                                                this.onRefresh()
                                                            // ToastAndroid.show('Appointments updated!', 1000)
                                                        }).done()
                                                    }, (err) => {
                                                        if(_.last(tables) === table)
                                                            this.setState({syncing: false})
                                                        table// ToastAndroid.show(err.message+'!', 1000)
                                                    });
                                                } else {
                                                    currentImportDate = data.importdate;
                                                    if(_.last(tables) === table)
                                                        this.setState({syncing: false})
                                                    this.updateImportDate(table, currentImportDate  ).then(msg => {
                                                        console.log(data.table+' import', msg)
                                                        // ToastAndroid.show('Appointments up to date!', 1000)
                                                    }).done()
                                                }
                                            }).done()
                                        }
                                    }).done()
                                }
                            }).done();
                        })
                    }).done()
                })
            }
        })
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
    async exportData(table, rows) {
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
    jsonToQueryString(json) {
        return Object.keys(json).map((key) => {
            return encodeURIComponent('"') + encodeURIComponent(key) + encodeURIComponent('"') + encodeURIComponent(":") + encodeURIComponent('"') + encodeURIComponent(json[key])+ encodeURIComponent('"');
        }).join(encodeURIComponent(','));
    }
}

var styles = StyleSheet.create({
    avatarImage: {
        height: 48,
        width: 48,
        borderRadius: 30,
        margin: 5,
        marginRight: 10,
    },
    avatarIcon: {
        margin: 0,
    },
    listView: {
        borderStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
        elevation: 10,
    },
    listText: {
        alignItems: 'stretch',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 16,
        marginRight: 16,
    },
    listItemHead: {
        fontSize: 22,
        paddingTop: 0,
        paddingBottom: 2,
        color: '#424242'
    },
    listItem: {
        fontSize: 14,
    },
})
var NavigationBarRouteMapper = (patientID, patientName, avatar) => ({
    LeftButton(route, navigator, index, nextState) {
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                    onPress={() => navigator.parentNavigator.pop()}>
                    <Text style={{color: 'white', margin: 10, marginTop: 15}}>
                        <Icon name="keyboard-arrow-left" size={30} color="#FFF" />
                    </Text>
                </TouchableOpacity>
                {(avatar) ? (<Image source={{uri: avatar}} style={styles.avatarImage}/>) : (<Icon name={'account-circle'} color={'#FFFFFF'} size={65}  style={styles.avatarIcon}/>)}
            </View>
        )
    },
    RightButton(route, navigator, index, nextState) {
        return null
    },
    Title(route, navigator, index, nextState) {
        return (
            <TouchableOpacity style={[Styles.title, {marginLeft: 50}]}>
                <Text style={[Styles.titleText]}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = AppointmentPatientPage;

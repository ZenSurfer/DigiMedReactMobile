'use strict';

import React, {Component} from 'react'
import {StyleSheet, Text, View, ListView, RefreshControl, Navigator, Dimensions, ToastAndroid, TouchableOpacity, TouchableNativeFeedback, Image, Alert, NetInfo, AsyncStorage, ActivityIndicator} from 'react-native'
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

class PrescriptionPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            rowData: [],
            avatar: false,
            syncing: false,
            syncingTitle: 'Syncing Prescriptions...',
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
            this.setState({
                doctorID: JSON.parse(doctor).id,
                doctorUserID: JSON.parse(doctor).userID,
            })
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            this.onRefresh()
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
                    <Text style={Styles.subTitle}>Prescription</Text>
                </View>
                {/* {(this.state.syncing) ? (
                    <View style={{alignItems: 'center', backgroundColor: '#607D8B'}}>
                        <View style={{flexDirection: 'row', padding: 15, paddingTop: 10, paddingBottom: 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}>
                            <ActivityIndicator color="#FFF" size={15}/>
                            <Text style={{paddingLeft: 10, fontSize: 10, textAlignVertical: 'center', color: '#FFF'}}>UPDATING DATA</Text>
                        </View>
                    </View>
                ) : (
                    <View />
                )} */}
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
                        id: 'AddPrescription',
                        passProps: {
                            diagnosisID: this.props.diagnosisID,
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
                        id: 'EditPrescription',
                        passProps: {
                            diagnosisID: this.props.diagnosisID,
                            patientID: this.props.patientID,
                            patientAvatar: this.props.patientAvatar,
                            patientName: this.props.patientName,
                            prescriptionID: rowData.prescriptionID ,
                            prescriptionRowID: rowData.prescriptionRowID}
                    })}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <TouchableOpacity
                            style={{justifyContent: 'center', padding: 12, borderRadius: 50, backgroundColor: '#03A9F4', marginLeft: 16}}
                            onPress={() => {
                                Alert.alert(
                                    'Note',
                                    rowData.note,
                                    [{text: 'CLOSE'}])
                            }}>
                            <Icon style={{textAlignVertical: 'center', textAlign: 'center', color: '#FFF'}} name='announcement' size={20}/>
                        </TouchableOpacity>
                        <View style={[styles.listText, {flex: 1, alignItems: 'stretch'}]}>
                            <Text style={styles.listItem}>{(rowData.date) ? moment(rowData.date).format('MMMM DD, YYYY') : ''}</Text>
                            <Text style={styles.listItemHead}>{rowData.generic}</Text>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={[styles.listItem, {flex: 1, alignItems: 'stretch'}]}>{rowData.brand} / {rowData.dosage} / {rowData.frequency}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableNativeFeedback>
            </View>
        )
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM prescriptions WHERE doctorID=? AND patientID = ? AND (deleted_at in (null, 'NULL', '') OR deleted_at is null) ORDER BY dateIssued DESC", [this.state.doctorID, this.props.patientID], function(tx, rs) {
                db.data = rs.rows
            }, function(error) {
                console.log('SELECT SQL statement ERROR: ' + error.message);
            });
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            var rowData = [];
            _.forEach(db.data, function(v, i) {
                console.log(db.data.item(i))
                var genericName = _.split(db.data.item(i).genericName, '||');
                var brandName = _.split(db.data.item(i).brandName, '||');
                var frequency = _.split(db.data.item(i).frequency, '||');
                var dosage = _.split(db.data.item(i).dosage, '||');
                var form = _.split(db.data.item(i).forms, '||');
                var notes = _.split(db.data.item(i).notes, '||');
                _.forEach(genericName, (vv, ii) => {
                    var prescription = {
                        prescriptionID: db.data.item(i).id,
                        prescriptionRowID: ii,
                        date: db.data.item(i).dateIssued,
                        generic: genericName[ii],
                        brand: brandName[ii],
                        dosage: dosage[ii],
                        form: form[ii],
                        frequency: frequency[ii],
                        note: notes[ii],
                    }
                    rowData.push(prescription)
                })
            })
            this.setState({refreshing: false, rowData: rowData})
            this.updateData(['prescriptions']);
        })
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
                                            this.setState({syncing: true})
                                            this.importData(table, importDate).then((data) => {
                                                var currentImportDate = importDate;
                                                if (data.total > 0) {
                                                    db.sqlBatch(_.transform(data.data, (result, n, i) => {
                                                        console.log(_.join(_.fill(Array(_.size(n)), '?'), ','), _.values(n))
                                                        result.push(["INSERT OR REPLACE INTO "+table+"(`id`, `patientID`, `doctorID`, `frequency`, `dateIssued`, `genericName`, `notes`, `brandName`, `dosage`, `pharmacyDrugData`, `forms`, `deleted_at`, `created_at`, `updated_at`) VALUES ("+_.join(_.fill(Array(_.size(n)), '?'), ',')+")", _.values(n)])
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
                                                        // ToastAndroid.show(err.message+'!', 1000)
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
                                        } else {
                                            if(_.last(tables) === table)
                                                this.setState({syncing: false})
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
            console.log(table+':', err.message)
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
        borderBottomColor: '#EEE',
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
                    onPress={() => {
                        navigator.parentNavigator.pop()
                    }}>
                    <Text style={{color: 'white', margin: 10, marginTop: 15}}>
                        <Icon name="keyboard-arrow-left" size={30} color="#FFF" />
                    </Text>
                </TouchableOpacity>
                {(avatar) ? (<Image source={{uri: avatar}} style={styles.avatarImage}/>) : (<Image source={require('./../../assets/images/patient.png')} style={styles.avatarImage}/>)}
            </View>
        )
    },
    RightButton(route, navigator, index, nextState) {
        return null
    },
    Title(route, navigator, index, nextState) {
        return (
            <TouchableOpacity
                style={[Styles.title, {marginLeft: 50}]}
                onPress={() => {
                    navigator.parentNavigator.push({
                        id: 'PatientProfile',
                        passProps: { patientID: patientID},
                    })
                }}>
                <Text style={[Styles.titleText]}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = PrescriptionPage;

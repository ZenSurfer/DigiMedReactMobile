'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Alert, DatePickerAndroid, Navigator, DrawerLayoutAndroid, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl, AsyncStorage, NetInfo, ActivityIndicator, ToastAndroid} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'
import _ from 'lodash'
import moment from 'moment'
import Env from '../../env'
import Parser from 'react-native-html-parser'
import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const DomParser = Parser.DOMParser
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()
const months = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];

class AppointmentPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            doctorID: 0,
            presetText: moment().format('MMMM DD, YYYY'),
            presetDate: Date.now(),
            refreshing: true,
            search: '',
            rowData: [],
            appointmentType: {
                'follow-up': 'Follow-Up',
                'admission': 'Hospital Admission',
                'diagnosis': 'Medical Diagnosis',
                'procedure': 'Procedure',
                'unspecified': 'Initial Check-Up',
            },
            schedules: {
                morning: 'Morning Schedule',
                afternoon: 'Afternoon Schedule',
                evening: 'Evening Schedule',
            },
            syncing: false,
            syncingTitle: 'Syncing Appointments...',
        }
        this.drawerRef = {}
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
            this.onRefresh();
        }
    }
    onRefresh() {
        this.setState({syncing: false, refreshing: true})
        var appointments = {}; var currentDate = moment(this.state.presetDate).format("YYYY-MM-DD");
        db.transaction((tx) => {
            db.data = [];
            tx.executeSql("SELECT `appointments`.`id` as `id`, `appointments`.`date` as date, `appointments`.`timeStart` as `time`, `appointments`.`notes` as `notes`, `patients`.`id` as `patientID`, `patients`.`imagePath` as `imagePath`, `patients`.`firstname` as `firstname`, `patients`.`middlename` as `middlename`, `patients`.`lastname` as `lastname`, `appointments`.`type` as `type`, `doctors`.`firstname` as `doctorFirstname`, `doctors`.`middlename` as `doctorMiddlename`, `doctors`.`lastname` as `doctorLastname` FROM `appointments` LEFT OUTER JOIN `patients` ON `patients`.`id` = `appointments`.`patientID` LEFT OUTER JOIN `doctors` on `doctors`.`id` = `appointments`.`doctorID` WHERE `doctors`.`id`= "+ this.state.doctorID +" AND (`appointments`.`deleted_at` in (null, 'NULL', '') OR `appointments`.`deleted_at` is null) AND (`patients`.`deleted_at` in (null, 'NULL', '') OR `patients`.`deleted_at` is null) AND `appointments`.`date` = ? ORDER BY `appointments`.`timeStart` ASC", [currentDate], function(tx, rs) {
                if (rs.rows.length > 0) {
                    _.forEach(rs.rows, (v, i) => {
                        if (_.isEmpty(appointments[moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A")])) {
                            appointments[moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A")] = [];
                            appointments[moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A")].push({
                                'patientID': rs.rows.item(i).patientID,
                                'imagePath': rs.rows.item(i).imagePath,
                                'diagnosisID': null,
                                'time': moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A"),
                                'patient': rs.rows.item(i).firstname+' '+rs.rows.item(i).middlename+' '+rs.rows.item(i).lastname,
                                'note': rs.rows.item(i).notes,
                                'type': rs.rows.item(i).type,
                                'doctor': 'Dr. '+rs.rows.item(i).doctorFirstname+' '+((rs.rows.item(i).doctorMiddlename) ? rs.rows.item(i).doctorMiddlename+' ':'')+rs.rows.item(i).doctorLastname,
                            })
                        } else {
                            appointments[moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A")].push({
                                'patientID': rs.rows.item(i).patientID,
                                'imagePath': rs.rows.item(i).imagePath,
                                'diagnosisID': null,
                                'time': moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A"),
                                'patient': rs.rows.item(i).firstname+' '+rs.rows.item(i).middlename+' '+rs.rows.item(i).lastname,
                                'note': rs.rows.item(i).notes,
                                'type': rs.rows.item(i).type,
                                'doctor': 'Dr. '+rs.rows.item(i).doctorFirstname+' '+((rs.rows.item(i).doctorMiddlename) ? rs.rows.item(i).doctorMiddlename+' ':'')+rs.rows.item(i).doctorLastname,
                            })
                        }
                    })
                }
            })
            tx.executeSql("SELECT `diagnosis`.`id` as diagnosisID, `followup`.`id` as `id`, `followup`.`description` as `description`, `patients`.`id` as `patientID`, `patients`.`imagePath` as `imagePath`, `diagnosis`.`id` as `diagnosisID`, `patients`.`firstname` as `firstname`, `patients`.`lastname` as `lastname`, `patients`.`middlename` as `middlename`, `doctors`.`firstname` as `doctorFirstname`, `doctors`.`middlename` as `doctorMiddlename`, `doctors`.`lastname` as `doctorLastname`, `followup`.`time` as `time`, `followup`.`date` as `date` FROM `followup` LEFT OUTER JOIN `diagnosis` ON `diagnosis`.`id` = `followup`.`diagnosisID` LEFT OUTER JOIN `doctors` ON `doctors`.`id` = `followup`.`leadSurgeon` LEFT OUTER JOIN `patients` ON `patients`.`id` = `diagnosis`.`patientID` WHERE `doctors`.`id`= "+ this.state.doctorID +" AND (`followup`.`deleted_at` in (null, 'NULL', '') OR `followup`.`deleted_at` is null) AND `followup`.`date` = ? AND (`patients`.`deleted_at` in (null, 'NULL', '') OR `patients`.`deleted_at` is null) ORDER BY `followup`.`time` ASC", [currentDate], function(tx, rs) {
                if (rs.rows.length > 0) {
                    _.forEach(rs.rows, (v, i) => {
                        if (_.isEmpty(appointments[moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A")])) {
                            appointments[moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A")] = [];
                            appointments[moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A")].push({
                                'patientID': rs.rows.item(i).patientID,
                                'imagePath': rs.rows.item(i).imagePath,
                                'diagnosisID': rs.rows.item(i).diagnosisID,
                                'time': moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A"),
                                'patient': rs.rows.item(i).firstname+' '+rs.rows.item(i).middlename+' '+rs.rows.item(i).lastname,
                                'note': rs.rows.item(i).description,
                                'type': 'follow-up',
                                'doctor': 'Dr. '+rs.rows.item(i).doctorFirstname+' '+((rs.rows.item(i).doctorMiddlename) ? rs.rows.item(i).doctorMiddlename+' ':'')+rs.rows.item(i).doctorLastname,
                            })
                        } else {
                            appointments[moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A")].push({
                                'patientID': rs.rows.item(i).patientID,
                                'imagePath': rs.rows.item(i).imagePath,
                                'diagnosisID': rs.rows.item(i).diagnosisID,
                                'time': moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A"),
                                'patient': rs.rows.item(i).firstname+' '+rs.rows.item(i).middlename+' '+rs.rows.item(i).lastname,
                                'note': rs.rows.item(i).description,
                                'type': 'follow-up',
                                'doctor': 'Dr. '+rs.rows.item(i).doctorFirstname+' '+((rs.rows.item(i).doctorMiddlename) ? rs.rows.item(i).doctorMiddlename+' ':'')+rs.rows.item(i).doctorLastname,
                            })
                        }
                    })
                }
            })
        }, (err) => {
            alert(err.message);
        }, () => {
            var rowData = {}
            var schedules = { morning: [], afternoon: [], evening: [], }
            _.forEach(appointments, (v, i) => {
                if (this.getTimeName(moment(this.state.presetText+' '+i)) === 'morning') {
                    schedules.morning.push({time: i,value: v,});
                } else if (this.getTimeName(moment(this.state.presetText+' '+i)) == 'afternoon') {
                    schedules.afternoon.push({time: i,value: v,});
                } else {
                    schedules.evening.push({time: i,value: v,});
                }
            })
            this.setState({
                refreshing: false,
                rowData: {
                    morning: _.orderBy(schedules.morning, ['time'], ['asc']),
                    afternoon: _.orderBy(schedules.afternoon, ['time'], ['asc']),
                    evening: _.orderBy(schedules.evening, ['time'], ['asc']),
                }
            })
            this.updateData(['patients', 'appointments', 'diagnosis', 'followup']);
        });
    }
    async showPicker(stateKey, options) {
        try {
            const {action, year, month, day} = await DatePickerAndroid.open(options);
            if (action === DatePickerAndroid.dismissedAction) {
                this.setState({presetText: this.state.presetText});
            } else {
                var date = new Date(year, month, day);
                this.setState({
                    presetText: moment(date).format('MMMM DD, YYYY'),
                    presetDate: date,
                    search: 'date='+moment(date).format('YYYY-MM-DD'),
                })
                this.onRefresh();
            }
        } catch ({code, message}) {
            console.warn(`Error in example '${stateKey}': `, message);
        }
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator} routeName={'appointments'}></DrawerPage>)
                }}
                statusBarBackgroundColor={'#2962FF'}
                ref={ref => this.drawerRef = ref}
                >
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar
                            style={[Styles.navigationBar, {}]}
                            routeMapper={NavigationBarRouteMapper(this.drawerRef)} />
                    } />
            </DrawerLayoutAndroid>
        )
    }
    renderScene(route, navigator) {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={[Styles.subTolbar, {}]}>
                    <Text style={Styles.subTitle}>{this.state.presetText}</Text>
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
                    style={[Styles.buttonFab, Styles.subTolbarButton, {}]}
                    onPress={this.showPicker.bind(this, 'simple', {date: this.state.presetDate})}>
                    <Icon name="date-range" size={30} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[Styles.buttonFab, {backgroundColor: '#E91E63'}]}
                    onPress={() => this.props.navigator.push({
                        id: 'AddAppointment',
                    })}>
                    <Icon name={'add'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        )
    }
    renderListView(rowData, rowID) {
        return (
            <View>
                {(_.size(rowData) > 0) ? (
                    <View style={{flexDirection: 'column', backgroundColor: '#F5F5F5'}}>
                        <View style={{backgroundColor: '#FFEB3B', borderBottomWidth: 0.5, borderBottomColor: '#EEE'}}>
                            <Text style={[styles.time, {padding: 10, paddingLeft: 16, paddingRight: 16, fontSize: 18}]}>{this.state.schedules[rowID]}</Text>
                        </View>
                        <ListView
                            dataSource={ds.cloneWithRows(rowData)}
                            enableEmptySections={true}
                            renderRow={(appointmentRowData, rowID, sectionID) => this.renderAppointmentView(appointmentRowData.value, appointmentRowData.time)}
                            />
                    </View>
                ) : (
                    <View/>
                )}
            </View>
        )
    }
    getTimeName (m) {
        if(!m || !m.isValid()) { return null; }
        var afternoon = 12; var evening = 17;
        var currentHour = parseFloat(m.format("HH"));
        if (currentHour >= afternoon && currentHour <= evening)
            return "afternoon";
        else if(currentHour >= evening)
            return "evening";
        else
            return "morning";
    }
    renderAppointmentView(appointmentRowData, time) {
        return (
            <TouchableNativeFeedback
                onPress={() => {
                    if (appointmentRowData[0].type == 'follow-up') {
                        if (appointmentRowData[0].diagnosisID) {
                            this.props.navigator.push({
                                id: 'HPEDInfo',
                                passProps: {
                                    diagnosisID: appointmentRowData[0].diagnosisID,
                                    patientID: appointmentRowData[0].patientID,
                                    patientAvatar: RNFS.DocumentDirectoryPath +'/'+ appointmentRowData[0].imagePath,
                                    patientName: appointmentRowData[0].patient,
                                }
                            })
                        } else {
                            this.props.navigator.push({
                                id: 'HPEDPage',
                                passProps: {
                                    patientID: appointmentRowData[0].patientID,
                                    patientAvatar: RNFS.DocumentDirectoryPath +'/'+ appointmentRowData[0].imagePath,
                                    patientName: appointmentRowData[0].patient
                                }
                            })
                        }
                    } else {
                        this.props.navigator.push({
                            id: 'PatientProfile',
                            passProps: {
                                patientID: appointmentRowData[0].patientID,
                            }
                        })
                    }
                }}>
                <View style={[styles.listView, {paddingLeft: 0}]}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <TouchableOpacity
                            style={{justifyContent: 'center', padding: 12, borderRadius: 50, backgroundColor: '#03A9F4', marginLeft: 16}}
                            onPress={() => Alert.alert(
                                'Note',
                                appointmentRowData[0].note,
                                [{text: 'CLOSE'}]
                            )}>
                            <Icon style={{textAlignVertical: 'center', textAlign: 'center', color: '#FFF'}} name='announcement' size={20}/>
                        </TouchableOpacity>
                        <View style={{flex: 1, alignItems: 'stretch', marginLeft: 16}}>
                            <Text style={{color: '#616161'}}>({time})</Text>
                            <Text style={{fontSize: 23, color: '#212121'}}>{appointmentRowData[0].patient}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'stretch'}}>
                                <Text style={{}}>for</Text>
                                <Text style={{color: '#FF5722'}}> {(appointmentRowData[0].type) ? this.state.appointmentType[appointmentRowData[0].type] : 'Follow-Up'} {}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableNativeFeedback>
        )
    }
    gotoPersonPage(rowData) {
        this.props.navigator.push({
            id: 'PersonPage',
            name: 'PersonPage',
            passProps: {
                rowData: rowData
            }
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
                                if (table == 'patients' || table == 'staff' || table == 'nurses' || table == 'doctors') {
                                    RNFS.exists(RNFS.DocumentDirectoryPath+'/'+db.data.item(i).imagePath).then((exist) => {
                                        if (exist)
                                            RNFS.readFile(RNFS.DocumentDirectoryPath+'/'+db.data.item(i).imagePath, 'base64').then((image) => {
                                                this.exportImage({
                                                    imagePath: db.data.item(i).imagePath,
                                                    image: (image.toString().indexOf('dataimage/jpegbase64') !== -1) ? encodeURIComponent(_.replace(image.toString(), 'dataimage/jpegbase64','')) :  encodeURIComponent(image.toString())
                                                }, table).done();
                                            })
                                    })
                                }
                                if (table == 'patientImages') {
                                    RNFS.exists(RNFS.DocumentDirectoryPath+'/patient/'+db.data.item(i).image).then((exist) => {
                                        if (exist)
                                            RNFS.readFile(RNFS.DocumentDirectoryPath+'/patient/'+db.data.item(i).image, 'base64').then((image) => {
                                                this.exportImage({
                                                    imagePath: 'patient/'+db.data.item(i).image,
                                                    image: (image.toString().indexOf('dataimage/jpegbase64') !== -1) ? encodeURIComponent(_.replace(image.toString(), 'dataimage/jpegbase64','')) :  encodeURIComponent(image.toString())
                                                }, table).done();
                                            })
                                    })
                                }
                            })
                            this.exportData(table, rows).then(data => {
                                if(!_.isUndefined(data) && data.success) {
                                    this.updateExportDate(table, data.exportdate).then(msg => console.log(data.table+' export', msg)).done()
                                    this.importDate(table).then(importDate => {
                                        if (importDate === null) {
                                            importDate = moment().year(2000).format('YYYY-MM-DD HH:mm:ss')
                                        }
                                        if (moment().diff(moment(importDate), 'minutes') >= EnvInstance.interval) {
                                            // this.setState({syncing: true, syncingTitle: 'Syncing Appointments...'})
                                            this.setState({syncing: true})
                                            this.importData(table, importDate).then((data) => {
                                                var currentImportDate = importDate;
                                                if (data.total > 0) {
                                                    db.sqlBatch(_.transform(data.data, (result, n, i) => {
                                                        result.push(["INSERT OR REPLACE INTO "+table+" VALUES ("+_.join(_.fill(Array(_.size(n)), '?'), ',')+")", _.values(n)])
                                                        if (!_.isUndefined(n.imagePath)) {
                                                            var param = {id: n.id, type: data.table};
                                                            this.importImage(Object.keys(param).map((key) => {
                                                                return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
                                                            }).join('&')).then((data) => {
                                                                if (!_.isUndefined(data)) {
                                                                    if (data.success) {
                                                                        // console.log(RNFS.DocumentDirectoryPath+'/'+n.imagePath, decodeURIComponent(data.avatar))
                                                                        RNFS.writeFile(RNFS.DocumentDirectoryPath+'/'+n.imagePath, decodeURIComponent(data.avatar), 'base64').then((success) => {
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

const styles = StyleSheet.create({
    time: {
        color: '#616161',
        fontSize: 20,
        textAlignVertical: 'center',

    },
    textResult: {
        margin: 6,
        marginLeft: 16,
        flexDirection: 'row',
    },
    listView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#EEE',
        backgroundColor: '#FFF',
        paddingTop: 4,
        paddingBottom: 4,
        paddingRight: 16,
        paddingLeft: 16,
    },
})

var NavigationBarRouteMapper = (drawerRef) => ({
    LeftButton(route, navigator, index, navState) {
        return (
            <TouchableOpacity
                style={{flex: 1, justifyContent: 'center'}}
                onPress={() => drawerRef.openDrawer()}>
                <Text style={Styles.leftButtonText}>
                    <Icon name="menu" size={30} color="#FFF" />
                </Text>
            </TouchableOpacity>
        )
    },
    RightButton(route, navigator, index, navState) {
        return null
    },
    Title(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={Styles.title}>
                <Text style={Styles.titleText}>Appointments</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = AppointmentPage

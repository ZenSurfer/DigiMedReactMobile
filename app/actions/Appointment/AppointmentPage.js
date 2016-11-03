'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Alert, DatePickerAndroid, Navigator, DrawerLayoutAndroid, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import moment from 'moment'
import Env from '../../env'
import Parser from 'react-native-html-parser'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const drawerRef = {}
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
            doctorID: EnvInstance.getDoctor().id,
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
            }
        }
    }
    componentWillMount() {
        this.setState({refreshing: true})
        var appointments = {}; var currentDate = moment(this.state.presetDate).format("YYYY-MM-DD");
        db.transaction((tx) => {
            db.data = [];
            tx.executeSql("SELECT `appointments`.`id` as `id`, `appointments`.`date` as date, `appointments`.`timeStart` as `time`, `appointments`.`notes` as `notes`, `patients`.`id` as `patientID`, `patients`.`imagePath` as `imagePath`, `patients`.`firstname` as `firstname`, `patients`.`middlename` as `middlename`, `patients`.`lastname` as `lastname`, `appointments`.`type` as `type`, `doctors`.`firstname` as `doctorFirstname`, `doctors`.`middlename` as `doctorMiddlename`, `doctors`.`lastname` as `doctorLastname` FROM `appointments` LEFT OUTER JOIN `patients` ON `patients`.`id` = `appointments`.`patientID` LEFT OUTER JOIN `doctors` on `doctors`.`id` = `appointments`.`doctorID` WHERE `doctors`.`id`= "+ this.state.doctorID +" AND (`appointments`.`deleted_at` in (null, 'NULL', '') OR `appointments`.`deleted_at` is null) AND `patients`.`deleted_at` in (null, 'NULL', '') AND `appointments`.`date` = ? ORDER BY `appointments`.`timeStart` ASC", [currentDate], function(tx, rs) {
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
            tx.executeSql("SELECT `diagnosis`.`id` as diagnosisID, `followup`.`id` as `id`, `followup`.`description` as `description`, `patients`.`id` as `patientID`, `patients`.`imagePath` as `imagePath`, `diagnosis`.`id` as `diagnosisID`, `patients`.`firstname` as `firstname`, `patients`.`lastname` as `lastname`, `patients`.`middlename` as `middlename`, `doctors`.`firstname` as `doctorFirstname`, `doctors`.`middlename` as `doctorMiddlename`, `doctors`.`lastname` as `doctorLastname`, `followup`.`time` as `time`, `followup`.`date` as `date` FROM `followup` LEFT OUTER JOIN `diagnosis` ON `diagnosis`.`id` = `followup`.`diagnosisID` LEFT OUTER JOIN `doctors` ON `doctors`.`id` = `followup`.`leadSurgeon` LEFT OUTER JOIN `patients` ON `patients`.`id` = `diagnosis`.`patientID` WHERE `doctors`.`id`= "+ this.state.doctorID +" AND (`followup`.`deleted_at` in (null, 'NULL', '') OR `followup`.`deleted_at` is null) AND `followup`.`date` = ? AND `patients`.`deleted_at` in (null, 'NULL', '') ORDER BY `followup`.`time` ASC", [currentDate], function(tx, rs) {
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
        });
    }
    onRefresh() {
        this.setState({refreshing: true})
        var appointments = {}; var currentDate = moment(this.state.presetDate).format("YYYY-MM-DD");
        db.transaction((tx) => {
            db.data = [];
            tx.executeSql("SELECT `appointments`.`id` as `id`, `appointments`.`date` as date, `appointments`.`timeStart` as `time`, `appointments`.`notes` as `notes`, `patients`.`id` as `patientID`, `patients`.`imagePath` as `imagePath`, `patients`.`firstname` as `firstname`, `patients`.`middlename` as `middlename`, `patients`.`lastname` as `lastname`, `appointments`.`type` as `type`, `doctors`.`firstname` as `doctorFirstname`, `doctors`.`middlename` as `doctorMiddlename`, `doctors`.`lastname` as `doctorLastname` FROM `appointments` LEFT OUTER JOIN `patients` ON `patients`.`id` = `appointments`.`patientID` LEFT OUTER JOIN `doctors` on `doctors`.`id` = `appointments`.`doctorID` WHERE `doctors`.`id`= "+ this.state.doctorID +" AND (`appointments`.`deleted_at` in (null, 'NULL', '') OR `appointments`.`deleted_at` is null) AND `patients`.`deleted_at` in (null, 'NULL', '') AND `appointments`.`date` = ? ORDER BY `appointments`.`timeStart` ASC", [currentDate], function(tx, rs) {
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
            tx.executeSql("SELECT `diagnosis`.`id` as diagnosisID, `followup`.`id` as `id`, `followup`.`description` as `description`, `patients`.`id` as `patientID`, `patients`.`imagePath` as `imagePath`, `diagnosis`.`id` as `diagnosisID`, `patients`.`firstname` as `firstname`, `patients`.`lastname` as `lastname`, `patients`.`middlename` as `middlename`, `doctors`.`firstname` as `doctorFirstname`, `doctors`.`middlename` as `doctorMiddlename`, `doctors`.`lastname` as `doctorLastname`, `followup`.`time` as `time`, `followup`.`date` as `date` FROM `followup` LEFT OUTER JOIN `diagnosis` ON `diagnosis`.`id` = `followup`.`diagnosisID` LEFT OUTER JOIN `doctors` ON `doctors`.`id` = `followup`.`leadSurgeon` LEFT OUTER JOIN `patients` ON `patients`.`id` = `diagnosis`.`patientID` WHERE `doctors`.`id`= "+ this.state.doctorID +" AND (`followup`.`deleted_at` in (null, 'NULL', '') OR `followup`.`deleted_at` is null) AND `followup`.`date` = ? AND `patients`.`deleted_at` in (null, 'NULL', '') ORDER BY `followup`.`time` ASC", [currentDate], function(tx, rs) {
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
        });
    }
    componentWillReceiveProps(nextProps) {
        if (_.size(nextProps.navigator.getCurrentRoutes(0)) > 1) {
            this.setState({lastRoute: nextProps.navigator.getCurrentRoutes(0)[1].id})
        } else {
            if (this.state.lastRoute == 'AddAppointment') {
                this.setState({lastRoute: ''});
                this.onRefresh();
            }
        }
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
                statusBarBackgroundColor={'#2962FF'}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator} routeName={'appointments'}></DrawerPage>)
                }}
                ref={this.drawerInstance}
                >
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar style={Styles.navigationBar}
                            routeMapper={NavigationBarRouteMapper} />
                    } />
            </DrawerLayoutAndroid>
        )
    }
    renderScene(route, navigator) {
        return (
            <View style={Styles.containerStyle}>
                <View style={Styles.subTolbar}>
                    <Text style={Styles.subTitle}>{this.state.presetText}</Text>
                </View>
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
                    style={[Styles.buttonFab, Styles.subTolbarButton]}
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
                        <View style={{backgroundColor: '#FFEB3B', borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0'}}>
                            <Text style={[styles.time, {padding: 10, paddingLeft: 16, paddingRight: 16, fontSize: 30}]}>{this.state.schedules[rowID]}</Text>
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
                                    patientAvatar: appointmentRowData[0].imagePath,
                                    patientName: appointmentRowData[0].patient,
                                }
                            })
                        } else {
                            this.props.navigator.push({
                                id: 'HPEDPage',
                                passProps: {
                                    patientID: appointmentRowData[0].patientID,
                                    patientAvatar: appointmentRowData[0].imagePath,
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
                            <Text style={{color: '#616161', fontStyle: 'italic'}}>({time})</Text>
                            <Text style={{fontSize: 23, color: '#212121'}}>{appointmentRowData[0].patient}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'stretch'}}>
                                <Text style={{fontStyle: 'italic'}}>for</Text>
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
    drawerInstance(instance) {
        drawerRef = instance
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
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
        paddingTop: 4,
        paddingBottom: 4,
        paddingRight: 16,
        paddingLeft: 16,
    },
})

var NavigationBarRouteMapper = {
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
}

module.exports = AppointmentPage

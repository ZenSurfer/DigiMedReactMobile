'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Alert, DatePickerAndroid, Navigator, DrawerLayoutAndroid, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import moment from 'moment'
import Env from '../env'
import Parser from 'react-native-html-parser'

import Styles from '../assets/Styles'
import DrawerPage from '../components/DrawerPage'

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

class MainPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            presetText: moment().format('MMMM DD, YYYY'),
            presetDate: Date.now(),
            refreshing: false,
            search: '',
            rowData: [],
        }
        this.drawerRef = {}
    }
    componentWillMount() {
        db.transaction((tx) => {
            tx.executeSql("select `appointments`.`id` as `id`, `appointments`.`timeStart` as `time`, `appointments`.`notes` as `notes`, `patients`.`id` as `patientID`, `patients`.`firstname` as `firstname`, `patients`.`middlename` as `middlename`, `patients`.`lastname` as `lastname`, `appointments`.`type` as `type`, `doctors`.`firstname` as `doctorFirstname`, `doctors`.`middlename` as `doctorMiddlename`, `doctors`.`lastname` as `doctorLastname` from `appointments` left join `patients` on `patients`.`id` = `appointments`.`patientID` left join `doctors` on `doctors`.`id` = `appointments`.`doctorID` where `appointments`.`deleted_at` is null and `patients`.`deleted_at` is null and `appointments`.`date` = ? order by `appointments`.`timeStart` asc", [moment(this.state.presetDate).format("YYYY-MM-DD")], function(tx, rs) {
                _.forEach(rs.rows, function(v, i) {
                    console.log(rs.rows.item(i))
                })
            })
        });
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            db.date = moment(this.state.presetDate).format("YYYY-MM-DD");
            db.data = [];
            tx.executeSql(" select `appointments`.`id` as `id`, `appointments`.`date` as date, `appointments`.`timeStart` as `time`, `appointments`.`notes` as `notes`, `patients`.`id` as `patientID`, `patients`.`firstname` as `firstname`, `patients`.`middlename` as `middlename`, `patients`.`lastname` as `lastname`, `appointments`.`type` as `type`, `doctors`.`firstname` as `doctorFirstname`, `doctors`.`middlename` as `doctorMiddlename`, `doctors`.`lastname` as `doctorLastname` from `appointments` left join `patients` on `patients`.`id` = `appointments`.`patientID` left join `doctors` on `doctors`.`id` = `appointments`.`doctorID` where `appointments`.`deleted_at` in (null, 'NULL', '') and `patients`.`deleted_at` in (null, 'NULL', '') and `appointments`.`date` = ? order by `appointments`.`timeStart` asc", [moment(this.state.presetDate).format("YYYY-MM-DD")], function(tx, rs) {
                if (rs.rows.length > 0) {
                    _.forEach(rs.rows, (v, i) => {
                        db.data[moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A")] = [{
                            'time': moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A"),
                            'patient': rs.rows.item(i).firstname+' '+rs.rows.item(i).middlename+' '+rs.rows.item(i).lastname,
                            'note': rs.rows.item(i).notes,
                            'type': rs.rows.item(i).type,
                            'doctor': 'Dr. '+rs.rows.item(i).doctorFirstname+' '+((rs.rows.item(i).doctorMiddlename) ? rs.rows.item(i).doctorMiddlename+' ':'')+rs.rows.item(i).doctorLastname,
                        }];
                    })
                }
            })
            tx.executeSql("select `followup`.`id` as `id`, `followup`.`description` as `description`, `patients`.`id` as `patientID`, `diagnosis`.`id` as `diagnosisID`, `patients`.`firstname` as `firstname`, `patients`.`lastname` as `lastname`, `patients`.`middlename` as `middlename`, `doctors`.`firstname` as `doctorFirstname`, `doctors`.`middlename` as `doctorMiddlename`, `doctors`.`lastname` as `doctorLastname`, `followup`.`time` as `time`, `followup`.`date` as `date` from `followup` left join `diagnosis` on `diagnosis`.`id` = `followup`.`diagnosisID` left join `doctors` on `doctors`.`id` = `followup`.`leadSurgeon` left join `patients` on `patients`.`id` = `diagnosis`.`patientID` where `followup`.`deleted_at` in (null, 'NULL', '') and `followup`.`date` = ? and `patients`.`deleted_at` in (null, 'NULL', '') order by `followup`.`time` asc", [moment(this.state.presetDate).format("YYYY-MM-DD")], function(tx, rs) {
                if (rs.rows.length > 0) {
                    _.forEach(rs.rows, (v, i) => {
                        db.data[moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A")] = [{
                            'time': moment(rs.rows.item(i).date+' '+rs.rows.item(i).time).format("hh:mm A"),
                            'patient': rs.rows.item(i).firstname+' '+rs.rows.item(i).middlename+' '+rs.rows.item(i).lastname,
                            'note': rs.rows.item(i).notes,
                            'type': rs.rows.item(i).type,
                            'doctor': 'Dr. '+rs.rows.item(i).doctorFirstname+' '+((rs.rows.item(i).doctorMiddlename) ? rs.rows.item(i).doctorMiddlename+' ':'')+rs.rows.item(i).doctorLastname,
                        }];
                    })
                }
            })
        }, (error) => {
            this.setState({refreshing: false})
            console.log('transaction error: ' + error.message);
        }, () => {
            var rowData = {
                date : db.date,
                appointments: db.data
            };
            this.setState({refreshing: false})
            this.setState({rowData: db.data})
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
                    return (<DrawerPage navigator={this.props.navigator}></DrawerPage>)
                }}
                statusBarBackgroundColor={'#2962FF'}
                ref={ref => this.drawerRef = ref}
                >
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar
                            style={[Styles.navigationBar,{}]}
                            routeMapper={NavigationBarRouteMapper(this.drawerRef)} />
                    } />
            </DrawerLayoutAndroid>
        )
    }
    renderScene(route, navigator) {
        return (
            <View style={Styles.containerStyle}>
                <View style={[Styles.subTolbar, {}]}>
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
                    }
                    />
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {}]}
                    onPress={this.showPicker.bind(this, 'simple', {date: this.state.presetDate})}
                    >
                    <Icon name="date-range" size={30} color="#FFF" />
                </TouchableOpacity>
            </View>
        )
    }
    renderListView(rowData, rowID) {
        return (
            <View style={{backgroundColor: '#F5F5F5'}}>
                <Text style={styles.time}>{rowID}</Text>
                <ListView
                    dataSource={ds.cloneWithRows(rowData)}
                    renderRow={(appointmentRowData) => this.renderAppointmentView(appointmentRowData)}
                    />
            </View>
        )
    }
    renderAppointmentView(appointmentRowData) {
        return (
            <TouchableNativeFeedback onPress={() => Alert.alert(
              'Note',
              appointmentRowData.note,
              [{text: 'CLOSE'}]
            )}>
                <View style={styles.listView}>
                    <View>
                        <Text style={[styles.time, {marginRight: 0, marginLeft: 0}]}>{appointmentRowData.time}</Text>
                    </View>
                    <View style={{paddingLeft: 10}}>
                        <Text>{appointmentRowData.type}</Text>
                        <Text>{appointmentRowData.patient}</Text>
                        <Text>{appointmentRowData.doctor}</Text>
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
        height: 30,
        marginLeft: 16,
        marginRight: 16,
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
                <Text style={Styles.titleText}>Dashboard</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = MainPage

'use strict'

import React, {Component} from 'react'
import { Text, StyleSheet, View, DrawerLayoutAndroid, Navigator, ToastAndroid, ProgressBarAndroid, InteractionManager, TouchableOpacity, DatePickerAndroid, TimePickerAndroid, Picker, TextInput, ScrollView, ListView, Modal, RefreshControl, TouchableNativeFeedback, AsyncStorage, Image} from 'react-native'
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import moment from 'moment'
import _ from 'lodash'
import Env from '../../env'
import Styles from '../../assets/Styles'

const EnvInstance = new Env()
const db = EnvInstance.db()
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

class AppointmentPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            presetText: moment().format('MMMM DD, YYYY'),
            doctorID: 0,
            presetDate: Date.now(),
            patientID: 0,
            patientName: 'Select Here...',
            presetStart: {
                presetTime: moment().hour(8).minute(0).format('hh:mm A'),
                presetHour: 8,
                presetMinute: 0,
            },
            presetEnd: {
                presetTime: moment().hour(8).minute(15).format('hh:mm A'),
                presetHour: 8,
                presetMinute: 15,
            },
            setType: 'follow-up',
            notes: '',

            doctors: [],
            patients: [],
            hospitals: [],
            search: '',
            modalVisible: false,
            refreshing: true,
        }
    }
    componentWillMount() {
        if (this.props.patientID)
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
                mobileID: JSON.parse(doctor).mobileID
            })
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            this.updatePatients()
        }
    }
    async showPicker(stateKey, startFrom) {
        if (stateKey === 'date') {
            try {
                const {action, year, month, day} = await DatePickerAndroid.open({
                    date: this.state.presetDate
                });
                if (action === DatePickerAndroid.dismissedAction) {
                    this.setState({presetText: this.state.presetText});
                } else {
                    var date = new Date(year, month, day);
                    this.setState({
                        presetText: moment(date).format('MMMM DD, YYYY'),
                        presetDate: date,
                        search: 'date='+moment(date).format('YYYY-MM-DD'),
                    })
                }
            } catch ({code, message}) {
                console.warn(`Error in example '${stateKey}': `, message);
            }
        } else if (stateKey === 'time') {
            var options = {}
            if (startFrom === 'start') {
                options = {
                    hour: this.state.presetStart.presetHour,
                    minute: this.state.presetStart.presetMinute,
                }
            } else {
                options = {
                    hour: this.state.presetEnd.presetHour,
                    minute: this.state.presetEnd.presetMinute,
                };
            }
            try {
                const {action, minute, hour} = await TimePickerAndroid.open(options);
                if (action === TimePickerAndroid.timeSetAction) {
                    if (startFrom === 'start') {
                        this.setState({
                            presetStart: {
                                presetTime: moment().hour(hour).minute(minute).format('hh:mm A'),
                                presetHour: hour,
                                presetMinute: minute,
                            },
                            presetEnd: {
                                presetTime: moment().hour(hour).minute(minute).add(15,'minutes').format('hh:mm A'),
                                presetHour: moment().hour(hour).minute(minute).add(15,'minutes').hours(),
                                presetMinute: moment().hour(hour).minute(minute).add(15,'minutes').minutes(),
                            },
                        })
                    } else {
                        this.setState({
                            presetEnd: {
                                presetTime: moment().hour(hour).minute(minute).format('hh:mm A'),
                                presetHour: hour,
                                presetMinute: minute,
                            },
                        })
                    }
                }
            } catch ({code, message}) {
                console.warn(`Error in example '${stateKey}': `, message);
            }
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
                        routeMapper={NavigationBarRouteMapper(this.props.patientID, this.props.patientName, this.state.avatar, this.props)} />
                }/>
        )
    }
    renderScene() {
        return (
            <View style={{flex: 1}}>
                <View style={Styles.containerStyle}>
                    {this.props.children}
                    <View style={[Styles.subTolbar, {marginTop: 24}]}>
                        <Text style={Styles.subTitle}>{(this.props.patientID) ? 'Add Appointment' : this.state.presetText}</Text>
                    </View>
                    <Modal
                        animationType={'slide'}
                        transparent={false}
                        visible={this.state.modalVisible}
                        onRequestClose={() => {this.setState({modalVisible: false}) }}>
                        <View style={{flex:1}}>
                            <View style={{padding: 10, paddingLeft: 16,  paddingRight: 0, backgroundColor: '#2979FF'}}>
                                <View style={{flexDirection: 'row', paddingRight: 0}}>
                                    <Icon name={'search'} size={30} style={{color: '#FFF', textAlignVertical: 'center', paddingRight: 8}}/>
                                    <TextInput
                                        style={[styles.textInput, {flex:1, alignItems: 'stretch', color: '#FFF'}]}
                                        placeholderTextColor={'#FFF'}
                                        underlineColorAndroid={'#FFF'}
                                        placeholder={'Search'}
                                        returnKeyType={'search'}
                                        value={this.state.search}
                                        onChangeText={(value) => this.setState({search: value})}
                                        onSubmitEditing={(event) => {
                                            this.setState({refreshing: true}); this.updatePatients();
                                        }}
                                        />
                                    <TouchableOpacity style={{padding: 15}}
                                        onPress={() => {
                                            this.setState({modalVisible: false})
                                        }}>
                                        <Icon name={'close'} size={30} style={{color: '#FFF', textAlignVertical: 'center'}}/>
                                    </TouchableOpacity>
                                </View>
                                <View style={{flexDirection: 'row', paddingTop: 5, paddingBottom: 5, paddingRight: 16}}>
                                    <Text style={{flex:1, alignItems: 'stretch', color: '#FFF'}}>First Name</Text>
                                    <Text style={{flex:1, alignItems: 'stretch', color: '#FFF'}}>Middle Name</Text>
                                    <Text style={{flex:1, alignItems: 'stretch', color: '#FFF'}}>Last Name</Text>
                                </View>
                            </View>
                            <ListView
                                dataSource={ds.cloneWithRows(this.state.patients)}
                                renderRow={(rowData, sectionID, rowID) => {
                                    var patientName = rowData.firstname+' '+rowData.middlename+' '+rowData.lastname;
                                    return (
                                        <TouchableNativeFeedback
                                            onPress={() => {
                                                this.setState({patientID: rowData.id, patientName: patientName, modalVisible: false})
                                            }}>
                                            <View style={{flexDirection: 'row', padding: 12, paddingLeft: 16, paddingRight: 16, backgroundColor: (rowID%2) ? '#FFFFFF' : '#FAFAFA', borderBottomWidth: 0.5, borderBottomColor: '#EEE'}}>
                                                <Text style={{flex: 1, alignItems: 'stretch'}}>{rowData.firstname}</Text>
                                                <Text style={{flex: 1, alignItems: 'stretch'}}>{rowData.middlename}</Text>
                                                <Text style={{flex: 1, alignItems: 'stretch'}}>{rowData.lastname}</Text>
                                            </View>
                                        </TouchableNativeFeedback>
                                    )
                                }}
                                enableEmptySections={true}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.updatePatients.bind(this)}
                                        />
                                }/>
                        </View>
                    </Modal>
                    <ScrollView style={styles.containerWrapper}
                        keyboardShouldPersistTaps={true}>
                        {(this.props.patientID) ? (
                            <View style={{flex: 1, alignItems: 'stretch', marginTop: 20}}>
                                <Text style={[styles.label]}>Date</Text>
                                <View style={styles.textCustom}>
                                    <Text style={styles.textCustomValue}
                                        onPress={this.showPicker.bind(this, 'date')}>{this.state.presetText}</Text>
                                </View>
                            </View>
                        ) : (
                            <View>
                                <Text style={[styles.label, {marginTop: 20}]}>Patient</Text>
                                <View style={styles.textCustom}>
                                    <Text style={styles.textCustomValue}
                                        onPress={() => {
                                            this.setState({modalVisible: true})
                                        }}>{this.state.patientName}</Text>
                                </View>
                            </View>
                        )}
                        <View style={{flexDirection: 'row'}}>
                            <View style={{flex: 1, alignItems: 'stretch'}}>
                                <Text style={styles.label}>Time Start</Text>
                                <View style={styles.textCustom}>
                                    <Text style={styles.textCustomValue}
                                        onPress={this.showPicker.bind(this, 'time', 'start')}>{this.state.presetStart.presetTime}</Text>
                                </View>
                            </View>
                            <View style={{flex: 1, alignItems: 'stretch'}}>
                                <Text style={styles.label}>Time End</Text>
                                <View style={styles.textCustom}>
                                    <Text style={styles.textCustomValue}
                                        onPress={this.showPicker.bind(this, 'time', 'end')}>{this.state.presetEnd.presetTime}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.label} >Type</Text>
                        <View style={styles.select}>
                            <Picker
                                selectedValue={this.state.setType}
                                onValueChange={(value) => this.setState({setType: value})}>
                                <Picker.Item label="Follow-Up" value="follow-up" />
                                <Picker.Item label="Hospital Admission" value="admission" />
                                <Picker.Item label="Medical Diagnosis" value="diagnosis" />
                                <Picker.Item label="Procedure" value="procedure" />
                                <Picker.Item label="Initial Check-Up" value="unspecified" />
                            </Picker>
                        </View>
                        <Text style={styles.label} >Note</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput, {textAlignVertical: 'top', marginBottom: 90, paddingTop: 10, paddingBottom: 20, height: Math.max(35, this.state.height)}]}
                            onContentSizeChange={(event) => {
                                this.setState({height: event.nativeEvent.contentSize.height});
                            }}
                            autoCapitalize={'words'}
                            value={this.state.notes}
                            placeholderTextColor={'#E0E0E0'}
                            multiline={true}
                            onChangeText={(text) => this.setState({notes: text})} />
                    </ScrollView>
                    {(this.props.patientID) ? (
                        <View/>
                    ) : (
                        <TouchableOpacity
                            style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 24}]}
                            onPress={this.showPicker.bind(this, 'date')}
                            >
                            <Icon name="date-range" size={30} color="#FFF" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[Styles.buttonFab, {backgroundColor: '#4CAF50'}]}
                        onPress={this.onSubmit.bind(this)}>
                        <Icon name="save" size={30} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    updatePatients() {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM patients WHERE (deleted_at in (null, 'NULL', '') OR deleted_at is null) AND (firstname LIKE '%"+this.state.search+"%' OR middlename LIKE '%"+this.state.search+"%' OR  lastname LIKE '%"+this.state.search+"%') ORDER BY firstname ASC", [], (tx, rs) => {
                db.data = rs.rows
            })
        }, (err) => {
            alert(err.message)
        }, () => {
            var patients = [];
            _.forEach(db.data, (v, i) => {
                patients.push(db.data.item(i))
            })
            this.setState({patients: patients, refreshing: false})
        })
    }
    onSubmit() {
        var currentDate = moment(this.state.presetText).format('YYYY-MM-DD');
        var timeStart = moment(this.state.presetText+' '+this.state.presetStart.presetTime).add(1, 'minutes').format('HH:mm:00');
        var timeEnd = moment(this.state.presetText+' '+this.state.presetEnd.presetTime).subtract(1, 'minutes').format('HH:mm:00');
        db.transaction((tx) => {
            db.duplicate = false;
            tx.executeSql("SELECT DISTINCT COUNT(`appointments`.`id`) as total FROM `appointments` LEFT OUTER JOIN `patients` ON `patients`.`id` = `appointments`.`patientID` WHERE (`appointments`.`deleted_at` IN (null, 'NULL', '') OR `appointments`.`deleted_at` is null) AND `appointments`.`doctorID` = "+this.state.doctorID+" AND (`appointments`.`timeStart` BETWEEN '"+timeStart+"' AND '"+timeEnd+"' OR `appointments`.`timeEnd` BETWEEN '"+timeStart+"' AND '"+timeEnd+"' OR (`appointments`.`timeStart` < '"+timeStart+"' AND `appointments`.`timeEnd` > '"+timeEnd+"')) AND `appointments`.`date` = '"+currentDate+"' AND (`patients`.`deleted_at` IN (null, 'NULL', '') OR `patients`.`deleted_at` is null)", [], (tx, rs) => {
                if (rs.rows.item(0).total > 0) {
                    db.duplicate = true;
                    db.type = 'appointment';
                } else {
                    tx.executeSql("SELECT DISTINCT COUNT(`followup`.`id`) as total FROM `followup` LEFT OUTER JOIN `diagnosis` ON `diagnosis`.`id` = `followup`.`diagnosisID` LEFT OUTER JOIN `patients` ON `patients`.`id` = `diagnosis`.`patientID` WHERE (`followup`.`deleted_at` IN (null, 'NULL', '') OR `followup`.`deleted_at` is null) AND `followup`.`leadSurgeon` = '"+this.state.doctorID+"' AND (`followup`.`time` BETWEEN '"+timeStart+"' AND '"+timeEnd+"' OR strftime('%H:%M:%S', `followup`.`time`, '+30 minutes') BETWEEN '"+timeStart+"' AND '"+timeEnd+"' OR (`followup`.`time` < '"+timeStart+"' AND strftime('%H:%M:%S', `followup`.`time`, '+30 minutes') > '"+timeEnd+"')) AND `followup`.`date` = '"+currentDate+"' AND (`patients`.`deleted_at` IN (null, 'NULL', '') OR `patients`.`deleted_at` is null)", [], (tx, rs) => {
                        if (rs.rows.item(0).total > 0) {
                            db.duplicate = true;
                            db.type = 'followup';
                        } else {
                            var insertID = this.state.mobileID*100000;
                            tx.executeSql("SELECT id FROM appointments WHERE id BETWEEN "+insertID+" AND "+((insertID*2)-1)+" ORDER BY created_at DESC LIMIT 1", [], (tx, rs) => {
                                if (rs.rows.length > 0)
                                    insertID = rs.rows.item(0).id + 1;
                                var values = {
                                    id: insertID,
                                    date: currentDate,
                                    timeStart: moment(this.state.presetText+' '+this.state.presetStart.presetTime).format('HH:mm:00'),
                                    timeEnd: moment(this.state.presetText+' '+this.state.presetEnd.presetTime).format('HH:mm:00'),
                                    patientID: (this.props.patientID) ? this.props.patientID : this.state.patientID,
                                    doctorID: this.state.doctorID,
                                    hospitalID: '',
                                    type: this.state.setType,
                                    notes: this.state.notes,
                                    deleted_at: '',
                                    created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                                }
                                tx.executeSql("INSERT INTO appointments (id, date, timeStart, timeEnd, patientID, doctorID, hospitalID, type, notes, deleted_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", _.values(values), (tx, rs) => {
                                    console.log("created: " + rs.rowsAffected);
                                }, (err) => { alert(err.message)})
                            })
                        }
                    }, (err) => { alert(err.message)})
                }
            }, (err) => { alert(err.message)})
        }, (err) => {
            alert(err.message)
        }, () => {
            if(db.duplicate) {
                ToastAndroid.show('Time Reflected At '+db.type+'!', 1000);
            } else {
                ToastAndroid.show('Appointment Successfully Scheduled!', 3000);
                this.props.navigator.replacePreviousAndPop({
                    id: (this.props.patientID) ? 'AppointmentPatientPage' : 'AppointmentPage',
                    passProps: this.props
                });
            }
        })
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
    containerWrapper: {
        backgroundColor: '#FFFFFF',
        paddingLeft: 16,
        paddingRight: 16,
    },
    label: {
        color: '#616161',
        textAlign: 'left',
        marginLeft: 4,
        marginRight: 4,
    },
    select: {
        borderBottomWidth: 1,
        borderBottomColor: '#757575',
        borderStyle: 'solid',
        marginLeft: 4,
        marginRight: 4,
        marginBottom: 10,
        paddingLeft: -5,
    },
    textInput: {
        fontSize: 16,
        paddingTop: 5,
        marginBottom: 5,
    },
    textCustom: {
        borderStyle:'solid',
        borderBottomWidth: 1,
        borderBottomColor: '#757575',
        margin: 4,
        marginBottom: 10,
        marginTop: 10
    },
    textCustomValue: {
        color: '#212121',
        fontSize: 16,
        paddingBottom: 14
    },
    switch: {
        height: 25,
        textAlignVertical: 'center',
        color: '#9E9E9E'
    },
})

var NavigationBarRouteMapper = (patientID, patientName, avatar, props) => ({
    LeftButton(route, navigator, index, nextState) {
        if (patientID)
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
        else
            return (
                <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
                    onPress={() => {
                        navigator.parentNavigator.pop()
                    }}>
                    <Text style={{color: 'white', margin: 10,}}>
                        <Icon name={"keyboard-arrow-left"} size={30} color={"#FFF"} />
                    </Text>
                </TouchableOpacity>
            )
    },
    RightButton(route, navigator, index, nextState) {
        return null
    },
    Title(route, navigator, index, nextState) {
        if (patientID)
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
        else
            return (
                <TouchableOpacity style={Styles.title}>
                    <Text style={Styles.titleText}>Add Appointment</Text>
                </TouchableOpacity>
            )
    }
})

module.exports = AppointmentPage

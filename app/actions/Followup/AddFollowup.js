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

class AddFollowup extends Component {
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
                presetTime: moment().hour(8).minute(30).format('hh:mm A'),
                presetHour: 8,
                presetMinute: 30,
            },
            name: '',
            description: '',
            emergencyOrElective: 'elective',

            doctors: [],
            patients: [],
            hospitals: [],
            search: '',
            modalVisible: false,
            refreshing: true,
        }
    }
    componentWillMount() {
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
                RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                    this.setState({avatar: (rs.toString().indexOf('dataimage/'+this.props.patientAvatar.split('.').pop()+'base64') !== -1) ? _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,') : 'data:image/'+this.props.patientAvatar.split('.').pop()+';base64,'+rs.toString()})
                })
        })
    }
    componentDidMount() {
        this.updateCredentials().done();
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            this.setState({doctorID: JSON.parse(doctor).id, mobileID: JSON.parse(doctor).mobileID})
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
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
                                presetTime: moment().hour(hour).minute(minute).add(30,'minutes').format('hh:mm A'),
                                presetHour: moment().hour(hour).minute(minute).add(30,'minutes').hours(),
                                presetMinute: moment().hour(hour).minute(minute).add(30,'minutes').minutes(),
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
                        routeMapper={NavigationBarRouteMapper(this.props.patientID, this.props.patientName, this.state.avatar)} />
                }/>
        )
    }
    renderScene() {
        return (
            <View style={{flex: 1}}>
                <View style={Styles.containerStyle}>
                    {this.props.children}
                    <View style={[Styles.subTolbar, {marginTop: 24}]}>
                        <Text style={Styles.subTitle}>Add Follow-Up</Text>
                    </View>
                    <ScrollView style={styles.containerWrapper}
                        keyboardShouldPersistTaps={true}>
                        <View style={{flexDirection: 'row', marginTop: 20}}>
                            <View style={{flex: 1, alignItems: 'stretch'}}>
                                <Text style={[styles.label]}>Date</Text>
                                <View style={styles.textCustom}>
                                    <Text style={styles.textCustomValue}
                                        onPress={this.showPicker.bind(this, 'date')}>{this.state.presetText}</Text>
                                </View>
                            </View>
                            <View style={{flex: 1, alignItems: 'stretch'}}>
                                <Text style={styles.label}>Time Start</Text>
                                <View style={styles.textCustom}>
                                    <Text style={styles.textCustomValue}
                                        onPress={this.showPicker.bind(this, 'time', 'start')}>{this.state.presetStart.presetTime}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.label} >Type</Text>
                        <View style={styles.select}>
                            <Picker
                                selectedValue={this.state.emergencyOrElective}
                                onValueChange={(value) => this.setState({emergencyOrElective: value})} >
                                <Picker.Item label="Elective" value="elective" />
                                <Picker.Item label="Emergency" value="emergency" />
                            </Picker>
                        </View>
                        <Text style={styles.label} >Brief Description</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput, {textAlignVertical: 'top'}]}
                            autoCapitalize={'words'}
                            value={this.state.name}
                            placeholderTextColor={'#E0E0E0'}
                            multiline={true}
                            numberOfLines={2}
                            onChangeText={(text) => this.setState({name: text})} />
                        <Text style={styles.label}>Description of Follow-Up</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput, {textAlignVertical: 'top', marginBottom: 150}]}
                            autoCapitalize={'words'}
                            value={this.state.description}
                            placeholderTextColor={'#E0E0E0'}
                            multiline={true}
                            numberOfLines={4}
                            onChangeText={(text) => this.setState({description: text})} />
                    </ScrollView>
                    <TouchableOpacity
                        style={[Styles.buttonFab, {backgroundColor: '#4CAF50', bottom: 80}]}
                        onPress={this.onSubmit.bind(this)}>
                        <Icon name="save" size={30} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <View style={{position: 'absolute', bottom: 0, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    <TouchableNativeFeedback
                        onPress={() => this.props.navigator.push({
                            id: 'OrderItem',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName }
                        })}>
                        <View style={{backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#EC407A', borderStyle: 'solid', borderRightWidth: 1}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'schedule'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Labwork</Text>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback
                        onPress={() => this.props.navigator.push({
                            id: 'ImagePage',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName
                            }
                        })}>
                        <View style={{backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'photo'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Imaging</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        )
    }
    onSubmit() {
        var currentDate = moment(this.state.presetText).format('YYYY-MM-DD');
        var timeStart = moment(this.state.presetText+' '+this.state.presetStart.presetTime).add(1, 'minutes').format('HH:mm:00');
        var timeEnd = moment(this.state.presetText+' '+this.state.presetEnd.presetTime).subtract(1, 'minutes').format('HH:mm:00');
        if (!this.state.name) {
            ToastAndroid.show('Cannot be empty brief description!', 3000);
        } else {
            db.transaction((tx) => {
                db.duplicate = false;
                tx.executeSql("SELECT DISTINCT COUNT(`appointments`.`id`) as total FROM `appointments` LEFT OUTER JOIN `patients` ON `patients`.`id` = `appointments`.`patientID` WHERE (`appointments`.`deleted_at` IN (null, 'NULL', '') OR `appointments`.`deleted_at` is null) AND `appointments`.`doctorID` = "+this.state.doctorID+" AND (`appointments`.`timeStart` BETWEEN '"+timeStart+"' AND '"+timeEnd+"' OR `appointments`.`timeEnd` BETWEEN '"+timeStart+"' AND '"+timeEnd+"' OR (`appointments`.`timeStart` < '"+timeStart+"' AND `appointments`.`timeEnd` > '"+timeEnd+"')) AND `appointments`.`date` = '"+currentDate+"' AND (`patients`.`deleted_at` IN (null, 'NULL', '') OR `patients`.`deleted_at` is null)", [], (tx, rs) => {
                    if (rs.rows.item(0).total > 0) {
                        db.duplicate = true;
                        db.type = 'apppointment';
                    } else {
                        tx.executeSql("SELECT DISTINCT COUNT(`followup`.`id`) as total FROM `followup` LEFT OUTER JOIN `diagnosis` ON `diagnosis`.`id` = `followup`.`diagnosisID` LEFT OUTER JOIN `patients` ON `patients`.`id` = `diagnosis`.`patientID` WHERE (`followup`.`deleted_at` IN (null, 'NULL', '') OR `followup`.`deleted_at` is null) AND `followup`.`leadSurgeon` = '"+this.state.doctorID+"' AND (`followup`.`time` BETWEEN '"+timeStart+"' AND '"+timeEnd+"' OR strftime('%H:%M:%S', `followup`.`time`, '+30 minutes') BETWEEN '"+timeStart+"' AND '"+timeEnd+"' OR (`followup`.`time` < '"+timeStart+"' AND strftime('%H:%M:%S', `followup`.`time`, '+30 minutes') > '"+timeEnd+"')) AND `followup`.`date` = '"+currentDate+"' AND (`patients`.`deleted_at` IN (null, 'NULL', '') OR `patients`.`deleted_at` is null)", [], (tx, rs) => {
                            if (rs.rows.item(0).total > 0) {
                                db.duplicate = true;
                                db.type = 'followup';
                            } else {
                                var insertID = this.state.mobileID*100000;
                                tx.executeSql("SELECT id FROM followup WHERE id BETWEEN "+insertID+" AND "+((insertID*2)-1)+" ORDER BY created_at DESC LIMIT 1", [], (tx, rs) => {
                                    if (rs.rows.length > 0)
                                        insertID = rs.rows.item(0).id + 1;
                                    var values = {
                                        id:  insertID,
                                        diagnosisID: this.props.diagnosisID,
                                        date: currentDate,
                                        time: moment(this.state.presetText+' '+this.state.presetStart.presetTime).format('HH:mm:00'),
                                        description: this.state.description,
                                        name: this.state.name,
                                        emergencyOrElective: this.state.emergencyOrElective,
                                        pay: 'personal',
                                        leadSurgeon: this.state.doctorID,
                                        deleted_at: '',
                                        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    }
                                    tx.executeSql("INSERT INTO followup (id, diagnosisID, date, time, description, name, emergencyOrElective, pay, leadSurgeon, deleted_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", _.values(values), (tx, rs) => {
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
                    ToastAndroid.show('Time slot reflected at '+db.type+'!', 1000);
                } else {
                    ToastAndroid.show('Followup successfully scheduled!', 3000);
                    this.props.navigator.pop();
                }
            })
        }
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

module.exports = AddFollowup

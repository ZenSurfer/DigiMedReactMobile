'use strict';

import React, { Component } from 'react'
import { Text, StyleSheet, View, DrawerLayoutAndroid, Navigator, ToastAndroid, ProgressBar, InteractionManager, TouchableOpacity, DatePickerAndroid, TimePickerAndroid, Picker, TextInput, ScrollView, ListView} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import moment from 'moment'
import Env from '../env'

import Styles from '../assets/Styles'
import DrawerPage from '../components/DrawerPage'

class FrontPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            presetText: moment().format('MMMM DD, YYYY'),
            presetDate: Date.now(),
            patientID: 0,
            doctorID: 0,
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
            note: '',

            doctors: [],
            patients: [],
            hospitals: [],

            renderPlaceholderOnly: true,
            progress: 0,
        }
        this.drawerRef = {}
    }
    componentWillMount() {
        this.setState({refreshing: true})
        fetch('http://192.168.1.40/imd5/public/api/v2/frontdesk')
        .then((response) => {
            return response.json()
        }).then((data) => {
            this.setState({
                doctors: data.doctors,
                patients: data.patients,
                hospitals: data.hospitals,
            })
        }).then(() => {
            this.setState({refreshing: false})
        })
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({renderPlaceholderOnly: false, progress: 1});
        });
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
                    renderScene={(this.state.renderPlaceholderOnly) ? this.renderPlaceholderView.bind(this) : this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar
                            style={[Styles.navigationBar,{}]}
                            routeMapper={NavigationBarRouteMapper(this.drawerRef)} />
                    } />
            </DrawerLayoutAndroid>
        )
    }
    renderPlaceholderView() {
        return (
            <View style={Styles.containerStyle}>
                <View style={[Styles.subTolbar, {}]}>
                    <Text style={Styles.subTitle}>Edit Patient Information</Text>
                </View>
                <View style={Styles.loading}>
                    <ProgressBar style={Styles.progress} styleAttr={'Horizontal'} color={'#FF5722'}/>
                </View>
            </View>
        );
    }
    renderScene(route, navigator) {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={Styles.subTolbar}>
                    <Text style={Styles.subTitle}>{this.state.presetText}</Text>
                </View>
                <ScrollView style={styles.containerWrapper}
                    keyboardShouldPersistTaps={'always'}>
                    <Text style={[styles.label, {marginTop: 20}]}>Select Patient</Text>
                    <View style={styles.select}>
                        <Picker
                            selectedValue={this.state.patientID}
                            onValueChange={(value) => this.setState({patientID: value})}>
                            { this.state.patients.map((s, i) => {
                                return <Picker.Item key={i} value={s.id} label={s.fullname} />
                            })}
                        </Picker>
                    </View>
                    <Text style={styles.label}>Time Start</Text>
                    <TextInput
                        placeholder={'Text Here...'}
                        style={styles.textInput}
                        value={this.state.presetStart.presetTime}
                        placeholderTextColor={'#E0E0E0'}
                        onFocus={this.showPicker.bind(this, 'time', 'start')} />
                    <Text style={styles.label}>Time End</Text>
                    <TextInput
                        placeholder={'Text Here...'}
                        style={styles.textInput}
                        value={this.state.presetEnd.presetTime}
                        placeholderTextColor={'#E0E0E0'}
                        onFocus={this.showPicker.bind(this, 'time', 'end')} />
                    <Text style={styles.label} >Select Doctor</Text>
                    <View style={styles.select}>
                        <Picker
                            selectedValue={this.state.doctorID}
                            onValueChange={(value) => this.setState({doctorID: value})}>
                            { this.state.doctors.map((s, i) => {
                                return <Picker.Item key={i} value={s.id} label={s.fullname} />
                            })}
                        </Picker>
                    </View>
                    <Text style={styles.label} >Select Type</Text>
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
                        style={[styles.textInput, {textAlignVertical: 'top', marginBottom: 16, paddingTop: 10, paddingBottom: 20, height: Math.max(35, this.state.height)}]}
                        onContentSizeChange={(event) => {
                            this.setState({height: event.nativeEvent.contentSize.height});
                        }}
                        autoCapitalize={'words'}
                        value={this.state.note}
                        placeholderTextColor={'#E0E0E0'}
                        multiline={true}
                        onChangeText={(text) => this.setState({note: text})} />
                </ScrollView>
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {}]}
                    onPress={this.showPicker.bind(this, 'date')}
                    >
                    <Icon name="date-range" size={30} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[Styles.buttonFab, {backgroundColor: '#4CAF50'}]}
                    onPress={this.onSubmit.bind(this)}>
                    <Icon name="save" size={30} color="#FFF" />
                </TouchableOpacity>
            </View>
        )
    }
    onSubmit() {
        this.setState({refreshing: true})
        if (this.state.patientID === 0) {
            ToastAndroid.show('Select Patient!', 3000)
        } else if (this.state.doctorID === 0) {
            ToastAndroid.show('Select Doctor!', 3000)
        } else {
            fetch(env.emrUrl+'/frontdesk/create', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: this.jsonToQueryString({
                    patientID: this.state.patientID,
                    doctorID: this.state.doctorID,
                    timeStart: this.state.presetStart.presetTime,
                    timeEnd: this.state.presetEnd.presetTime,
                    type: this.state.setType,
                    note: this.state.note,
                    date: moment(this.state.presetText).format('YYYY-MM-DD'),
                })
            }).then((response) => {
                console.log(response);
                return response.json()
            }).then((data) => {
                this.setState({refreshing: false})
                if (data.status === 'success') {
                    ToastAndroid.show(data.message, 8000)
                } else {
                    ToastAndroid.show(data.message, 15000)
                }
            })
        }
    }
    jsonToQueryString(json) {
        return Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' +
            encodeURIComponent(json[key]);
        }).join('&');
    }
    drawerInstance(instance) {
        drawerRef = instance
    }
}
const styles = StyleSheet.create({
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
    switch: {
        height: 25,
        textAlignVertical: 'center',
        color: '#9E9E9E'
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
                <Text style={Styles.titleText}>Frontdesk</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = FrontPage;

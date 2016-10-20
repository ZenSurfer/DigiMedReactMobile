'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, Dimensions, View, ActivityIndicator, Navigator, TouchableOpacity, TouchableNativeFeedback, ScrollView, RefreshControl, InteractionManager, ToastAndroid, Alert, TouchableHighlight, Modal, ToolbarAndroid} from 'react-native'
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import moment from 'moment'
import _ from 'lodash'
import Env from '../../env'

import Styles from '../../assets/Styles'

const EnvInstance = new Env()
const db = EnvInstance.db()
const {height, width} = Dimensions.get('window')

class HPEDInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            rowData: [],
            renderPlaceholderOnly: true,
            steps: {active: 1},
            avatar: false,
            icds: [],
        }
    }
    componentWillMount() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT `diagnosis`.`patientID`, `diagnosis`.`doctorID`, `diagnosis`.`appointmentID`, `diagnosis`.`preparedByID`, `diagnosis`.`chiefComplaint`, `diagnosis`.`historyIllness`, `diagnosis`.`bodyTemperature`, `diagnosis`.`bloodPressure`, `diagnosis`.`respirationRate`, `diagnosis`.`pulseRate`, `diagnosis`.`medicalHistory`, `diagnosis`.`initialDiagnosis`, `diagnosis`.`physicalExam`, `diagnosis`.`services`, `diagnosis`.`type`, `diagnosis`.`code`, `diagnosis`.`category`, `diagnosis`.`plan`, `diagnosis`.`pay`, `diagnosis`.`referringDoctor`, `diagnosis`.`labs`, `diagnosis`.`imaging`, `diagnosis`.`accident`, `diagnosis`.`painLevel`, `diagnosis`.`allergies`, `diagnosis`.`currentMedications`, `diagnosis`.`date`, `diagnosis`.`timeStart`, `diagnosis`.`timeEnd`, `diagnosis`.`certRemarks`, `diagnosis`.`certPurpose`, ('Dr. ' || `doctors`.`firstname` || ' ' || `doctors`.`middlename` || ' ' || `doctors`.`lastname`)  AS `doctorName` FROM `diagnosis` LEFT OUTER JOIN `doctors` on `diagnosis`.`doctorID` = `doctors`.`id` WHERE `diagnosis`.`id` = ? LIMIT 1", [this.props.diagnosisID], function(tx, rs) {
                db.data = rs.rows
            }, function(error) {
                console.log('SELECT SQL statement ERROR: ' + error.message);
            });
            tx.executeSql("SELECT `icds`.`code` as `code`, `icds`.`description` as `description` FROM `diagnosisIcds` LEFT OUTER JOIN `icds` ON `icds`.`id` = `diagnosisIcds`.`icdID` WHERE `diagnosisIcds`.`diagnosisID` = ? AND (`diagnosisIcds`.`deleted_at` in (null, 'NULL', '') OR `diagnosisIcds`.`deleted_at` is null) ORDER BY `icds`.`code` ASC", [this.props.diagnosisID], (tx, rs) => {
                db.icds = rs.rows;
            })
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            this.setState({refreshing: false})
            this.setState({rowData: db.data.item(0)})
            var icds = [];
            _.forEach(db.icds, (v, i) => {
                icds.push(db.icds.item(i).code+': '+db.icds.item(i).description);
            })
            this.setState({icds: icds})
        })
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
                RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                    this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')})
                })
        })
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT `diagnosis`.`patientID`, `diagnosis`.`doctorID`, `diagnosis`.`appointmentID`, `diagnosis`.`preparedByID`, `diagnosis`.`chiefComplaint`, `diagnosis`.`historyIllness`, `diagnosis`.`bodyTemperature`, `diagnosis`.`bloodPressure`, `diagnosis`.`respirationRate`, `diagnosis`.`pulseRate`, `diagnosis`.`medicalHistory`, `diagnosis`.`initialDiagnosis`, `diagnosis`.`physicalExam`, `diagnosis`.`services`, `diagnosis`.`type`, `diagnosis`.`code`, `diagnosis`.`category`, `diagnosis`.`plan`, `diagnosis`.`pay`, `diagnosis`.`referringDoctor`, `diagnosis`.`labs`, `diagnosis`.`imaging`, `diagnosis`.`accident`, `diagnosis`.`painLevel`, `diagnosis`.`allergies`, `diagnosis`.`currentMedications`, `diagnosis`.`date`, `diagnosis`.`timeStart`, `diagnosis`.`timeEnd`, `diagnosis`.`certRemarks`, `diagnosis`.`certPurpose`, ('Dr. ' || `doctors`.`firstname` || ' ' || `doctors`.`middlename` || ' ' || `doctors`.`lastname`)  AS `doctorName` FROM diagnosis LEFT OUTER JOIN `doctors` on `diagnosis`.`doctorID` = `doctors`.`id` WHERE `diagnosis`.`id` = ? LIMIT 1", [this.props.diagnosisID], function(tx, rs) {
                db.data = rs.rows
            });
            tx.executeSql("SELECT `icds`.`code` as `code`, `icds`.`description` as `description` FROM `diagnosisIcds` LEFT OUTER JOIN `icds` ON `icds`.`id` = `diagnosisIcds`.`icdID` WHERE `diagnosisIcds`.`diagnosisID` = ? AND (`diagnosisIcds`.`deleted_at` in (null, 'NULL', '') OR `diagnosisIcds`.`deleted_at` is null) ORDER BY `icds`.`code` ASC", [this.props.diagnosisID], (tx, rs) => {
                db.icds = rs.rows;
            })
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            this.setState({refreshing: false})
            this.setState({rowData: db.data.item(0)})
            var icds = [];
            _.forEach(db.icds, (v, i) => {
                icds.push(db.icds.item(i).code+': '+db.icds.item(i).description);
            })
            this.setState({icds: icds})
        })
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({renderPlaceholderOnly: false, progress: 1});
        });
    }
    render() {
        return (
            <Navigator
                renderScene={(this.state.renderPlaceholderOnly) ? this.renderPlaceholderView.bind(this) : this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={[Styles.navigationBar,{marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper(this.props.patientName, this.props, this.state.avatar)} />
                }/>
        )
    }
    renderPlaceholderView() {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>H.P.E.D. Information</Text>
                </View>
                <View style={Styles.loading}>
                    <View style={Styles.horizontal}><ActivityIndicator color="#212121" size={23}/></View>
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
                            id: 'PrescriptionPage',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName
                            }
                        })}>
                        <View style={{backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#EC407A', borderStyle: 'solid', borderRightWidth: 1}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'assignment'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Prescription</Text>
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
        );
    }
    renderScene(route, navigator) {
        return (
            <View style={{flex: 1}}>
                <View style={Styles.containerStyle}>
                    {this.props.children}
                    <View style={[Styles.subTolbar, {marginTop: 24}]}>
                        <Text style={Styles.subTitle}>H.P.E.D. Information</Text>
                    </View>
                    <View style={{flexDirection: 'row', backgroundColor: '#E0E0E0', paddingRight:100}}>
                        <TouchableOpacity
                            activeOpacity={(this.state.steps.active == 1) ? 1 : 0.2}
                            style={[styles.steps, (this.state.steps.active == 1) ? styles.stepsActive : {}]}
                            onPress={() => this.setState({steps: {active: 1}})}>
                            <Text style={[(this.state.steps.active == 1) ? styles.stepsTextActive : styles.stepsText]}>Diagnosis</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={(this.state.steps.active == 2) ? 1 : 0.2}
                            style={[styles.steps, (this.state.steps.active == 2) ? styles.stepsActive : {}]}
                            onPress={() => this.setState({steps: {active: 2}})}>
                            <Text style={[(this.state.steps.active == 2) ? styles.stepsTextActive : styles.stepsText]}>Others</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        style={{marginBottom: 60, marginTop: 0,}}
                        refreshControl={
                            <RefreshControl
                                style={{marginTop: 20}}
                                refreshing={this.state.refreshing}
                                progressViewOffset={0}
                                onRefresh={this.onRefresh.bind(this)}
                                />
                        }>
                        <View style={[styles.person, {backgroundColor: '#FFFFFF'}]}>
                            {this.steps(this.state.steps.active)}
                        </View>
                    </ScrollView>
                    <TouchableOpacity
                        style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 24}]}
                        onPress={() => this.props.navigator.push({
                            id: 'EditHPED',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName
                            }
                        })}>
                        <Icon name={'edit'} color={'#FFFFFF'} size={30}/>
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
                            id: 'PrescriptionPage',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName
                            }
                        })}>
                        <View style={{backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#EC407A', borderStyle: 'solid', borderRightWidth: 1}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'assignment'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Prescription</Text>
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
    steps(step) {
        switch (step) {
            case 1:
                return (
                    <View style={{backgroundColor: '#FFFFFF', marginTop: 10}}>
                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                            <Text style={styles.label}>Chief Complaint</Text>
                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.chiefComplaint) ? this.state.rowData.chiefComplaint : '-'}</Text></View>
                        </View>
                        <View style={[styles.rows, {flexDirection: 'row'}]}>
                            <Text style={[styles.label, {color: (this.state.rowData.historyIllness) ? '#EC407A': '#757575'}]}>History of Present Illness</Text>
                            <TouchableOpacity onPress={this.openModal.bind(this, 'History of Present Illness', this.state.rowData.historyIllness)}>
                                <Icon name={'info'} size={30} color={'#03A9F4'}/>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.rows, {flexDirection: 'row'}]}>
                            <Text style={[styles.label, {color: (this.state.rowData.medicalHistory) ? '#EC407A': '#757575'}]}>Pertinent Medical History</Text>
                            <TouchableOpacity onPress={this.openModal.bind(this, 'Pertinent Medical History', this.state.rowData.medicalHistory)}>
                                <Icon name={'info'} size={30} color={'#03A9F4'}/>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                            <Text style={styles.label}>Initial Diagnosis</Text>
                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.initialDiagnosis) ? this.state.rowData.initialDiagnosis : '-'}</Text></View>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <View style={[styles.rows, {flex:1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                <Text style={styles.label}>Blood Pressure</Text>
                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.bloodPressure != ' / ') ? this.state.rowData.bloodPressure : '- / -'} mmHg</Text></View>
                            </View>
                            <View style={[styles.rows, {flex:1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                <Text style={styles.label}>Body Temperature</Text>
                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.bodyTemperature) ? this.state.rowData.bodyTemperature : '-'} °C</Text></View>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <View style={[styles.rows, {flex:1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                <Text style={styles.label}>Respiration Rate</Text>
                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.respirationRate) ? this.state.rowData.respirationRate : '-'} / minute</Text></View>
                            </View>
                            <View style={[styles.rows, {flex:1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                <Text style={styles.label}>Pulse Rate</Text>
                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.pulseRate) ? this.state.rowData.pulseRate : '-'} / minute</Text></View>
                            </View>
                        </View>
                    </View>
                )
            break;
            case 2:
                return (
                    <View style={{backgroundColor: '#FFFFFF', marginTop: 10}}>
                        <View style={[styles.rows, {flexDirection: 'row'}]}>
                            <Text style={[styles.label, {color: (this.state.rowData.accident > 0) ? '#EC407A': '#757575'}]}>Is Accident?</Text>
                            <TouchableOpacity onPress={this.openModal.bind(this, 'Is Accident?', (this.state.rowData.accident > 0) ? 'Yes / Pain Level '+this.state.rowData.painLevel : 'No')}>
                                <Icon name={'info'} size={30} color={'#03A9F4'}/>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                            <Text style={styles.label}>Physical Exam</Text>
                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.physicalExam) ? this.state.rowData.physicalExam : '-'}</Text></View>
                        </View>
                        <View style={[styles.rows, {flexDirection: 'row'}]}>
                            <Text style={[styles.label, {color: (this.state.rowData.allergies) ? '#EC407A': '#757575'}]}>Allergies</Text>
                            <TouchableOpacity onPress={this.openModal.bind(this, 'Allergies', this.state.rowData.allergies)}>
                                <Icon name={'info'} size={30} color={'#03A9F4'}/>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.rows, {flexDirection: 'row'}]}>
                            <Text style={[styles.label, {color: (this.state.rowData.currentMedications) ? '#EC407A': '#757575'}]}>Current Medications</Text>
                            <TouchableOpacity onPress={this.openModal.bind(this, 'Current Medications', this.state.rowData.currentMedications)}>
                                <Icon name={'info'} size={30} color={'#03A9F4'}/>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                            <Text style={styles.label}>Plan</Text>
                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.plan) ? this.state.rowData.plan : '-'}</Text></View>
                        </View>
                        <View style={[styles.rows, {flexDirection: 'row'}]}>
                            <Text style={[styles.label, {color: (_.size(this.state.icds) > 0) ? '#EC407A': '#757575'}]}>ICD's</Text>
                            <TouchableOpacity onPress={this.openModal.bind(this, "ICD's", _.join(this.state.icds, ', '))}>
                                <Icon name={'info'} size={30} color={'#03A9F4'}/>
                            </TouchableOpacity>
                        </View>
                        {(!this.state.other) ? (<TouchableOpacity
                            style={{flex: 1, flexDirection: 'row', justifyContent: 'center', marginBottom: 20}}
                            onPress={() => {
                                this.setState({other: true})
                            }}>
                            <View style={{backgroundColor: '#29B6F6', borderRadius: 50}}>
                                <Text style={{color: '#FFFFFF', width: 100,  textAlign: 'center', padding: 10}}>More</Text>
                            </View>
                        </TouchableOpacity>) : this.steps(3)}
                    </View>
                )
            break;
            case 3:
                return (
                    <View>
                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                            <Text style={styles.label}>Diagnosing Doctor</Text>
                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.doctorID) ? this.state.rowData.doctorName : '-'}</Text></View>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <View style={[styles.rows, {flex:1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                <Text style={styles.label}>Date</Text>
                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.date) ? moment(this.state.rowData.date).format('MMMM DD, YYYY'): '-'}</Text></View>
                            </View>
                            <View style={[styles.rows, {flex:1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                <Text style={styles.label}>Time</Text>
                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.date) ? moment(this.state.rowData.date+' '+this.state.rowData.timeStart).format('hh:mm A') : '-'}</Text></View>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <View style={[styles.rows, {flex:1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                <Text style={styles.label}>Services</Text>
                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.services) ? this.state.rowData.services : '-'}</Text></View>
                            </View>
                            <View style={[styles.rows, {flex:1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                <Text style={styles.label}>Type</Text>
                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.type) ? this.state.rowData.type : '-'}</Text></View>
                            </View>
                            <View style={[styles.rows, {flex:1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                <Text style={styles.label}>Code</Text>
                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.code) ? this.state.rowData.code : '-'}</Text></View>
                            </View>
                        </View>
                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                            <Text style={styles.label}>Payment Mode</Text>
                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.pay) ? (this.state.rowData.pay=='hmo') ? 'HMO' :_.upperFirst(this.state.rowData.pay) : '-'}</Text></View>
                        </View>
                    </View>
                )
            break;
        }
    }
    openModal(title, text) {
        Alert.alert(
            title, (text) ? text : '-',
            [
                {text: 'CLOSE'},
            ]
        )
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
    person: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        paddingLeft: 16,
        paddingRight: 16,
    },
    personInformation: {
        flex: 1,
        // flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
        marginBottom: 20,
        marginTop: 0,
    },
    personDetails: {
        flex: 1,
        alignItems: 'stretch',
        flexDirection: 'column',
        marginLeft: 10,
    },
    personName: {
        fontSize: 34,
        color: '#FFFFFF',
    },
    personEmail: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    rows: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    label: {
        color: '#757575',
        paddingRight: 5,
        textAlignVertical: 'center',
        // textDecorationLine: 'underline'
    },
    textWrapper: {
        backgroundColor: '#FFFFFF',
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 2,
    },
    text: {
        color: '#616161',
        fontSize: 20,
    },
    steps: {
        flex:1 ,
        alignItems: 'stretch',
        padding: 8,
    },
    stepsActive: {
        backgroundColor: '#FFFFFF'
    },
    stepsText: {
        color: '#757575',
        fontSize: 16,
        textAlign: 'center',
    },
    stepsTextActive: {
        color: '#424242',
        fontSize: 16,
        textAlign: 'center',
    },
})

var NavigationBarRouteMapper = (patientName, props, avatar) => ({

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
        return (
            <ToolbarAndroid
            actions={toolbarActions}
            onActionSelected={(position) => {
                if (toolbarActions[position].title === 'Delete')
                    Alert.alert(
                        'Delete Confirmation',
                        'Are you sure you want to delete?',
                        [
                            {text: 'CANCEL'},
                            {text: 'OK', onPress: () => {
                                db.transaction((tx) => {
                                    tx.executeSql("UPDATE diagnosis SET deleted_at = ?, updated_at = ? where id = ?", [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'), props.diagnosisID], (tx, rs) => {
                                        console.log("deleted: " + rs.rowsAffected);
                                    }, (tx, err) => {
                                        console.log('DELETE error: ' + err.message);
                                    });
                                }, (err) => {
                                    ToastAndroid.show("Error occured while deleting!", 3000)
                                }, () => {
                                    ToastAndroid.show("Successfully deleted!", 3000)
                                    navigator.parentNavigator.replacePreviousAndPop({
                                        id: 'HPEDPage',
                                        passProps: {
                                            patientID: props.patientID,
                                            patientAvatar: this.props.patientAvatar,
                                            patientName: props.patientName
                                        },
                                    })
                                })
                            }},
                        ]
                    )
            }}>
                <Text style={{color: '#FFFFFF', margin: 10, marginRight: 16, backgroundColor: '#FFFFFF'}}>
                    <Icon name={"more-vert"} size={30} color={'#FFFFFF'} />
                </Text>
            </ToolbarAndroid>
        )
    },
    Title(route, navigator, index, nextState) {
        return (
            <TouchableOpacity style={[Styles.title, {marginLeft: 50}]}>
                <Text style={Styles.titleText}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
})
var toolbarActions = [
  {title: 'Delete'},
];

module.exports = HPEDInfo

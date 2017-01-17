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
            more: false,
            symptomsList: [
                'Swelling of Lymph Nodes in Neck/Armpit/Goin',
                'Pain in Lymph Nodes aft drinking alcohol',
                'Recurrent Fever',
                'Night Sweats',
                'Unexplained Weight Loss',
                'Loss of Appetite',
                'Itchy Skin',
                'Bone pain',
                'Broken bone from only minor injury',
                'Weakness or numbness of legs',
                'Frequent Infections',
                'Persistent Fatigue',
                'Nausea',
                'Extreme thirst',
                'Severe Constipation',
                'Loss of Appetite',
                'Mental Confusion',
                'High Blood Level of Calcium [9]',
                'Low Blood Counts (Anemia) [9]',
                'Kidneys Problems [9]',
                'Infections (Pneumonia) [9]',
                'Enlarged Tongue [12]',
            ],
        }
    }
    componentWillMount() {
        this.setState({refreshing: true})
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
                RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                    this.setState({avatar: (rs.toString().indexOf('dataimage/jpegbase64') !== -1) ? _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,') : 'data:image/jpeg;base64,'+rs.toString()})
                })
        })
    }
    componentDidMount() {
        setTimeout(() => {
            this.onRefresh()
        }, 1000)
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT `diagnosis`.`patientID`, `diagnosis`.`doctorID`, `diagnosis`.`appointmentID`, `diagnosis`.`preparedByID`, `diagnosis`.`chiefComplaint`, `diagnosis`.`historyIllness`, `diagnosis`.`bodyTemperature`, `diagnosis`.`bloodPressure`, `diagnosis`.`respirationRate`, `diagnosis`.`pulseRate`, `diagnosis`.`medicalHistory`, `diagnosis`.`initialDiagnosis`, `diagnosis`.`physicalExam`, `diagnosis`.`services`, `diagnosis`.`type`, `diagnosis`.`code`, `diagnosis`.`category`, `diagnosis`.`plan`, `diagnosis`.`pay`, `diagnosis`.`referringDoctor`, `diagnosis`.`labs`, `diagnosis`.`imaging`, `diagnosis`.`accident`, `diagnosis`.`painLevel`, `diagnosis`.`allergies`, `diagnosis`.`currentMedications`, `diagnosis`.`date`, `diagnosis`.`timeStart`, `diagnosis`.`timeEnd`, `diagnosis`.`certRemarks`, `diagnosis`.`certPurpose`, `symptoms`,('Dr. ' || `doctors`.`firstname` || ' ' || `doctors`.`middlename` || ' ' || `doctors`.`lastname`)  AS `doctorName` FROM diagnosis LEFT OUTER JOIN `doctors` on `diagnosis`.`doctorID` = `doctors`.`id` WHERE `diagnosis`.`id` = ? LIMIT 1", [this.props.diagnosisID], function(tx, rs) {
                db.data = rs.rows
            });
            tx.executeSql("SELECT `icds`.`code` as `code`, `icds`.`description` as `description` FROM `diagnosisIcds` LEFT OUTER JOIN `icds` ON `icds`.`id` = `diagnosisIcds`.`icdID` WHERE `diagnosisIcds`.`diagnosisID` = ? AND (`diagnosisIcds`.`deleted_at` in (null, 'NULL', '') OR `diagnosisIcds`.`deleted_at` is null) ORDER BY `icds`.`code` ASC", [this.props.diagnosisID], (tx, rs) => {
                db.icds = rs.rows;
            })
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            var icds = [];
            _.forEach(db.icds, (v, i) => {
                icds.push(db.icds.item(i).code+': '+db.icds.item(i).description);
            })
            this.setState({refreshing: false, rowData: db.data.item(0), icds: icds})
        })
    }
    render() {
        return (
            <Navigator
                renderScene={this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={[Styles.navigationBar,{marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper(this.props.patientID, this.props.patientName, this.props, this.state.avatar)} />
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
                                patientName: this.props.patientName
                            }
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
                    <View style={{flexDirection: 'row', backgroundColor: '#EEE', paddingRight:100}}>
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
                    {/* <TouchableOpacity
                        style={[Styles.buttonFab, {backgroundColor: 'rgba(0,0,0,0.0)', bottom: 140, elevation: 0}]}
                        onPress={() => this.props.navigator.push({
                            id: 'AddFollowup',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName
                            }
                        })}>
                        <Icon name={'share'} color={'#616161'} size={25}/>
                        <Text style={{fontSize: 10}}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.buttonFab, {backgroundColor: 'rgba(0,0,0,0.0)', bottom: 70, elevation: 0}]}
                        onPress={() => this.props.navigator.push({
                            id: 'AddFollowup',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName
                            }
                        })}>
                        <Icon name={'playlist-add'} color={'#616161'} size={30}/>
                        <Text style={{fontSize: 10}}>Follow-Up</Text>
                    </TouchableOpacity> */}
                    {(this.state.more) ? (
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{position: 'absolute', bottom: 60, flex: 1, flexDirection: 'row', justifyContent: 'center'}}
                            onPress={() => {
                                this.setState({more: !this.state.more})
                            }}>
                            <View style={{flex: 1, height: (height - 190)}}>
                                <View style={{position: 'absolute', bottom: 0, flex: 2, flexDirection: 'row', justifyContent: 'center'}}>
                                    <View style={{flex: 1, flexGrow: 3, alignItems: 'flex-end'}}>
                                        <View style={{height: 60, justifyContent: 'center'}}>
                                            <Text style={{fontSize: 14, backgroundColor: '#EEE', padding: 5, paddingLeft: 16, paddingRight: 16, borderRadius: 100}}>Refer to Doctor</Text>
                                        </View>
                                        <View style={{height: 90, justifyContent: 'center'}}>
                                            <Text style={{fontSize: 14, backgroundColor: '#EEE', padding: 5, paddingLeft: 16, paddingRight: 16, borderRadius: 100}}>Add to Follow-Up</Text>
                                        </View>
                                    </View>
                                    <View style={{flex: 1, alignItems: 'center'}}>
                                        <TouchableOpacity
                                            style={styles.fabButton}
                                            onPress={() => {
                                                this.props.navigator.push({
                                                    id: 'DoctorSharePage',
                                                    passProps: {
                                                        diagnosisID: this.props.diagnosisID,
                                                        patientID: this.props.patientID,
                                                        patientAvatar: this.props.patientAvatar,
                                                        patientName: this.props.patientName
                                                    }
                                                })
                                                this.setState({more: false})
                                            }}>
                                            <Icon name={'share'} color={'#FFF'} size={34}/>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.fabButton}
                                            onPress={() => {
                                                this.props.navigator.push({
                                                    id: 'AddFollowup',
                                                    passProps: {
                                                        diagnosisID: this.props.diagnosisID,
                                                        patientID: this.props.patientID,
                                                        patientAvatar: this.props.patientAvatar,
                                                        patientName: this.props.patientName
                                                    }
                                                })
                                                this.setState({more: false})
                                            }}>
                                            <Icon name={'playlist-add'} color={'#FFF'} size={34}/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View/>
                    )}
                </View>
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 84, flex: 2, zIndex: 1}]}
                    onPress={() => {
                        this.props.navigator.push({
                            id: 'EditHPED',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName
                            }
                        })
                        this.setState({more: false})
                    }}>
                    <Icon name={'edit'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
                <View style={{position: 'absolute', bottom: 0, flex: 1, flexDirection: 'row', justifyContent: 'center',}}>
                    <TouchableNativeFeedback
                        onPress={() => {
                            this.props.navigator.push({
                            id: 'OrderItem',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName }
                            })
                            this.setState({more: false})
                        }}>
                        <View style={{zIndex: 1, backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#EC407A', borderStyle: 'solid', borderRightWidth: 1}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'schedule'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Labwork</Text>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback
                        onPress={() => {
                            this.props.navigator.push({
                                id: 'PrescriptionPage',
                                passProps: {
                                    diagnosisID: this.props.diagnosisID,
                                    patientID: this.props.patientID,
                                    patientAvatar: this.props.patientAvatar,
                                    patientName: this.props.patientName
                                }
                            })
                            this.setState({more: false})
                        }}>
                        <View style={{zIndex: 1, backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#EC407A', borderStyle: 'solid', borderRightWidth: 1}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'assignment'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Prescription</Text>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback
                        onPress={() => {
                            this.props.navigator.push({
                                id: 'ImagePage',
                                passProps: {
                                    diagnosisID: this.props.diagnosisID,
                                    patientID: this.props.patientID,
                                    patientAvatar: this.props.patientAvatar,
                                    patientName: this.props.patientName
                                }
                            })
                            this.setState({more: false})
                        }}>
                        <View style={{zIndex: 1, backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#EC407A', borderStyle: 'solid', borderRightWidth: 1}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'photo'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Imaging</Text>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback
                        onPress={() => {
                            this.setState({more: !this.state.more})
                        }}>
                        <View style={{zIndex: 1, backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center'}}><Icon name={(this.state.more) ? 'close' : 'more-horiz'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>{(this.state.more) ? 'Close' : 'More'}</Text>
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
                            <View style={styles.textWrapper}>
                                <Text style={styles.text}>{(this.state.rowData.chiefComplaint) ? this.state.rowData.chiefComplaint : '-'}</Text>
                                <View style={[styles.textWrapper, {marginTop: 0}]}>
                                    {(this.state.rowData.symptoms) ? _.map(_.transform(_.split(this.state.rowData.symptoms, ','), (res, n) => {
                                        res.push(this.state.symptomsList[_.toInteger(n)])
                                        return true
                                    }, []), (v, i) => {
                                        return (
                                            <View key={i} style={{flex: 1, flexDirection: 'row', marginTop: 3, marginBottom: 3}}>
                                                <Icon name={'check-box'} size={18} color={'#4CAF50'} style={{paddingRight: 5}}/>
                                                <Text style={{flex: 1, alignItems: 'stretch', color: '#212121', textAlignVertical: 'center'}}>{v}</Text>
                                            </View>
                                        )
                                    }) : (<View/>)}
                                </View>
                            </View>
                        </View>
                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                            <Text style={styles.label}>Pathologist Reports</Text>
                                {_.map(_.split(this.state.rowData.labs, '||'), (v, i) => {
                                    if (v) {
                                        var labs = _.split(_.split(v, '::')[1], '@@');
                                        if (labs[1] === 'yes') {
                                            var color = '#4CAF50';
                                            var status = 'thumb-up';
                                        } else if (labs[1] === 'no') {
                                            var color = '#F44336';
                                            var status = 'thumb-down';
                                        } else {
                                            var color = '#03A9F4';
                                            var status = 'thumbs-up-down';
                                        }
                                        return (
                                            <View key={i} style={{flex: 1, flexDirection: 'row', marginBottom: -10}}>
                                                <View style={[styles.rows, {flex: 1, alignItems: 'stretch'}]}>
                                                    <View style={styles.textWrapper}><Text style={[styles.text]}>{(labs[0]) ? labs[0] : '-'}</Text></View>
                                                </View>
                                                <View style={[styles.textWrapper, {marginLeft: 10, justifyContent: 'center'}]}>
                                                    <View style={{backgroundColor: color, borderRadius: 100, padding: 6}}>
                                                        <Icon name={status} size={12} color={'#FFF'}/>
                                                    </View>
                                                    {/* <Text style={[styles.text, {padding: 10, borderRadius: 100, backgroundColor: 'red'}]}>{status}</Text> */}
                                                </View>
                                            </View>
                                        )
                                    } else
                                        return (
                                            <View key={i} style={styles.textWrapper}><Text style={styles.text}>-</Text></View>
                                        )
                                })}
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
                    <View style={{backgroundColor: '#FFFFFF', marginTop: 10, marginBottom: 20}}>
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
        color: '#212121',
        fontSize: 17,
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
    fabButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E91E63',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        marginBottom: 15,
    }
})

var NavigationBarRouteMapper = (patientID, patientName, props, avatar) => ({

    LeftButton(route, navigator, index, nextState) {
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                    onPress={() => {
                        var data = _.last(_.dropRight(navigator.parentNavigator.getCurrentRoutes(0)), 1);
                        navigator.parentNavigator.replacePreviousAndPop({id: data.id, passProps: data.passProps})
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
                                    tx.executeSql("UPDATE diagnosis SET deleted_at = ?, updated_at = ? where id = ?", [moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), props.diagnosisID], (tx, rs) => {
                                        console.log("deleted: " + rs.rowsAffected);
                                    }, (tx, err) => {
                                        console.log('DELETE error: ' + err.message);
                                    });
                                }, (err) => {
                                    ToastAndroid.show("Error Occured!", 3000)
                                }, () => {
                                    navigator.parentNavigator.pop()
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
            <TouchableOpacity
                style={[Styles.title, {marginLeft: 50}]}
                onPress={() => {
                    navigator.parentNavigator.push({
                        id: 'PatientProfile',
                        passProps: { patientID: patientID},
                    })
                }}>
                <Text style={Styles.titleText}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
})
var toolbarActions = [
  {title: 'Delete'},
];

module.exports = HPEDInfo

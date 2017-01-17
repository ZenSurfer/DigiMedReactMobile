'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Navigator, InteractionManager, DrawerLayoutAndroid, StatusBar, TouchableOpacity, TouchableNativeFeedback, DatePickerAndroid, ScrollView, TextInput, Picker, TimePickerAndroid, Slider, Switch, ToastAndroid, Dimensions, Modal, Alert, ListView, RefreshControl, AsyncStorage} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'
import _ from 'lodash'
import moment from 'moment'
import ImagePicker from 'react-native-image-picker'
import Env from '../../env'
import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const _scrollView = {}
const {height, width} = Dimensions.get('window')
const EnvInstance = new Env()
const db = EnvInstance.db()
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

class EditHPED extends Component {
    constructor(props) {
        super(props)
        this.state = {
            patientID: '',
            doctorID: 0,
            appointmentID: '',
            preparedByID: '',
            chiefComplaint: '',
            historyIllness: '',
            bodyTemperature: '',
            bloodPressure: '',
            respirationRate: '',
            pulseRate: '',
            medicalHistory: '',
            initialDiagnosis: '',
            physicalExam: '',
            services: '',
            type: '',
            code: '',
            category: '',
            plan: '',
            pay: '',
            referringDoctor: '',
            labs: '',
            imaging: '',
            accident: false,
            painLevel: 0,
            allergies: '',
            currentMedications: '',
            date: moment().format('YYYY-MM-DD'),
            timeStart: moment().format('HH:mm:ss'),
            timeEnd: '',
            certRemarks: '',
            certPurpose: '',
            deleted_at: '',
            created_at: '',
            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),

            steps: {active: 1},
            other: false,
            systolic: '',
            diastolic: '',
            avatar: false,
            modalVisible: false,
            search: '',
            icds: {},
            icdList: {},
            icdSelect: {},
            refreshing: false,
            symptomsList: [
                'Swelling of Lymph Nodes in Neck/Armpit/Goin',
                'Pain in Lymph Nodes aft drinking alcohol',
                'Recurrent Fever',
                'Night Sweats',
                'Unexplained Weight Loss',
                'Loss of Weight',
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
            symptomsSelected: [],
        }
    }
    componentWillMount() {
        db.transaction((tx) => {
            db.data = []
            tx.executeSql("SELECT * FROM diagnosis WHERE id = ? LIMIT 1", [this.props.diagnosisID], (tx, rs) => {
                db.data = rs.rows.item(0);
            })
            tx.executeSql("SELECT `icds`.`id` as `id`, `icds`.`code` as `code` FROM `diagnosisIcds` LEFT OUTER JOIN `icds` ON `icds`.`id` = `diagnosisIcds`.`icdID` WHERE `diagnosisIcds`.`diagnosisID` = ? AND (`diagnosisIcds`.`deleted_at` in (null, 'NULL', '') OR `diagnosisIcds`.`deleted_at` is null) ORDER BY `icds`.`code` ASC", [this.props.diagnosisID], (tx, rs) => {
                db.icds = rs.rows;
            })
        }, (err) => {
            console.log('Error: ', err)
        }, () => {
            this.setState(_.omit(db.data, ['id','updated_at']))
            this.setState({accident: (this.state.accident > 0) ? true : false})
            this.setState({systolic: _.nth(_.split(this.state.bloodPressure, '/'), 0)})
            this.setState({diastolic: _.nth(_.split(this.state.bloodPressure, '/'), 1)})
            var obj = {};
            _.forEach(db.icds, (v, i) => {
                obj[db.icds.item(i).id] =  db.icds.item(i).code;
            })
            this.setState({icds: obj, symptomsSelected: (db.data.symptoms) ? _.transform(_.split(db.data.symptoms, ','), (res, n) => {
                res.push(_.toInteger(n))
                return true
            },[]) : []})
        })
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
        }
    }
    render() {
        return (
            <Navigator
                renderScene={this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar style={[Styles.navigationBar, {marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper(this.props.patientID, this.props.patientName, this.state.avatar)} />
                }
                />
        )
    }
    async datePicker(stateKey, options) {
        try {
            const {action, year, month, day} = await DatePickerAndroid.open(options);
            if (action !== DatePickerAndroid.dismissedAction) {
                var date = new Date(year, month, day);
                this.setState({date: date});
            }
        } catch ({code, message}) {
            console.warn(`Error in example '${stateKey}': `, message);
        }
    }
    async timePicker(stateKey, options) {
        try {
            const {action, hour, minute} = await TimePickerAndroid.open(options);
            if (action !== TimePickerAndroid.dismissedAction) {
                this.setState({timeStart: moment(this.state.date).hour(hour).minute(minute).format('YYYY-MM-DD HH:mm:ss') });
            }
        } catch ({code, message}) {
            console.warn('Cannot open time picker', message);
        }
    }
    renderScene(route, navigator) {
        return (
            <View style={[Styles.containerStyle, {backgroundColor: '#FFFFFF'}]}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Edit H.P.E.D.</Text>
                </View>
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {this.setState({modalVisible: false}) }}>
                    <View style={{flex: 1}}>
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
                                    onSubmitEditing={(event) => {this.setState({refreshing: true}); this.icdUpdate()}}
                                    />
                                <TouchableOpacity style={{padding: 15}}
                                    onPress={() => {
                                        this.setState({modalVisible: false, icdSelect: this.state.icds})
                                    }}>
                                    <Icon name={'close'} size={30} style={{color: '#FFF', textAlignVertical: 'center'}}/>
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection: 'row', paddingRight: 16}}>
                                <TouchableOpacity onPress={() => {
                                        this.setState({icdSelect: []})
                                    }}>
                                    <Icon name={'indeterminate-check-box'} size={20} color={'#FFF'}/>
                                </TouchableOpacity>
                                <Text style={{width: 97, paddingLeft: 4, color: '#FFF'}}>Code</Text>
                                <Text style={{flex:1, alignItems: 'stretch', color: '#FFF'}}>Description</Text>
                            </View>
                        </View>
                        <ListView
                            dataSource={ds.cloneWithRows(this.state.icdList)}
                            renderRow={(rowData, sectionID, rowID) => {
                                return (
                                    <TouchableOpacity
                                        key={rowID}
                                        activeOpacity={1}
                                        style={{flexDirection: 'row', padding: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: ((rowID%2) == 0) ? '#FAFAFA' : '#FFF'}}
                                        onPress={this.icdSelect.bind(this, rowData.id, rowData.code)}>
                                        <Icon name={(this.state.icdSelect[rowData.id]) ? 'check-box' : 'check-box-outline-blank'} size={20} color={(this.state.icdSelect[rowData.id]) ? '#4CAF50' : '#616161'}/>
                                        <Text style={{width: 100, paddingLeft: 4}}>{rowData.code}</Text>
                                        <Text style={{flex:1, alignItems: 'stretch'}}>{rowData.description}</Text>
                                    </TouchableOpacity>
                                )
                            }}
                            enableEmptySections={true}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.icdUpdate.bind(this)}
                                    />
                            }/>
                        <View style={{flexDirection: 'row'}}>
                            <TouchableOpacity
                                style={{flex: 1, alignItems: 'stretch'}}
                                onPress={() => {
                                    this.setState({modalVisible: false, icds: this.state.icdSelect})
                                }}>
                                <Text style={{textAlign: 'center', backgroundColor: '#4CAF50', color: '#FFF', padding: 14, paddingTop: 20, paddingBottom: 20}}>DONE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <View style={{flexDirection: 'row', backgroundColor: '#EEE', paddingRight:100}}>
                    <TouchableOpacity
                        activeOpacity={(this.state.steps.active == 1) ? 1 : 0.2}
                        style={[styles.steps, (this.state.steps.active == 1) ? styles.stepsActive : {}]}
                        onPress={() => this.setState({steps: {active: 1}})}>
                        <Text style={[styles.stepsText, (this.state.steps.active == 1) ? styles.stepsTextActive : {}]}>Diagnosis</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={(this.state.steps.active == 2) ? 1 : 0.2}
                        style={[styles.steps, (this.state.steps.active == 2) ? styles.stepsActive : {}]}
                        onPress={() => this.setState({steps: {active: 2}})}>
                        <Text style={[styles.stepsText, (this.state.steps.active == 2) ? styles.stepsTextActive : {}]}>Others</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex:1}}>
                    {this.steps(this.state.steps.active)}
                </View>
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 25}]}
                    onPress={() => (
                        Alert.alert(
                            'Delete Confirmation',
                            'Are you sure you want to delete?',
                            [
                                {text: 'CANCEL'},
                                {text: 'OK', onPress: () => {
                                    db.transaction((tx) => {
                                        tx.executeSql("UPDATE diagnosis SET deleted_at = ?, updated_at = ? where id = ?", [moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), this.props.diagnosisID], (tx, rs) => {
                                            console.log("deleted: " + rs.rowsAffected);
                                        }, (tx, err) => {
                                            console.log('DELETE error: ' + err.message);
                                        });
                                    }, (err) => {
                                        ToastAndroid.show("Error Occured!", 3000)
                                    }, () => {
                                        ToastAndroid.show("Successfully Deleted!", 3000)
                                        this.props.navigator.replacePreviousAndPop({
                                            id: 'HPEDPage',
                                            passProps: {
                                                patientID: this.props.patientID,
                                                patientAvatar: this.props.patientAvatar,
                                                patientName: this.props.patientName
                                            },
                                        })
                                    })
                                }},
                            ]
                        )
                    )}>
                    <Icon name={'delete'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[Styles.buttonFab, {backgroundColor: '#4CAF50'}]}
                    onPress={this.onSubmit.bind(this)}>
                    <Icon name={'save'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        )
    }
    icdUpdate() {
        db.transaction((tx) => {
            tx.executeSql("SELECT DISTINCT `id`, `code`, `description` FROM `icds` WHERE (`code` like '"+this.state.search+"%' OR `description` like '%"+this.state.search+"%') ORDER BY `code` ASC", [], (tx, rs) => {
                db.data = rs.rows
            })
        }, (err) => {
            ToastAndroid.show(err.message, 3000)
        }, () => {
            var icdList = []
            _.forEach(db.data, (v, i) => {
                icdList.push(db.data.item(i))
            })
            this.setState({icdList: icdList, refreshing: false})
        })
    }
    icdSelect(icdID, icdCode) {
        var obj = this.state.icdSelect; obj[icdID] = (_.isEmpty(obj[icdID])) ? icdCode : false;
        var myArray = []; myArray.push(obj);
        this.setState({icdSelect: myArray[0]})
    }
    steps(step) {
        switch (step) {
            case 1:
                return (
                    <ScrollView
                        keyboardShouldPersistTaps={true}>
                        <View style={{backgroundColor: '#FFFFFF', paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 90}}>
                            <Text style={styles.label} >Chief Complaint</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={[styles.textInput, {textAlignVertical: 'top', paddingTop: 10, paddingBottom: 20, height: Math.max(35, this.state.height)}]}
                                onContentSizeChange={(event) => {
                                    this.setState({height: event.nativeEvent.contentSize.height});
                                }}
                                autoCapitalize={'words'}
                                value={this.state.chiefComplaint}
                                placeholderTextColor={'#E0E0E0'}
                                multiline={true}
                                onChangeText={(text) => this.setState({chiefComplaint: text})} />
                            <View style={{flex: 1, margin: 4, marginBottom: 20, marginTop: -10}}>
                                {_.map(this.state.symptomsList, (v, i) => {
                                    if ((i%2) == 0)
                                        return (
                                            <View style={{flex: 1, flexDirection: 'row'}}>
                                                <TouchableOpacity
                                                    style={{flex: 1, flexDirection: 'row', paddingTop: 20, paddingRight: 5}}
                                                    activeOpacity={1}
                                                    onPress={() => {
                                                        if (contains.call(this.state.symptomsSelected, i)) {
                                                            var selectedValue = [] = _.without(this.state.symptomsSelected, i);
                                                            this.setState({symptomsSelected: selectedValue})
                                                        } else {
                                                            var symptomsSelected = [] = this.state.symptomsSelected;
                                                            symptomsSelected.push(i)
                                                            this.setState({symptomsSelected: symptomsSelected})
                                                        }
                                                    }}>
                                                    <View style={{paddingTop: 0, marginRight: 5}}>
                                                        <Icon size={18} style={{textAlignVertical: 'center'}} color={(contains.call(this.state.symptomsSelected, i)) ? '#4CAF50' : '#616161'} name={(_.size(_.without(this.state.symptomsSelected, i)) !== _.size(this.state.symptomsSelected)) ? 'check-box' : 'check-box-outline-blank'} />
                                                    </View>
                                                    <Text style={{flex: 1, alignItems: 'stretch', fontSize: 14}}>{v}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={{flex: 1, flexDirection: 'row', paddingTop: 20, paddingLeft: 5}}
                                                    activeOpacity={1}
                                                    onPress={() => {
                                                        if (contains.call(this.state.symptomsSelected, i+1)) {
                                                            var selectedValue = [] = _.without(this.state.symptomsSelected, i+1);
                                                            this.setState({symptomsSelected: selectedValue})
                                                        } else {
                                                            var symptomsSelected = [] = this.state.symptomsSelected;
                                                            symptomsSelected.push(i+1)
                                                            this.setState({symptomsSelected: symptomsSelected})
                                                        }
                                                    }}>
                                                    <View style={{paddingTop: 0, marginRight: 5}}>
                                                        <Icon size={18} style={{textAlignVertical: 'center'}} color={(contains.call(this.state.symptomsSelected, i+1)) ? '#4CAF50' : '#616161'} name={(_.size(_.without(this.state.symptomsSelected, i+1)) !== _.size(this.state.symptomsSelected)) ? 'check-box' : 'check-box-outline-blank'} />
                                                    </View>
                                                    <Text style={{flex: 1, alignItems: 'stretch', fontSize: 14}}>{this.state.symptomsList[i+1]}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    else
                                        return (<View/>)
                                })}
                            </View>
                            <Text style={styles.label} >Initial Diagnosis</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={[styles.textInput, {textAlignVertical: 'top', paddingTop: 10, paddingBottom: 20, height: Math.max(35, this.state.height)}]}
                                onContentSizeChange={(event) => {
                                    this.setState({height: event.nativeEvent.contentSize.height});
                                }}
                                autoCapitalize={'words'}
                                value={this.state.initialDiagnosis}
                                placeholderTextColor={'#E0E0E0'}
                                multiline={true}
                                onChangeText={(text) => this.setState({initialDiagnosis: text})} />
                            <Text style={styles.label} >Blood Pressure (Systolic / Diastolic)</Text>
                            <View style={{flexDirection: 'row'}}>
                                <TextInput
                                    placeholder={'Text Here...'}
                                    style={[styles.textInput, {flex: 1, alignItems: 'stretch'}]}
                                    keyboardType={'numeric'}
                                    value={this.state.systolic}
                                    placeholderTextColor={'#E0E0E0'}
                                    onChangeText={(text) => this.setState({systolic: text})} />
                                <Text style={{textAlignVertical: 'center', fontSize: 18, color: '#000', padding: 10, marginBottom: 10}}>/</Text>
                                <TextInput
                                    placeholder={'Text Here...'}
                                    style={[styles.textInput, {flex: 1, alignItems: 'stretch'}]}
                                    keyboardType={'numeric'}
                                    value={this.state.diastolic}
                                    placeholderTextColor={'#E0E0E0'}
                                    onChangeText={(text) => this.setState({diastolic: text})} />
                            </View>
                            <Text style={styles.label} >Body Temperature (Degree Celsius)</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                keyboardType={'numeric'}
                                value={this.state.bodyTemperature}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({bodyTemperature: text})} />
                            <Text style={styles.label} >Respiration Rate (Per Minute)</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                keyboardType={'numeric'}
                                value={this.state.respirationRate}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({respirationRate: text})} />
                            <Text style={styles.label} >Pulse Rate (Per Minute)</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                keyboardType={'numeric'}
                                value={this.state.pulseRate}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({pulseRate: text})} />
                        </View>
                    </ScrollView>
                )
            break;
            case 2:
                return (
                    <ScrollView
                        keyboardShouldPersistTaps={true}>
                        <View style={{backgroundColor: '#FFFFFF', paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: (this.state.other) ? 90 : 40}}>
                            <Text style={styles.label} >History of Present Illness</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={[styles.textInput, {textAlignVertical: 'top', paddingTop: 10, paddingBottom: 20, height: Math.max(35, this.state.height)}]}
                                onContentSizeChange={(event) => {
                                    this.setState({height: event.nativeEvent.contentSize.height});
                                }}
                                autoCapitalize={'words'}
                                value={this.state.historyIllness}
                                placeholderTextColor={'#E0E0E0'}
                                multiline={true}
                                onChangeText={(text) => this.setState({historyIllness: text})} />
                            <Text style={styles.label} >Pertinent Medical History</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={[styles.textInput, {textAlignVertical: 'top', paddingTop: 10, paddingBottom: 20, height: Math.max(35, this.state.height)}]}
                                onContentSizeChange={(event) => {
                                    this.setState({height: event.nativeEvent.contentSize.height});
                                }}
                                autoCapitalize={'words'}
                                value={this.state.medicalHistory}
                                placeholderTextColor={'#E0E0E0'}
                                multiline={true}
                                onChangeText={(text) => this.setState({medicalHistory: text})} />
                            <View style={{flexDirection: 'row'}}>
                                <Switch
                                    onValueChange={(value) => {
                                        this.setState({accident: value})
                                        if (value == false)
                                            this.setState({painLevel: 0})
                                    }}
                                    style={{marginBottom: 10, marginRight: 10}}
                                    value={this.state.accident} />
                                <Text style={[styles.textInput, styles.switch]}>Accident? </Text>
                                <Text style={[styles.textInput, styles.switch, {paddingLeft: 6, color: '#212121'}]}>{this.state.accident ? 'Yes' : 'No'}</Text>
                            </View>
                            {this.state.accident ? (
                                <View>
                                    <Text style={styles.label} >Pain Level {this.state.painLevel}</Text>
                                    <Slider
                                        minimumValue={0}
                                        maximumValue={10}
                                        step={1}
                                        value={this.state.painLevel}
                                        style={[styles.slider]}
                                        onValueChange={(value) => this.setState({painLevel: value})}
                                        />
                                </View>) : (<View/>)}
                            <Text style={styles.label} >Physical Exam </Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={[styles.textInput, {textAlignVertical: 'top', paddingTop: 10, paddingBottom: 20, height: Math.max(35, this.state.height)}]}
                                onContentSizeChange={(event) => {
                                    this.setState({height: event.nativeEvent.contentSize.height});
                                }}
                                autoCapitalize={'words'}
                                value={this.state.physicalExam}
                                placeholderTextColor={'#E0E0E0'}
                                multiline={true}
                                onChangeText={(text) => this.setState({physicalExam: text})} />
                            <Text style={styles.label} >Allergies</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={[styles.textInput]}
                                autoCapitalize={'words'}
                                value={this.state.allergies}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({allergies: text})} />
                            <Text style={styles.label} >Current Medications</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={[styles.textInput, {textAlignVertical: 'top', paddingTop: 10, paddingBottom: 20, height: Math.max(35, this.state.height)}]}
                                onContentSizeChange={(event) => {
                                    this.setState({height: event.nativeEvent.contentSize.height});
                                }}
                                autoCapitalize={'words'}
                                value={this.state.currentMedications}
                                placeholderTextColor={'#E0E0E0'}
                                multiline={true}
                                onChangeText={(text) => this.setState({currentMedications: text})} />
                            <Text style={styles.label} >Plan</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={[styles.textInput, {textAlignVertical: 'top', paddingTop: 10, paddingBottom: 20, height: Math.max(35, this.state.height)}]}
                                onContentSizeChange={(event) => {
                                    this.setState({height: event.nativeEvent.contentSize.height});
                                }}
                                autoCapitalize={'words'}
                                value={this.state.plan}
                                placeholderTextColor={'#E0E0E0'}
                                multiline={true}
                                onChangeText={(text) => this.setState({plan: text})} />
                            <View style={[styles.rows, {flexDirection: 'row', marginRight: 4}]}>
                                <Text style={[styles.label, {flex:1 , alignItems: 'stretch'}]}>ICD's</Text>
                                <TouchableOpacity style={{flexDirection: 'row', backgroundColor: '#4CAF50', padding: 5, borderRadius: 20}}
                                    onPress={() => {
                                        this.setState({icdSelect: this.state.icds, icdList: {}, modalVisible: true})
                                    }}>
                                    <Icon name={'add'} size={20} color={'#FFF'}/>
                                </TouchableOpacity>
                            </View>
                            <View style={{marginLeft: 4, marginRight: 4, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#757575'}}>
                                <Text style={[styles.textInput, {paddingBottom: 6, color: '#212121'}]}>{_.isNull(this.state.icds) ? '' : _.join(_.compact(_.values(this.state.icds)), ', ')}</Text>
                            </View>
                            {(!this.state.other) ? (<TouchableOpacity
                                style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}
                                onPress={() => {
                                    this.setState({other: true})
                                }}>
                                <View style={{backgroundColor: '#29B6F6', borderRadius: 50}}>
                                    <Text style={{color: '#FFFFFF', width: 100,  textAlign: 'center', padding: 10}}>More</Text>
                                </View>
                            </TouchableOpacity>) : this.steps(3)}
                        </View>
                    </ScrollView>
                )
            break;
            case 3:
                return (
                    <View>
                        <Text style={styles.label} >Services</Text>
                        <View style={styles.select}>
                            <Picker
                                mode={'dialog'}
                                selectedValue={this.state.services}
                                onValueChange={(value) => this.setState({services: value})} >
                                    <Picker.Item value={'Adult'} label={'Adult'}/>
                                    <Picker.Item value={'Hand'} label={'Hand'}/>
                                    <Picker.Item value={'Pediatrics'} label={'Pediatrics'}/>
                                    <Picker.Item value={'Spine'} label={'Spine'}/>
                                    <Picker.Item value={'Trauma'} label={'Trauma'}/>
                                    <Picker.Item value={'Sports Injury'} label={'Sports Injury'}/>
                            </Picker>
                        </View>
                        <Text style={styles.label} >Type</Text>
                        <View style={styles.select}>
                            <Picker
                                mode={'dialog'}
                                selectedValue={this.state.type}
                                onValueChange={(value) => this.setState({type: value})} >
                                    <Picker.Item value={'Consult'} label={'Consult'}/>
                                    <Picker.Item value={'Procedure'} label={'Procedure'}/>
                                    <Picker.Item value={'Laboratory'} label={'Laboratory'}/>
                                    <Picker.Item value={'X-Ray'} label={'X-Ray'}/>
                                    <Picker.Item value={'Home_Care'} label={'Home Care'}/>
                                    <Picker.Item value={'IFT'} label={'IFT'}/>
                                    <Picker.Item value={'EQR'} label={'EQR'}/>
                                    <Picker.Item value={'Pharma'} label={'Pharma'}/>
                            </Picker>
                        </View>
                        <Text style={styles.label} >Code</Text>
                        <View style={styles.select}>
                            <Picker
                                mode={'dialog'}
                                selectedValue={this.state.code}
                                onValueChange={(value) => this.setState({code: value})} >
                                    <Picker.Item value={'Medical'} label={'MED'}/>
                                    <Picker.Item value={'Pulmo-Resp'} label={'RESP'}/>
                                    <Picker.Item value={'Cardio'} label={'CARDIO'}/>
                                    <Picker.Item value={'Trauma'} label={'TRM'}/>
                                    <Picker.Item value={'Mus-Kel'} label={'MS'}/>
                                    <Picker.Item value={'Neuro'} label={'NEURO'}/>
                                    <Picker.Item value={'Urology'} label={'URO'}/>
                                    <Picker.Item value={'Genito Urinary Track'} label={'GUT'}/>
                                    <Picker.Item value={'Gastro Intestinal Track'} label={'GIT'}/>
                                    <Picker.Item value={'EENT'} label={'EENT'}/>
                                    <Picker.Item value={'Optha'} label={'OPTHA'}/>
                                    <Picker.Item value={'Ortho'} label={'ORTHO'}/>
                                    <Picker.Item value={'Obgyn'} label={'OBGYN'}/>
                                    <Picker.Item value={'Pedia'} label={'PEDIA'}/>
                                    <Picker.Item value={'Elec. Surg.'} label={'ELC. SURG.'}/>
                                    <Picker.Item value={'Derma'} label={'DERM'}/>
                                    <Picker.Item value={'Psych'} label={'PSYCH'}/>
                                    <Picker.Item value={'Physical Exam'} label={'PE'}/>
                                    <Picker.Item value={'Injection'} label={'INJ'}/>
                                    <Picker.Item value={'Endo'} label={'ENDO'}/>
                            </Picker>
                        </View>
                        <Text style={styles.label} >Payment Mode</Text>
                        <View style={styles.select}>
                            <Picker
                                mode={'dialog'}
                                selectedValue={this.state.pay}
                                onValueChange={(value) => this.setState({pay: value})} >
                                    <Picker.Item value={'charity'} label={'Charity'}/>
                                    <Picker.Item value={'company'} label={'Company'}/>
                                    <Picker.Item value={'hmo'} label={'HMO'}/>
                                    <Picker.Item value={'insurance'} label={'Insurance'}/>
                                    <Picker.Item value={'personal'} label={'Personal'}/>
                            </Picker>
                        </View>
                    </View>
                )
            break;
        }
    }
    onSubmit() {
        var icds = _.transform(this.state.icds, function(rs, v, i) {
            if (v) rs[i] = v
        }, {});
        var lymphoma = [0,1,2,3,4,5,6];
        var lymphomaCount = 0;
        var myeloma = [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
        var myelomaCount = 0;
        _.map(this.state.symptomsSelected, (v, i) => {
            if (contains.call(lymphoma, v))
                lymphomaCount++;
            if (contains.call(myeloma, v))
                myelomaCount++;
        })
        db.transaction((tx) => {
            var values = {
                patientID: this.state.patientID,
                doctorID: this.state.doctorID,
                appointmentID: this.state.appointmentID,
                preparedByID: this.state.preparedByID,
                chiefComplaint: this.state.chiefComplaint,
                historyIllness: this.state.historyIllness,
                bodyTemperature: this.state.bodyTemperature,
                bloodPressure: (this.state.systolic ? this.state.systolic : '-')+' / '+(this.state.diastolic ? this.state.diastolic : '-'),
                respirationRate: this.state.respirationRate,
                pulseRate: this.state.pulseRate,
                medicalHistory: this.state.medicalHistory,
                initialDiagnosis: this.state.initialDiagnosis,
                physicalExam: this.state.physicalExam,
                services: this.state.services,
                type: this.state.type,
                code: this.state.code,
                category: this.state.category,
                plan: this.state.plan,
                pay: this.state.pay,
                referringDoctor: this.state.referringDoctor,
                labs: this.state.labs,
                imaging: this.state.imaging,
                accident: (this.state.accident) ? 1 : 0,
                painLevel: this.state.painLevel,
                allergies: this.state.allergies,
                currentMedications: this.state.currentMedications,
                date: this.state.date,
                timeStart: this.state.timeStart,
                timeEnd: this.state.timeEnd,
                certRemarks: this.state.certRemarks,
                certPurpose: this.state.certPurpose,
                symptoms: _.join(this.state.symptomsSelected, ','),
                deleted_at: this.state.deleted_at,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                diagnosisID: this.props.diagnosisID
            }
            tx.executeSql("UPDATE `diagnosis` SET `patientID`=?, `doctorID`=?, `appointmentID`=?, `preparedByID`=?, `chiefComplaint`=?, `historyIllness`=?, `bodyTemperature`=?, `bloodPressure`=?, `respirationRate`=?, `pulseRate`=?, `medicalHistory`=?, `initialDiagnosis`=?, `physicalExam`=?, `services`=?, `type`=?, `code`=?, `category`=?, `plan`=?, `pay`=?, `referringDoctor`=?, `labs`=?, `imaging`=?, `accident`=?, `painLevel`=?, `allergies`=?, `currentMedications`=?, `date`=?, `timeStart`=?, `timeEnd`=?, `certRemarks`=?, `certPurpose`=?, `symptoms`=?,`deleted_at`=?, `created_at`=?, `updated_at`=? WHERE `diagnosis`.`id`=?", _.values(values), (tx, rs) => {
                console.log("created: " + rs.rowsAffected);
            })
            tx.executeSql("DELETE FROM `diagnosisIcds` WHERE `diagnosisID`=? ", [this.props.diagnosisID], (tx, rs) => {
                _.forEach(icds, (v, i) => {
                    tx.executeSql("INSERT INTO `diagnosisIcds` (`diagnosisID`, `icdID`, `deleted_at`, `created_at`, `updated_at`) VALUES ("+this.props.diagnosisID+", "+i+", null, '"+moment().format('YYYY-MM-DD HH:mm:ss')+"', '"+moment().format('YYYY-MM-DD HH:mm:ss')+"')", [], (tx, rs) => {
                        console.log("created: " + rs.rowsAffected);
                    }, (err) => {
                        console.log(':'+ err.message)
                    })
                })
            })
        }, (err) => {
            this.setState({refreshing: false})
        }, () => {
            ToastAndroid.show("Successfully Updated!", 3000)
            this.props.navigator.replacePreviousAndPop({
                id: 'HPEDInfo',
                passProps: {
                    diagnosisID: this.props.diagnosisID,
                    patientID: this.props.patientID,
                    patientAvatar: this.props.patientAvatar,
                    patientName: this.props.patientName
                },
            })
            this.analyze(['Hodgkin\'s Lymphoma', "Multiple Myeloma"], [lymphomaCount, myelomaCount], [lymphoma, myeloma], {
                order: {
                    id: 'OrderItem',
                    passProps: {
                        diagnosisID: this.props.diagnosisID,
                        patientID: this.props.patientID,
                        patientAvatar: this.props.patientAvatar,
                        patientName: this.props.patientName,
                        labItemSelect: '152,4,8',
                    }
                },
                refer: {
                    id: 'DoctorSharePage',
                    passProps: {
                        diagnosisID: this.props.diagnosisID,
                        patientID: this.props.patientID,
                        patientAvatar: this.props.patientAvatar,
                        patientName: this.props.patientName
                    }
                }
            })
        })
    }
    analyze(cancer, count, symptoms, props) {
        var notify = false; var message = []; var status = {}; var notifyStatus = {active: false, title: ''};
        _.forEach(cancer, (v, i) => {
            if (count[i]) {
                notify = true;
                var percentage = count[i]/_.size(symptoms[i]) * 100;
                if (contains.call(this.state.symptomsSelected, 0) && cancer[i] == 'Hodgkin\'s Lymphoma') {
                    status = props.refer;
                    notifyStatus.active = true;
                    notifyStatus.title = 'REFER TO DOCTOR';
                    var potential = 'Very High Level';
                } else if (percentage <= 20) {
                    var potential = 'Low Level';
                } else if (percentage <= 50) {
                    status = props.order;
                    notifyStatus.active = true;
                    notifyStatus.title = 'REQUEST BLOOD TEST';
                    var potential = 'Medium Level';
                } else if (percentage <= 90) {
                    status = props.order;
                    notifyStatus.active = true;
                    notifyStatus.title = 'REQUEST BLOOD TEST';
                    var potential = 'High Level';
                } else {
                    status = props.refer;
                    notifyStatus.active = true;
                    notifyStatus.title = 'REFER TO DOCTOR';
                    var potential = 'Very High Level';
                }
                message.push('Consider as '+cancer[i]+'! \nPotential: '+potential)
            }
        })
        if (notify)
            return  (
                Alert.alert(
                    'Attention',
                    _.join(message, '\n\n'),
                    [
                        {text: (notifyStatus.active) ? notifyStatus.title : '', onPress: () => {
                            this.props.navigator.push(status)
                        }},
                        {},
                        {text: 'OK', onPress: () => console.log('OK Pressed!')},
                    ]
                )
            )
    }
}

var contains = function(needle) {
    var findNaN = needle !== needle;
    var indexOf;
    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                var item = this[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }
    return indexOf.call(this, needle) > -1;
}

const styles = StyleSheet.create({
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
        backgroundColor: '#FFF',
        paddingTop: 16,
        paddingLeft: 12,
        paddingRight: 12,
    },
    heading: {
        fontSize: 34,
        color: '#424242',
        marginBottom: 10,
        marginLeft: 4,
        marginRight: 4,
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
        paddingTop: 5   ,
        marginBottom: 5,
    },
    slider: {
        paddingTop: 5,
        marginBottom: 5,
        marginLeft: -10,
        marginRight: -10,
    },
    switch: {
        height: 25,
        textAlignVertical: 'center',
        color: '#9E9E9E'
    },
    steps: {
        flex:1,
        alignItems: 'stretch',
    },
    stepsActive: {
        backgroundColor: '#FFFFFF',
    },
    stepsText: {
        color:'#757575',
        padding: 8,
        fontSize: 16,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    stepsTextActive: {
        color: '#424242',
    }
})

var NavigationBarRouteMapper = (patientID, patientName, avatar) => ({
    LeftButton(route, navigator, index, navState) {
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
    RightButton(route, navigator, index, navState) {
        return null
    },
    Title(route, navigator, index, navState) {
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

module.exports = EditHPED

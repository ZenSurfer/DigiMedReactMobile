'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Navigator, InteractionManager, StatusBar, TouchableOpacity, TouchableNativeFeedback, ScrollView, TextInput, ToastAndroid, Dimensions, RefreshControl, ListView, Picker} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'

import _ from 'lodash'
import moment from 'moment'
import ImagePicker from 'react-native-image-picker'
import Env from '../../env'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const {height, width} = Dimensions.get('window')
const EnvInstance = new Env()
const db = EnvInstance.db()
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

class AddPrescription extends Component {
    constructor(props) {
        super(props)
        this.state = {
            doctorID: EnvInstance.getDoctor().id,
            prescription: [{
                generic: '',
                brand: '',
                form: '',
                dosage: '',
                frequency: '',
                notes: '',
            }],
            medicine: [],
            avatar: false,
            refreshing: false,
        }
    }
    componentWillMount() {
        db.transaction((tx) => {
            tx.executeSql("SELECT genericMedicine.name as generic, medicines.properName as brand, medicineDosages.form, medicineDosages.dosage, medicineDosages.frequency FROM medicineDosages OUTER LEFT JOIN medicines ON medicines.id = medicineDosages.medicineID OUTER LEFT JOIN genericMedicine ON genericMedicine.id = medicines.genericMedicineID ORDER BY generic ASC, brand ASC", [], (tx, rs) => {
                db.data = rs.rows
            })
        }, (err) => {
            alert(err.message)
        }, () => {
            var medicine = [];
            medicine.push({
                label: 'Presciption Template',
                generic: '',
                brand: '',
                form: '',
                dosage: '',
                frequency: '',
            })
            _.forEach(db.data, (v, i) => {
                var obj = db.data.item(i);
                obj['label'] = db.data.item(i).generic+' ('+db.data.item(i).brand+') '+db.data.item(i).form+' / '+db.data.item(i).dosage+' / '+db.data.item(i).frequency;
                medicine.push(obj);
            })
            this.setState({medicine: medicine})
        })
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
                RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                    this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')})
                })
        })
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
    renderScene(route, navigator) {
        return (
            <View style={[Styles.containerStyle]}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Add Prescription</Text>
                </View>
                <ScrollView
                    keyboardShouldPersistTaps={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            />
                    }>
                    <View style={{flex: 1, justifyContent: 'center',}}>
                        {_.map(this.state.prescription, (v, i) => {
                            return (
                                <View key={i} style={{margin: 5}}>
                                    <View style={{margin: 16, padding: 14, paddingTop: 20, paddingBottom: 20, backgroundColor: '#FFF'}}>
                                        <View style={styles.select}>
                                            <Picker
                                                selectedValue={0}
                                                onValueChange={(index) => {
                                                    this.onSetState(this.state.medicine[index].generic, i, 'generic')
                                                    this.onSetState(this.state.medicine[index].brand, i, 'brand')
                                                    this.onSetState(this.state.medicine[index].form, i, 'form')
                                                    this.onSetState(this.state.medicine[index].dosage, i, 'dosage')
                                                    this.onSetState(this.state.medicine[index].frequency, i, 'frequency')
                                                }}>
                                                {_.map(this.state.medicine, (v, i) => {
                                                    return (
                                                        <Picker.Item key={i} label={v.label} value={i} />
                                                    )
                                                })}
                                            </Picker>
                                        </View>
                                        <View style={{flexDirection: 'row', marginTop: 10}}>
                                            <View style={{flex: 1, alignItems: 'stretch'}}>
                                                <Text style={styles.label} >Generic Name</Text>
                                                <TextInput
                                                    placeholder={'Text Here...'}
                                                    style={[styles.textInput]}
                                                    autoCapitalize={'words'}
                                                    value={this.state.prescription[i].generic}
                                                    placeholderTextColor={'#E0E0E0'}
                                                    onChangeText={(text) => this.onSetState(text, i , 'generic')} />
                                            </View>
                                            <View style={{flex: 1, alignItems: 'stretch'}}>
                                                <Text style={styles.label} >Brand Name</Text>
                                                <TextInput
                                                    placeholder={'Text Here...'}
                                                    style={[styles.textInput]}
                                                    autoCapitalize={'words'}
                                                    value={this.state.prescription[i].brand}
                                                    placeholderTextColor={'#E0E0E0'}
                                                    onChangeText={(text) => this.onSetState(text, i , 'brand')} />
                                            </View>
                                        </View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={{flex: 1, alignItems: 'stretch'}}>
                                                <Text style={styles.label} >Form</Text>
                                                <TextInput
                                                    placeholder={'Text Here...'}
                                                    style={[styles.textInput]}
                                                    autoCapitalize={'words'}
                                                    value={this.state.prescription[i].form}
                                                    placeholderTextColor={'#E0E0E0'}
                                                    onChangeText={(text) => this.onSetState(text, i , 'form')} />
                                            </View>
                                            <View style={{flex: 1, alignItems: 'stretch'}}>
                                                <Text style={styles.label} >Dosage</Text>
                                                <TextInput
                                                    placeholder={'Text Here...'}
                                                    style={[styles.textInput]}
                                                    autoCapitalize={'words'}
                                                    value={this.state.prescription[i].dosage}
                                                    placeholderTextColor={'#E0E0E0'}
                                                    onChangeText={(text) => this.onSetState(text, i , 'dosage')} />
                                            </View>
                                        </View>
                                        <Text style={styles.label} >Frequency</Text>
                                        <TextInput
                                            placeholder={'Text Here...'}
                                            style={[styles.textInput]}
                                            autoCapitalize={'words'}
                                            value={this.state.prescription[i].frequency}
                                            placeholderTextColor={'#E0E0E0'}
                                            onChangeText={(text) => this.onSetState(text, i , 'frequency')} />
                                        <Text style={styles.label} >Note</Text>
                                        <TextInput
                                            placeholder={'Text Here...'}
                                            style={[styles.textInput, {textAlignVertical: 'top'}]}
                                            autoCapitalize={'words'}
                                            value={this.state.prescription[i].notes}
                                            placeholderTextColor={'#E0E0E0'}
                                            multiline={true}
                                            numberOfLines={2}
                                            onChangeText={(text) => this.onSetState(text, i, 'notes')} />
                                    </View>
                                    <TouchableOpacity
                                        style={{position: 'absolute', top: 0, right: 0, padding: 8, borderRadius: 50, backgroundColor: '#E91E63'}}
                                        onPress={() => {
                                            var prescriptions = this.state.prescription
                                            this.setState({refreshing: true, prescription: []})
                                            _.pullAt(prescriptions, [i])
                                            this.setState({refreshing: false, prescription: prescriptions})
                                        }}>
                                        <Icon name={'close'} size={18} color={'#FFF'}/>
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <TouchableOpacity
                                style={{width: 40, height: 40, borderRadius: 30, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 25, marginTop: (_.size(this.state.prescription) > 0) ? 0 : 25}}
                                onPress={() => {
                                        var prescription = this.state.prescription
                                        prescription.push({ generic: '', brand: '', form: '', dosage: '', frequency: '', notes: ''});
                                        this.setState(prescription)
                                }}>
                                <Icon name={'add'}  size={15}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
                <TouchableOpacity
                    style={[Styles.buttonFab, {backgroundColor: '#4CAF50'}]}
                    onPress={this.onSubmit.bind(this)}>
                    <Icon name={'save'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        )
    }
    onSetState(v, i, r) {
        var prescription = this.state.prescription[i]
        prescription[r] = v
        var prescriptions = this.state.prescription
        prescriptions[i] = prescription
        this.setState(prescriptions)
    }
    onSubmit() {
        var  passed = true
        _.forEach(this.state.prescription, (v, i) => {
            if (v.generic =='' && passed) {
                passed = false;
                ToastAndroid.show("Prescription "+(i+1)+" generic name cannot be empty!", 2000);
            }
        })
        if (passed) {
            db.transaction((tx) => {
                var values = {
                    patientID: this.props.patientID,
                    doctorID: this.state.doctorID,
                    frequency: '',
                    form: '',
                    dateIssued: moment().format('YYYY-MM-DD'),
                    generic: '',
                    notes: '',
                    brand: '',
                    dosage: '',
                    pharmacyDrugData: '',
                    deleted_at: '',
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                };
                _.forEach(this.state.prescription, (v, i) => {
                    values['generic'] = values['generic']+((i>0) ? '||' : '')+v.generic;
                    values['brand'] = values['brand']+((i>0) ? '||' : '')+v.brand;
                    values['form'] = values['form']+((i>0) ? '||' : '')+v.form;
                    values['dosage'] = values['dosage']+((i>0) ? '||' : '')+v.dosage;
                    values['frequency'] = values['frequency']+((i>0) ? '||' : '')+v.frequency;
                    values['notes'] = values['notes']+((i>0) ? '||' : '')+v.notes;
                })
                tx.executeSql("INSERT INTO prescriptions (`patientID`, `doctorID`, `frequency`, `form`, `dateIssued`, `genericName`, `notes`, `brandName`, `dosage`, `pharmacyDrugData`, `deleted_at`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", _.values(values), (tx, rs) => {
                    console.log("created: " + rs.rowsAffected);
                })
            }, (err) => {
                alert(err.message)
            }, () => {
                this.props.navigator.replacePreviousAndPop({
                    id: 'PrescriptionPage',
                    passProps: {
                        diagnosisID: this.props.diagnosisID,
                        patientID: this.props.patientID,
                        patientAvatar: this.props.patientAvatar,
                        patientName: this.props.patientName
                    }
                })
                ToastAndroid.show("Prescription successfully created!", 3000)
            })
        }
    }
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
    rows: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
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
                    onPress={() => navigator.parentNavigator.pop()}>
                    <Text style={{color: 'white', margin: 10, marginTop: 15}}>
                        <Icon name="keyboard-arrow-left" size={30} color="#FFF" />
                    </Text>
                </TouchableOpacity>
                {(avatar) ? (<Image source={{uri: avatar}} style={styles.avatarImage}/>) : (<Icon name={'account-circle'} color={'#FFFFFF'} size={65}  style={styles.avatarIcon}/>)}
            </View>
        )
    },
    RightButton(route, navigator, index, navState) {
        return null
    },
    Title(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={[Styles.title, {marginLeft: 50}]}>
                <Text style={Styles.titleText}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = AddPrescription

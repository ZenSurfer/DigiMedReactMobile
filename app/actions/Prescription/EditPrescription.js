'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Navigator, InteractionManager, StatusBar, TouchableOpacity, TouchableNativeFeedback, ScrollView, TextInput, ToastAndroid, Dimensions, RefreshControl, ListView, Alert, Modal, AsyncStorage} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'
import Picker from 'react-native-picker-android'
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

class EditPrescription extends Component {
    constructor(props) {
        super(props)
        this.state = {
            doctorID: 0,
            prescription: {},
            avatar: false,
            modalVisible: false,
            selectedValue: {
                index: '',
                modal: '',
                name: '',
            },
            firstDigit: 0,
            secondDigit: 0,
            thirdDigit: 0,
            fourthDigit: 0,
            numbers: [0,1,2,3,4,5,6,7,8,9],
            massValue: 'mg',
            massAccro: ['g','kg','mg','mcg','mL'],
            masses: {'g': 'Gram', 'kg': 'Kilogram', 'mg': 'Milligram', 'mcg': 'Microgram', 'mL': 'Milliliter'},
            frequencyDigit: 1,
            frequencyAmount: 'times(s)',
            frequencyAmounts: ['time(s)', 'tablet(s)', 'tablespoon(s)', 'teaspoon(s)', 'drop(s)'],
            frequencyTime: 'a day',
            frequencyTimes: ['a day', 'a week', 'an hour', 'every 2 hours', 'every 3 hours', 'every 4 hours', 'every 6 hours', 'every morning', 'every evening', 'before meals', 'after meals', 'every other day', ],
        }
    }
    componentWillMount() {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM prescriptions WHERE id=? LIMIT 1", [this.props.prescriptionID], (tx, rs) => {
                db.data = rs.rows
            })
        }, (err) => {
            console.log(err.message)
        }, () => {
            var genericName = _.split(db.data.item(0).genericName, '||');
            var brandName = _.split(db.data.item(0).brandName, '||');
            var frequency = _.split(db.data.item(0).frequency, '||');
            var dosage = _.split(db.data.item(0).dosage, '||');
            var form = _.split(db.data.item(0).forms, '||');
            var notes = _.split(db.data.item(0).notes, '||');
            this.setState({
                prescriptionID: this.props.prescriptionID,
                prescriptionRowID: this.props.prescriptionRowID,
                date: db.data.item(0).dateIssued,
                generic: genericName[this.props.prescriptionRowID],
                brand: brandName[this.props.prescriptionRowID],
                dosage: dosage[this.props.prescriptionRowID],
                form: form[this.props.prescriptionRowID],
                frequency: frequency[this.props.prescriptionRowID],
                notes: notes[this.props.prescriptionRowID],
            })
            this.setState({prescription: db.data.item(0)})
        })
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
                RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                    this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')})
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
    renderScene(route, navigator) {
        return (
            <View style={[Styles.containerStyle, {backgroundColor: '#FFFFFF'}]}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Edit Prescription</Text>
                </View>
                <Modal
                    animationType={'fade'}
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => this.setState({modalVisible: false})}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)'}}
                        onPress={() => this.setState({modalVisible: false})}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#2979FF'}}>
                            <TouchableOpacity
                                style={{padding: 18, paddingRight: 20, paddingLeft: 20}}
                                onPress={() => this.setState({selectedValue: {index: '', modal: ''}, modalVisible: false})}>
                                <Text style={{color: '#FFF'}}>CANCEL</Text></TouchableOpacity>
                            <TouchableOpacity
                                style={{padding: 16, paddingRight: 20, paddingLeft: 20}}
                                onPress={() => {
                                    var value = '';
                                    if (this.state.selectedValue.modal == 'dosageVisible') {
                                        value = _.toInteger(this.state.firstDigit +''+ this.state.secondDigit +''+ this.state.thirdDigit +''+ this.state.fourthDigit);
                                        value = _.toString(value) +' '+this.state.massValue;
                                    }
                                    if (this.state.selectedValue.modal == 'frequencyVisible') {
                                        value = this.state.frequencyDigit +' '+ this.state.frequencyAmount +' '+  this.state.frequencyTime;
                                    }
                                    var obj = {}; obj[this.state.selectedValue.name] = value;
                                    obj['selectedValue'] = {index: '', modal: ''};
                                    obj['modalVisible'] = false;
                                    this.setState(obj)
                                }}>
                                <Text style={{color: '#FFF'}}>OK</Text></TouchableOpacity>
                        </View>
                        {(this.state.selectedValue.modal == 'dosageVisible') ? (
                            <View style={{flexDirection: 'column'}}>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 1}}>
                                    <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.firstDigit.moveTo((this.state.firstDigit) ? (this.state.firstDigit - 1) : 0)}>
                                            <Icon name={'keyboard-arrow-up'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                        <Picker
                                            pickerStyle={{height: 140, paddingTop: 5}}
                                            ref={ref => this.firstDigit = ref}
                                            selectedValue={this.state.firstDigit}
                                            onValueChange={(value) => this.setState({firstDigit: value})}>
                                            {_.map(this.state.numbers, (v, i) => (<Picker.Item key={i} value={v} label={v}/>))}
                                        </Picker>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.firstDigit.moveDown()}>
                                            <Icon name={'keyboard-arrow-down'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.secondDigit.moveTo((this.state.secondDigit) ? (this.state.secondDigit - 1) : 0)}>
                                            <Icon name={'keyboard-arrow-up'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                        <Picker
                                            pickerStyle={{height: 140, paddingTop: 5}}
                                            ref={ref => this.secondDigit = ref}
                                            selectedValue={this.state.secondDigit}
                                            onValueChange={(value) => this.setState({secondDigit: value})}>
                                            {_.map(this.state.numbers, (v, i) => (<Picker.Item key={i} value={v} label={v}/>))}
                                        </Picker>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.secondDigit.moveDown()}>
                                            <Icon name={'keyboard-arrow-down'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.thirdDigit.moveTo((this.state.thirdDigit) ? (this.state.thirdDigit - 1) : 0)}>
                                            <Icon name={'keyboard-arrow-up'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                        <Picker
                                            pickerStyle={{height: 140, paddingTop: 5}}
                                            ref={ref => this.thirdDigit = ref}
                                            selectedValue={this.state.thirdDigit}
                                            onValueChange={(value) => this.setState({thirdDigit: value})}>
                                            {_.map(this.state.numbers, (v, i) => (<Picker.Item key={i} value={v} label={v}/>))}
                                        </Picker>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.thirdDigit.moveDown()}>
                                            <Icon name={'keyboard-arrow-down'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.fourthDigit.moveTo((this.state.fourthDigit) ? (this.state.fourthDigit - 1) : 0)}>
                                            <Icon name={'keyboard-arrow-up'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                        <Picker
                                            pickerStyle={{height: 140, paddingTop: 5}}
                                            ref={ref => this.fourthDigit = ref}
                                            selectedValue={this.state.fourthDigit}
                                            onValueChange={(value) => this.setState({fourthDigit: value})}>
                                            {_.map(this.state.numbers, (v, i) => (<Picker.Item key={i} value={v} label={v}/>))}
                                        </Picker>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.fourthDigit.moveDown()}>
                                            <Icon name={'keyboard-arrow-down'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 1, paddingTop: 0}}>
                                    <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => (this.state.massAccro.indexOf(this.state.massValue) > 0) ?  this.massValue.moveTo(this.state.massAccro.indexOf(this.state.massValue) - 1) : ''}>
                                            <Icon name={'keyboard-arrow-up'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                        <Picker
                                            pickerStyle={{height: 140, paddingTop: 5}}
                                            ref={ref => this.massValue = ref}
                                            selectedValue={this.state.massValue}
                                            onValueChange={(value) => this.setState({massValue: value})}>
                                            {_.map(this.state.massAccro, (v, i) => (<Picker.Item key={i} value={v} label={this.state.masses[v]}/>))}
                                        </Picker>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.massValue.moveDown()}>
                                            <Icon name={'keyboard-arrow-down'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : (<View/>)}
                        {(this.state.selectedValue.modal == 'frequencyVisible') ? (
                            <View style={{flexDirection: 'column'}}>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 1}}>
                                    <View style={{width: 80, flexDirection: 'column', margin: 1}}>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.frequencyDigit.moveTo((this.state.frequencyDigit) ? (this.state.frequencyDigit - 1) : 0)}>
                                            <Icon name={'keyboard-arrow-up'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                        <Picker
                                            pickerStyle={{height: 140, paddingTop: 5}}
                                            ref={ref => this.frequencyDigit = ref}
                                            selectedValue={this.state.frequencyDigit}
                                            onValueChange={(value) => this.setState({frequencyDigit: value})}>
                                            {_.map(this.state.numbers, (v, i) => (<Picker.Item key={i} value={v} label={v}/>))}
                                        </Picker>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.frequencyDigit.moveDown()}>
                                            <Icon name={'keyboard-arrow-down'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => (this.state.frequencyAmounts.indexOf(this.state.frequencyAmount) > 0) ?  this.frequencyAmount.moveTo(this.state.frequencyAmounts.indexOf(this.state.frequencyAmount) - 1) : ''}>
                                            <Icon name={'keyboard-arrow-up'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                        <Picker
                                            pickerStyle={{height: 140, paddingTop: 5}}
                                            ref={ref => this.frequencyAmount = ref}
                                            selectedValue={this.state.frequencyAmount}
                                            onValueChange={(value) => this.setState({frequencyAmount: value})}>
                                            {_.map(this.state.frequencyAmounts, (v, i) => (<Picker.Item key={i} value={v} label={v}/>))}
                                        </Picker>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.frequencyAmount.moveDown()}>
                                            <Icon name={'keyboard-arrow-down'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 1, paddingTop: 0,}}>
                                    <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => (this.state.frequencyTimes.indexOf(this.state.frequencyTime) > 0) ?  this.frequencyTime.moveTo(this.state.frequencyTimes.indexOf(this.state.frequencyTime) - 1) : ''}>
                                            <Icon name={'keyboard-arrow-up'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                        <Picker
                                            pickerStyle={{height: 140, paddingTop: 5}}
                                            ref={ref => this.frequencyTime = ref}
                                            selectedValue={this.state.frequencyTime}
                                            onValueChange={(value) => this.setState({frequencyTime: value})}>
                                            {_.map(this.state.frequencyTimes, (v, i) => (<Picker.Item key={i} value={v} label={v}/>))}
                                        </Picker>
                                        <TouchableOpacity
                                            style={{padding: 5, flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 2}}
                                            onPress={() => this.frequencyTime.moveDown()}>
                                            <Icon name={'keyboard-arrow-down'} size={40} color={'#212121'} style={{textAlign: 'center'}}/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : (<View/>)}
                    </TouchableOpacity>
                </Modal>
                <ScrollView
                    keyboardShouldPersistTaps={true}>
                    <View style={{backgroundColor: '#FFFFFF', paddingLeft: 14, paddingRight: 16, paddingTop: 16, paddingBottom: 90}}>
                        <Text style={styles.label} >Generic Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput]}
                            autoCapitalize={'words'}
                            value={this.state.generic}
                            placeholderTextColor={'#E0E0E0'}
                            onChangeText={(text) => this.setState({generic: text})} />
                        <Text style={styles.label} >Brand Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput]}
                            autoCapitalize={'words'}
                            value={this.state.brand}
                            placeholderTextColor={'#E0E0E0'}
                            onChangeText={(text) => this.setState({brand: text})} />
                        <Text style={styles.label} >Dosage</Text>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'stretch'}}>
                                <TextInput
                                    placeholder={'Text Here...'}
                                    style={[styles.textInput, {flex: 1, alignItems: 'stretch', paddingRight: 50}]}
                                    keyboardType={'numeric'}
                                    value={this.state.dosage}
                                    placeholderTextColor={'#E0E0E0'}
                                    onChangeText={(text) => this.setState({dosage: text})} />
                                <TouchableOpacity
                                    style={{position: 'absolute', right: 0, padding: 13}}
                                    onPress={() => this.setState({selectedValue: {modal: 'dosageVisible', name: 'dosage'}, modalVisible: true})}>
                                    <Icon name={'arrow-drop-down'} size={40} color={'#212121'} style={{marginTop: -8}}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.label} >Frequency</Text>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'stretch'}}>
                                <TextInput
                                    placeholder={'Text Here...'}
                                    style={[styles.textInput, {flex: 1, alignItems: 'stretch', paddingRight: 50}]}
                                    keyboardType={'numeric'}
                                    value={this.state.frequency}
                                    placeholderTextColor={'#E0E0E0'}
                                    onChangeText={(text) => this.setState({frequency: text})} />
                                <TouchableOpacity
                                    style={{position: 'absolute', right: 0, padding: 13}}
                                    onPress={() => this.setState({selectedValue: {modal: 'frequencyVisible', name: 'frequency'}, modalVisible: true})}>
                                    <Icon name={'arrow-drop-down'} size={40} color={'#212121'} style={{marginTop: -8}}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.label} >Note</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput, {textAlignVertical: 'top'}]}
                            autoCapitalize={'words'}
                            value={this.state.notes}
                            placeholderTextColor={'#E0E0E0'}
                            multiline={true}
                            numberOfLines={4}
                            onChangeText={(text) => this.setState({notes: text})} />
                    </View>
                </ScrollView>
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
                                if (_.size(_.split(this.state.prescription.genericName, '||'))>1) {
                                    var frequency = _.split(this.state.prescription.frequency, '||');
                                    _.pullAt(frequency, [this.props.prescriptionRowID]);
                                    var form = _.split(this.state.prescription.form, '||');
                                    _.pullAt(form, [this.props.prescriptionRowID]);
                                    var generic = _.split(this.state.prescription.genericName, '||');
                                    _.pullAt(generic, [this.props.prescriptionRowID]);
                                    var notes = _.split(this.state.prescription.notes, '||');
                                            _.pullAt(notes, [this.props.prescriptionRowID]);
                                            var brand = _.split(this.state.prescription.brandName, '||');
                                            _.pullAt(brand, [this.props.prescriptionRowID]);
                                            var dosage = _.split(this.state.prescription.dosage, '||');
                                            _.pullAt(dosage, [this.props.prescriptionRowID]);
                                            var values = {
                                                frequency: _.join(frequency, '||'),
                                                forms: _.join(form, '||'),
                                                generic: _.join(generic, '||'),
                                                notes: _.join(notes, '||'),
                                                brand: _.join(brand, '||'),
                                                dosage: _.join(dosage, '||'),
                                                pharmacyDrugData: '',
                                                updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            };
                                            tx.executeSql("UPDATE prescriptions SET `frequency`=?, `forms`=?, `genericName`=?, `notes`=?, `brandName`=?, `dosage`=?, `pharmacyDrugData`=?, `updated_at`=?", _.values(values), (tx, rs) => {
                                                console.log("created: " + rs.rowsAffected);
                                            })
                                        } else {
                                            tx.executeSql("UPDATE prescriptions  ?, updated_at = ? where id = ?", [moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), this.props.prescriptionID], (tx, rs) => {
                                                console.log("deleted: " + rs.rowsAffected);
                                            });
                                        }
                                    }, (err) => {
                                        alert(err.message)
                                    }, () => {
                                        ToastAndroid.show("Prescription successfully deleted!", 3000)
                                        this.props.navigator.replacePreviousAndPop({
                                            id: 'PrescriptionPage',
                                            passProps: {
                                                diagnosisID: this.props.diagnosisID,
                                                patientID: this.props.patientID,
                                                patientAvatar: this.props.patientAvatar,
                                                patientName: this.props.patientName
                                            }
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
                var frequency = _.split(this.state.prescription.frequency, '||');
                frequency[this.props.prescriptionRowID] = this.state.frequency;
                var form = _.split(this.state.prescription.form, '||');
                form[this.props.prescriptionRowID] = this.state.form;
                var generic = _.split(this.state.prescription.genericName, '||');
                generic[this.props.prescriptionRowID] = this.state.generic;
                var notes = _.split(this.state.prescription.notes, '||');
                notes[this.props.prescriptionRowID] = this.state.notes;
                var brand = _.split(this.state.prescription.brandName, '||');
                brand[this.props.prescriptionRowID] = this.state.brand;
                var dosage = _.split(this.state.prescription.dosage, '||');
                dosage[this.props.prescriptionRowID] = this.state.dosage;
                var values = {
                    frequency: _.join(frequency, '||'),
                    form: _.join(form, '||'),
                    generic: _.join(generic, '||'),
                    notes: _.join(notes, '||'),
                    brand: _.join(brand, '||'),
                    dosage: _.join(dosage, '||'),
                    pharmacyDrugData: '',
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    prescriptionID: this.props.prescriptionID
                };
                tx.executeSql("UPDATE prescriptions SET `frequency`=?, `forms`=?, `genericName`=?, `notes`=?, `brandName`=?, `dosage`=?, `pharmacyDrugData`=?, `updated_at`=? WHERE id=?", _.values(values), (tx, rs) => {
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
                ToastAndroid.show("Prescription successfully saved!", 3000)
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

module.exports = EditPrescription

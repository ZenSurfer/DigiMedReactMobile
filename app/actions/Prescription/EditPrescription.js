'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Navigator, InteractionManager, StatusBar, TouchableOpacity, TouchableNativeFeedback, ScrollView, TextInput, ToastAndroid, Dimensions, RefreshControl, ListView, Alert} from 'react-native'
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

class EditPrescription extends Component {
    constructor(props) {
        super(props)
        this.state = {
            doctorID: EnvInstance.getDoctor().id,
            avatar: false,
            refreshing: false,
            prescription: {},
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
            var form = _.split(db.data.item(0).form, '||');
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
                        <Text style={styles.label} >Form</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput]}
                            autoCapitalize={'words'}
                            value={this.state.form}
                            placeholderTextColor={'#E0E0E0'}
                            onChangeText={(text) => this.setState({form: text})} />
                        <Text style={styles.label} >Dosage</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput]}
                            autoCapitalize={'words'}
                            value={this.state.dosage}
                            placeholderTextColor={'#E0E0E0'}
                            onChangeText={(text) => this.setState({dosage: text})} />
                        <Text style={styles.label} >Frequency</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput]}
                            autoCapitalize={'words'}
                            value={this.state.frequency}
                            placeholderTextColor={'#E0E0E0'}
                            onChangeText={(text) => this.setState({frequency: text})} />
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
                                                form: _.join(form, '||'),
                                                generic: _.join(generic, '||'),
                                                notes: _.join(notes, '||'),
                                                brand: _.join(brand, '||'),
                                                dosage: _.join(dosage, '||'),
                                                pharmacyDrugData: '',
                                                updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            };
                                            tx.executeSql("UPDATE prescriptions SET `frequency`=?, `form`=?, `genericName`=?, `notes`=?, `brandName`=?, `dosage`=?, `pharmacyDrugData`=?, `updated_at`=?", _.values(values), (tx, rs) => {
                                                console.log("created: " + rs.rowsAffected);
                                            })
                                        } else {
                                            tx.executeSql("UPDATE prescriptions SET deleted_at = ?, updated_at = ? where id = ?", [moment(new Date()).format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD'), this.props.prescriptionID], (tx, rs) => {
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
                tx.executeSql("UPDATE prescriptions SET `frequency`=?, `form`=?, `genericName`=?, `notes`=?, `brandName`=?, `dosage`=?, `pharmacyDrugData`=?, `updated_at`=? WHERE id=?", _.values(values), (tx, rs) => {
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

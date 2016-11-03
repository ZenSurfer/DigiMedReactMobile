'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Navigator, InteractionManager, DrawerLayoutAndroid, StatusBar, TouchableOpacity, TouchableNativeFeedback, DatePickerAndroid, ScrollView, TextInput, Picker, Switch, ToastAndroid, Dimensions, Modal} from 'react-native'
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/MaterialIcons'

import _ from 'lodash'
import moment from 'moment'
import ImagePicker from 'react-native-image-picker'
import Env from '../../env'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const drawerRef = {}
const {height, width} = Dimensions.get('window')
const EnvInstance = new Env()
const db = EnvInstance.db()

class AddPatient extends Component {
    constructor(props) {
        super(props)
        this.state = {
            primaryDoc: '',
            secondaryDoc: '',
            referredByID: '',
            code: '',
            category: 'Resident',
            firstname: '',
            lastname: '',
            middlename: '',
            nickname: '',
            birthdate: {
                text: moment().format('MMMM DD, YYYY'),
                date: Date.now(),
            },
            birthPlace: '',
            religion: '',
            address: '',
            status: 'Single',
            occupation: '',
            sex: 1,
            race: '',
            nationality: '',
            height: '',
            hmoID: '',
            hmo: '',
            hmoCode: '',
            telHome: '',
            telOffice: '',
            telMobile: '',
            email: '',
            company: '',
            companyAddress: '',
            companyContact: '',
            companyID: '',
            personNotify: '',
            personMobile: '',
            personRelation: '',
            personAddress: '',
            insuranceProvider: '',
            accountVerified: '',
            policyNumber: '',
            imagePath: '',
            imageMime: '',
            isPedia: '',
            fatherName: '',
            motherName: '',
            guardianName: '',
            spouseName: '',
            deleted_at: '',
            created_at: moment().format('YYYY-MM-DD'),
            updated_at: moment().format('YYYY-MM-DD'),

            animationType: 'slide',
            modalVisible: false,
            transparent: true,
            avatar: '',
        }
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator} routeName={'patients'}></DrawerPage>)
                }}
                statusBarBackgroundColor={'#2962FF'}
                ref={this.drawerInstance}
                >
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar style={Styles.navigationBar}
                            routeMapper={NavigationBarRouteMapper} />
                    }
                    configureScene = {this.configureScene}
                    />
            </DrawerLayoutAndroid>
        )
    }
    async showPicker(stateKey, options) {
        try {
            const {action, year, month, day} = await DatePickerAndroid.open(options);
            if (action !== DatePickerAndroid.dismissedAction) {
                var date = new Date(year, month, day);
                this.setState({
                    birthdate: {
                        text: moment(date).format('MMMM DD, YYYY'),
                        date: date
                    }
                });
            }
        } catch ({code, message}) {
            console.warn(`Error in example '${stateKey}': `, message);
        }
    }
    configureScene(route, routeStack){
        return Navigator.SceneConfigs.PushFromRight
    }
    renderScene(route, navigator) {
        return (
            <View style={[Styles.containerStyle, {backgroundColor: '#FFFFFF'}]}>
                <View style={[Styles.subTolbar]}>
                    <Text style={Styles.subTitle}>Add Patient Information</Text>
                </View>
                <ScrollView
                    keyboardShouldPersistTaps={true}>
                    <View style={{height: 250, backgroundColor: '#EEEEEE'}}>
                        {(this.state.avatar) ? (
                            <Image
                                style={{backgroundColor: '#EEEEEE', width: width, height: 250}}
                                resizeMode={'cover'}
                                source={{uri: this.state.avatar}} />
                        ) : (<View/>)}
                    </View>
                    <TouchableOpacity
                        style={[Styles.buttonFab, Styles.buttonFabCam]}
                        onPress={() => {
                            ImagePicker.launchCamera({maxWidth: 800}, (rs)  => {
                                this.setState({avatar: (rs.data) ? 'data:image/jpeg;base64,'+rs.data : this.state.avatar})
                            });
                        }}>
                        <Icon name={'photo-camera'} color={'#FFFFFF'} size={30}/>
                    </TouchableOpacity>
                    <View style={{backgroundColor: '#FFFFFF', paddingLeft: 16, paddingRight: 16, paddingTop: 16}}>
                        <Text style={styles.heading}>Patient Profile</Text>
                        <Text style={styles.label} >Patient Code</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            autoCapitalize={'words'}
                            value={this.state.code}
                            placeholderTextColor={'#E0E0E0'}
                            onChangeText={(text) => this.setState({code: text})} />
                        <Text style={styles.label} >First Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            autoCapitalize={'words'}
                            value={this.state.firstname}
                            placeholderTextColor={'#E0E0E0'}
                            onChangeText={(text) => this.setState({firstname: text})} />
                        <Text style={styles.label}>Last Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            autoCapitalize={'words'}
                            value={this.state.lastname}
                            placeholderTextColor={'#E0E0E0'}
                            onChangeText={(text) => this.setState({lastname: text})} />
                        <Text style={styles.label} >Middle Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.middlename}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({middlename: text})} />
                        <Text style={styles.label}>Nick Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            autoCapitalize={'words'}
                            value={this.state.nickname}
                            placeholderTextColor={'#E0E0E0'}
                            onChangeText={(text) => this.setState({nickname: text})} />
                        <Text style={styles.label}>Birth Place</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            autoCapitalize={'words'}
                            value={this.state.birthPlace}
                            placeholderTextColor={'#E0E0E0'}
                            onChangeText={(text) => this.setState({birthPlace: text})} />
                        <Text style={styles.label} >Birth Date</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.birthdate.text}
                            placeholderTextColor={'#E0E0E0'}
                            onFocus={this.showPicker.bind(this, 'simple', {date: this.state.birthdate.date})} />
                        <Text style={styles.label} >Sex</Text>
                        <View style={styles.select}>
                            <Picker
                                mode={'dialog'}
                                selectedValue={this.state.sex}
                                onValueChange={(value) => this.setState({sex: value})} >
                                <Picker.Item label="Male" value="1" />
                                <Picker.Item label="Female" value="0" />
                            </Picker>
                        </View>
                        <Text style={styles.label} >Status</Text>
                        <View style={styles.select}>
                            <Picker
                                mode={'dialog'}
                                selectedValue={this.state.status}
                                onValueChange={(value) => this.setState({status: value})} >
                                <Picker.Item label="Single" value="Single" />
                                <Picker.Item label="Married" value="Married" />
                                <Picker.Item label="Widowed" value="Widowed" />
                                <Picker.Item label="Separated" value="Separated" />
                                <Picker.Item label="Divorced" value="Divorced" />
                            </Picker>
                        </View>
                        <Text style={styles.label} >Race</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.race}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({race: text})} />
                        <Text style={styles.label} >Nationality</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.nationality}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({nationality: text})} />
                        <Text style={styles.label} >Religion</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.religion}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({religion: text})} />
                        <Text style={styles.label} >Occupation</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.occupation}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({occupation: text})} />
                        <Text style={styles.label} >Category</Text>
                        <View style={styles.select}>
                            <Picker
                                mode={'dialog'}
                                selectedValue={this.state.category}
                                onValueChange={(value) => this.setState({category: value})} >
                                <Picker.Item label="Resident" value="Resident" />
                                <Picker.Item label="Non-Resident" value="Non-Resident" />
                                <Picker.Item label="Employee" value="Employee" />
                            </Picker>
                        </View>

                        <Text style={[styles.heading, {paddingTop: 10}]} >Contact Information</Text>
                        <Text style={styles.label} >Address</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput, {textAlignVertical: 'top'}]}
                            autoCapitalize={'words'}
                            value={this.state.address}
                            placeholderTextColor={'#E0E0E0'}
                            multiline={true}
                            numberOfLines={4}
                            onChangeText={(text) => this.setState({address: text})} />
                        <Text style={styles.label} >Mobile Number</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.telMobile}
                            placeholderTextColor={'#E0E0E0'}
                            keyboardType={'phone-pad'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({telMobile: text})} />
                        <Text style={styles.label} >Telephone Number</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.telHome}
                            placeholderTextColor={'#E0E0E0'}
                            keyboardType={'phone-pad'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({telHome: text})} />
                        <Text style={styles.label} >Email Address</Text>
                        <TextInput
                            keyboardType={'email-address'}
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.email}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({email: text})} />
                        <Text style={styles.label} >Person to Notify</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.personNotify}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({personNotify: text})} />
                        <Text style={styles.label} >Relation to Patient</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.personRelation}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({personRelation: text})} />
                        <Text style={styles.label} >Mobile of Person to Notify</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.personMobile}
                            placeholderTextColor={'#E0E0E0'}
                            keyboardType={'phone-pad'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({personMobile: text})} />
                        <Text style={styles.label} >Address of Person to Notify</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.personAddress}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({personAddress: text})} />

                        <Text style={[styles.heading, {paddingTop: 10}]} >Other Information</Text>
                        <Text style={styles.label} >Company Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.company}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({company: text})} />
                        <Text style={styles.label} >Company Address</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.companyAddress}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({companyAddress: text})} />
                        <Text style={styles.label} >Company Telephone Number</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.companyContact}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            keyboardType={'phone-pad'}
                            onChangeText={(text) => this.setState({companyContact: text})} />
                        <Text style={styles.label} >Company ID</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.companyID}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({companyID: text})} />
                        <Text style={styles.label} >HMO</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.hmo}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({hmo: text})} />
                        <Text style={styles.label} >HMO Code</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.hmoCode}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({hmoCode: text})} />
                        <Text style={styles.label} >HMO ID</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.hmoID}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({hmoID: text})} />
                        <Text style={styles.label} >Insurance Provider</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.insuranceProvider}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({insuranceProvider: text})} />
                        <Text style={styles.label} >Policy Number</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.policyNumber}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({policyNumber: text})} />
                        <View style={{flexDirection: 'row', marginTop: 10,}}>
                            <Switch
                                onValueChange={(value) => this.setState({isInfant: value})}
                                style={{marginBottom: 10, marginRight: 10}}
                                value={this.state.isInfant} />
                            <Text style={[styles.textInput, styles.switch]}>Is Infant? </Text>
                            <Text style={[styles.textInput, styles.switch, {color: '#212121'}]}>{this.state.isInfant ? 'Yes' : 'No'}</Text>
                        </View>
                        <Text style={styles.label} >Father's Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.fatherName}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({fatherName: text})} />
                        <Text style={styles.label} >Mothers's Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.motherName}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({motherName: text})} />
                        <Text style={styles.label} >Guardian's Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.guardianName}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({guardianName: text})} />
                        <Text style={styles.label} >Spouse's Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.spouseName}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({spouseName: text})} />
                        <Text style={styles.label} >Primary Physician</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.primaryDoc}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({primaryDoc: text})} />
                        <Text style={styles.label} >Secondary Physician</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.secondaryDoc}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({secondaryDoc: text})} />
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
    onSubmit() {
        this.setState({refreshing: true})
        if (_.trim(this.state.firstname) !== '' && _.trim(this.state.lastname) !== '' && _.trim(this.state.middlename) !== '' && _.trim(this.state.telMobile) !== '') {
            var path = ''; var mime = '';
            if (this.state.avatar) {
                path = RNFS.ExternalDirectoryPath + '/avatar/'+this.guid()+'.jpeg';
                mime = 'jpeg';
            }
            var parse = _.map(_.values(this.state), (rs, i) => {
                if (i == 9) return moment(rs.date).format('YYYY-MM-DD')
                else if (i == 37) return path
                else if (i == 38) return mime
                else return rs
            })
            db.transaction((tx) => {
                tx.executeSql("insert into patients (`primaryDoc`, `secondaryDoc`, `referredByID`, `code`, `category`, `firstname`, `lastname`, `middlename`, `nickname`, `birthdate`, `birthPlace`, `religion`, `address`, `status`, `occupation`, `sex`, `race`, `nationality`, `height`, `hmoID`, `hmo`, `hmoCode`, `telHome`, `telOffice`, `telMobile`, `email`, `company`, `companyAddress`, `companyContact`, `companyID`, `personNotify`, `personMobile`, `personRelation`, `personAddress`, `insuranceProvider`, `accountVerified`, `policyNumber`, `imagePath`, `imageMime`, `isPedia`, `fatherName`, `motherName`, `guardianName`, `spouseName`, `deleted_at`, `created_at`, `updated_at`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", _.dropRight(_(parse).value(), (_.size(parse) - 47)) , (tx, rs) => {
                    console.log("created: " + rs.rowsAffected);
                    db.patientID = rs.insertId;
                })
            }, (err) => {
                this.setState({refreshing: false})
                ToastAndroid.show("Error occured while saving!", 3000)
            }, () => {
                this.setState({refreshing: false})
                if (this.state.avatar) {
                    RNFS.writeFile(path, this.state.avatar, 'base64').then((success) => {
                        this.props.navigator.replace({
                            id: 'PatientPage',
                            sceneConfig: Navigator.SceneConfigs.FadeAndroid
                        })
                        ToastAndroid.show("Successfully created!", 3000)
                    }).catch((err) => {
                        this.props.navigator.replace({
                            id: 'PatientPage',
                            sceneConfig: Navigator.SceneConfigs.FadeAndroid
                        })
                        ToastAndroid.show("Error occured while creating image!", 3000)
                    });
                } else {
                    this.props.navigator.replace({
                        id: 'PatientPage',
                        sceneConfig: Navigator.SceneConfigs.FadeAndroid
                    })
                    ToastAndroid.show("Successfully created!", 3000)
                }
            })
        } else {
            if (_.trim(this.state.firstname) == '') {
                ToastAndroid.show("Invalid Last Name!", 3000)
            } else if ( _.trim(this.state.lastname) == '') {
                ToastAndroid.show("Invalid First Name!", 3000)
            } else if (_.trim(this.state.middlename) == '') {
                ToastAndroid.show("Invalid Middle Name!", 3000)
            } else {
                ToastAndroid.show("Invalid Mobile Number!", 3000)
            }
        }
    }
    drawerInstance(instance) {
        drawerRef = instance
    }
    guid() {
        var s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return moment().utc() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }
}

const styles = StyleSheet.create({
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
        paddingTop: 5,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#757575',
        borderStyle: 'solid',
    },
    switch: {
        height: 25,
        textAlignVertical: 'center',
        color: '#9E9E9E'
    },
})

var NavigationBarRouteMapper = {
    LeftButton(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={Styles.leftButton}
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
                <Text style={Styles.titleText}>Patient</Text>
            </TouchableOpacity>
        )
    }
}

module.exports = AddPatient

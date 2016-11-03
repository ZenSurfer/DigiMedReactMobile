'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Navigator, DrawerLayoutAndroid, Alert, ActivityIndicator, TouchableOpacity, TouchableNativeFeedback, DatePickerAndroid, ScrollView, TextInput, Picker, Switch, ToastAndroid, CameraRoll, Dimensions, InteractionManager} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'
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
const avatar = require('../../assets/images/banner.jpg')

class EditPatient extends Component {
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
            avatar: '',
            modalVisible: false,
            transparent: false,
            renderPlaceholderOnly: true,
            progress: 0,
            statusBarBackgroundColor: '#FFF',
        }
    }
    componentWillMount() {
        db.transaction((tx) => {
            db.data = []
            tx.executeSql("SELECT * FROM patients WHERE id = ? LIMIT 1", [this.props.patientID], (tx, rs) => {
                db.data = rs.rows.item(0);
            })
        }, (err) => {
            console.log('Error: ', err)
        }, () => {
            this.setState(_.omit(db.data, ['id','otherID','updated_at']))
            this.setState({
                    birthdate: {
                        text: moment(this.state.birthdate).format('MMMM DD, YYYY'),
                        date: new Date(this.state.birthdate),
                    }
            })
            if (db.data.imagePath != '')
                RNFS.exists(db.data.imagePath).then((exist) => {
                    if (exist)
                        RNFS.readFile(db.data.imagePath, 'base64').then((rs) => {
                            this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')});
                        })
                })
        })
    }
    render() {
        return (
            <Navigator
                renderScene={(this.state.renderPlaceholderOnly) ? this.renderPlaceholderView.bind(this) : this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={[Styles.navigationBar,{marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper(this.props.patientID, this.props.patientName)} />
                }/>
        )
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({renderPlaceholderOnly: false, progress: 1});
        });
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
    renderPlaceholderView() {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Edit Patient Information</Text>
                </View>
                <View style={Styles.loading}>
                    <View style={Styles.horizontal}><ActivityIndicator color="#212121" size={23}/></View>
                </View>
            </View>
        );
    }
    renderScene(route, navigator) {
        return (
            <View style={[Styles.containerStyle, {backgroundColor: '#FFFFFF'}]}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Edit Patient Information</Text>
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
                    <View style={{backgroundColor: '#FFFFFF', paddingLeft: 16, paddingRight: 16, paddingTop: 16}}>
                        <Text style={styles.heading}>Patient Profile</Text>
                        <Text style={styles.label} >Patient Code</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            autoCapitalize={'words'}
                            value={_.toString(this.state.code)}
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
                                selectedValue={(this.state.sex) ? this.state.sex : "1"}
                                onValueChange={(value) => this.setState({sex: value})} >
                                <Picker.Item label="Male" value="1" />
                                <Picker.Item label="Female" value="0" />
                            </Picker>
                        </View>
                        <Text style={styles.label} >Status</Text>
                        <View style={styles.select}>
                            <Picker
                                mode={'dialog'}
                                selectedValue={(this.state.status) ? this.state.status : "Single"}
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
                                selectedValue={(this.state.category) ? this.state.category : "Resident"}
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
                    <TouchableOpacity
                        style={[Styles.buttonFab, Styles.buttonFabCam]}
                        onPress={() => {
                            ImagePicker.launchCamera({maxWidth: 800}, (rs)  => {
                                this.setState({avatar: (rs.data) ? 'data:image/jpeg;base64,'+rs.data : this.state.avatar})
                            });
                        }}>
                        <Icon name={'photo-camera'} color={'#FFFFFF'} size={30}/>
                    </TouchableOpacity>
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
                                        tx.executeSql("update patients set deleted_at = ?, updated_at = ? where id = ?", [moment(new Date()).format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD'), this.props.patientID], (tx, rs) => {
                                            console.log("deleted: " + rs.rowsAffected);
                                        }, (tx, err) => {
                                            console.log('DELETE error: ' + err.message);
                                        });
                                    }, (err) => {
                                        ToastAndroid.show("Error occured while deleting!", 3000)
                                    }, () => {
                                        ToastAndroid.show("Successfully deleted!", 3000)
                                        navigator.parentNavigator.replace({
                                            id: 'PatientPage'
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
        this.setState({refreshing: true})
        RNFS.mkdir(RNFS.ExternalDirectoryPath+ '/avatar');
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
            var insert = _.dropRight(_(parse).value(), (_.size(parse) - 47));
            insert.push(this.props.patientID);

            db.transaction((tx) => {
                tx.executeSql("UPDATE patients SET primaryDoc = ?, secondaryDoc = ?, referredByID = ?, code = ?, category = ?, firstname = ?, lastname = ?, middlename = ?, nickname = ?, birthdate = ?, birthPlace = ?, religion = ?, address = ?, status = ?, occupation = ?, sex = ?, race = ?, nationality = ?, height = ?, hmoID = ?, hmo = ?, hmoCode = ?, telHome = ?, telOffice = ?, telMobile = ?, email = ?, company = ?, companyAddress = ?, companyContact = ?, companyID = ?, personNotify = ?, personMobile = ?, personRelation = ?, personAddress = ?, insuranceProvider = ?, accountVerified = ?, policyNumber = ?, imagePath = ?, imageMime = ?, isPedia = ?, fatherName = ?, motherName = ?, guardianName = ?, spouseName = ?, deleted_at = ?, created_at = ?, updated_at = ? WHERE id = ?", insert, (tx, rs) => {
                    console.log("updated: " + rs.rowsAffected);
                })
            }, (err) => {
                this.setState({refreshing: false})
                ToastAndroid.show("Error occured while saving!", 3000)
            }, () => {
                this.setState({refreshing: false})
                if (this.state.avatar) {
                    RNFS.writeFile(path, this.state.avatar, 'base64').then((success) => {
                        this.props.navigator.replacePreviousAndPop({
                            id: 'PatientProfile',
                            passProps: { patientID: this.props.patientID }
                        });
                        ToastAndroid.show("Successfully saved!", 3000)
                    }).catch((err) => {
                        this.props.navigator.replacePreviousAndPop({
                            id: 'PatientProfile',
                            passProps: { patientID: this.props.patientID }
                        });
                        ToastAndroid.show("Error occured while saving image!", 3000)
                    });
                } else {
                    this.props.navigator.replacePreviousAndPop({
                        id: 'PatientProfile',
                        passProps: { patientID: this.props.patientID }
                    });
                    ToastAndroid.show("Successfully saved!", 3000)
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
    loading: {
        flex: 1,
        alignItems: 'center',
        width: width,
        backgroundColor: '#FFFFFF',
        paddingTop: 73,
    },
    heading: {
        fontSize: 34,
        color: '#424242',
        marginBottom: 10,
        marginLeft: 4,
        marginRight: 4,
    },
    progress: {
        width: width,
    },
    containerWrapper: {
        backgroundColor: '#FFF',
        paddingTop: 36,
        paddingLeft: 12,
        paddingRight: 12,
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

var NavigationBarRouteMapper = (patientID, patientName) => ({
    LeftButton(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
                onPress={() => {
                    navigator.parentNavigator.replacePreviousAndPop({
                        id: 'PatientProfile',
                        passProps: {
                            patientID: patientID
                        }
                    })
                }}>
                <Text style={{color: 'white', margin: 10,}}>
                    <Icon name="keyboard-arrow-left" size={30} color="#FFF" />
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
                <Text style={Styles.titleText}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
}
)
module.exports = EditPatient

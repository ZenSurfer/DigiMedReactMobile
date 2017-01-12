'use-strict'

import React, {Component} from 'react'
import {Text, PixelRatio, Platform, View, StyleSheet, Navigator, Image, DrawerLayoutAndroid, ListView, TouchableOpacity, InteractionManager, ScrollView, RefreshControl, Dimensions, ActivityIndicator, TextInput, Picker, DatePickerAndroid, ToastAndroid, AsyncStorage} from 'react-native'
import RNFS from 'react-native-fs'
import ImagePicker from 'react-native-image-picker'
import Icon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import moment from 'moment'
import Env from '../../env'
import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const drawerRef = {}
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()
const {height, width} = Dimensions.get('window')
const avatar = require('../../assets/images/banner.jpg')
const windowSize = Dimensions.get('window');

class AddDoctor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            doctorName: '',
            rowData: [],

            firstname: '',
            middlename: '',
            lastname: '',
            nameSuffix: '',
            birthdate: {
                text: moment().format('MMMM DD, YYYY'),
                date: Date.now(),
            },
            sex: 1,
            status: 'Single',
            rank: '',
            type: '',
            code: '',
            licenseID: '',
            address: '',
            phone1: '',
            phone2: '',
            email: '',
            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),

            refreshing: false,
        }
        this.pixelDensity = PixelRatio.get();
        this.width = windowSize.width;
        this.height = windowSize.height;
        this.adjustedWidth = this.width * this.pixelDensity;
        this.adjustedHeight = this.height * this.pixelDensity;
        this.isTablet();
    }
    isTablet() {
        if(this.pixelDensity < 2 && (this.adjustedWidth >= 1000 || this.adjustedHeight >= 1000)) {
            this.isTablet = true;
            this.isPhone = false;
        } else if(this.pixelDensity === 2 && (this.adjustedWidth >= 1920 || this.adjustedHeight >= 1920)) {
            this.isTablet = true;
            this.isPhone = false;
        } else {
            this.isTablet = false;
            this.isPhone = true;
        }
    }
    render() {
        return (
            <Navigator
                renderScene={(this.state.renderPlaceholderOnly) ? this.renderPlaceholderView.bind(this) : this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={[Styles.navigationBar,{marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper} />
                }/>
        )
    }
    componentDidMount() {
        this.updateCredentials().done();
        InteractionManager.runAfterInteractions(() => {
            this.setState({renderPlaceholderOnly: false, progress: 1});
        });
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            this.setState({mobileID: JSON.parse(doctor).mobileID})
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        }
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
                    <Text style={Styles.subTitle}>Edit User Profile</Text>
                </View>
                <View style={Styles.loading}>
                    <View style={Styles.horizontal}><ActivityIndicator color="#212121" size={23}/></View>
                </View>
            </View>
        );
    }
    renderScene() {
        return (
            <View style={{flex: 1}}>
                <View style={Styles.containerStyle}>
                    {this.props.children}
                    <View style={[Styles.subTolbar, {marginTop: 24}]}>
                        <Text style={Styles.subTitle}>Add Doctor</Text>
                    </View>
                    <ScrollView
                        keyboardShouldPersistTaps={true}>
                        <View style={{height: (this.isTablet) ? 600 : 300, backgroundColor: '#EEEEEE'}}>
                            {(this.state.avatar) ? (
                                <Image
                                    style={{backgroundColor: '#EEEEEE', width: width, height: (this.isTablet) ? 600 : 300}}
                                    resizeMode={'cover'}
                                    source={{uri: this.state.avatar}} />
                                ) : (<View/>)}
                        </View>
                        <View style={{position: 'absolute', top: 0, flex: 1, flexDirection: 'row', justifyContent: 'center', zIndex: 2}}>
                            <View style={{flex: 1, alignItems: 'center', height: (this.isTablet) ? 600 : 300, flexDirection: 'row', justifyContent: 'center'}}>
                                <TouchableOpacity
                                    style={{padding: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, marginRight: 4}}
                                    onPress={() => {
                                        ImagePicker.launchCamera({maxWidth: 800}, (rs)  => {
                                            this.setState({avatar: (rs.data) ? 'data:image/jpeg;base64,'+rs.data : this.state.avatar})
                                        });
                                    }}>
                                    <Icon name={'photo-camera'} color={'#FFFFFF'} size={30}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{padding: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, marginLeft: 4}}
                                    onPress={() => {
                                        ImagePicker.launchImageLibrary({maxWidth: 800}, (rs)  => {
                                            this.setState({avatar: (rs.data) ? 'data:image/jpeg;base64,'+rs.data : this.state.avatar})
                                        });
                                    }}>
                                    <Icon name={'photo-library'} color={'#FFFFFF'} size={30}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{backgroundColor: '#FFFFFF', padding: 16}}>
                            <Text style={styles.heading}>Doctor Profile</Text>
                            <Text style={styles.label} >Firstname</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.firstname)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({firstname: text})} />
                            <Text style={styles.label} >Middlename</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.middlename)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({middlename: text})} />
                            <Text style={styles.label} >Lastname</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.lastname)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({lastname: text})} />
                            <Text style={styles.label} >Name Suffix</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.nameSuffix)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({nameSuffix: text})} />
                            <Text style={styles.label} >Birth Date</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                value={_.toString(this.state.birthdate.text)}
                                placeholderTextColor={'#E0E0E0'}
                                onFocus={this.showPicker.bind(this, 'simple', {date: this.state.birthdate.date})} />
                            <Text style={styles.label} >Gender</Text>
                            <View style={styles.select}>
                                <Picker
                                    mode={'dialog'}
                                    selectedValue={(this.state.sex) ? this.state.sex : "1"}
                                    onValueChange={(value) => this.setState({sex: value})} >
                                    <Picker.Item label="Male" value="1" />
                                    <Picker.Item label="Female" value="0" />
                                </Picker>
                            </View>
                            <Text style={styles.label} >Civil Status</Text>
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
                            <Text style={styles.label}>Address</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={[styles.textInput, {textAlignVertical: 'top', paddingTop: 10, paddingBottom: 20, height: Math.max(35, this.state.height)}]}
                                onContentSizeChange={(event) => {
                                    this.setState({height: event.nativeEvent.contentSize.height});
                                }}
                                autoCapitalize={'words'}
                                value={this.state.address}
                                placeholderTextColor={'#E0E0E0'}
                                multiline={true}
                                onChangeText={(text) => this.setState({address: text})} />
                            <Text style={styles.label} >Mobile Number</Text>
                            <TextInput
                                keyboardType={'phone-pad'}
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.phone1)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({phone1: text})} />
                            <Text style={styles.label} >Phone Number</Text>
                            <TextInput
                                keyboardType={'phone-pad'}
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.phone2)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({phone2: text})} />
                            <Text style={styles.label} >Email</Text>
                            <TextInput
                                keyboardType={'email-address'}
                                placeholder={'Text Here...'}
                                style={[styles.textInput]}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.email)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({email: text})} />
                            <Text style={[styles.heading, {paddingTop: 10}]}>Doctor Information</Text>
                            <Text style={styles.label} >Rank</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.rank)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({rank: text})} />
                            <Text style={styles.label} >Specialization</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.type)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({type: text})} />
                            <Text style={styles.label} >Code</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.code)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({code: text})} />
                            <Text style={styles.label} >LicenseID</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={[styles.textInput, {marginBottom: 80}]}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.licenseID)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({licenseID: text})} />
                        </View>
                    </ScrollView>
                </View>
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
        RNFS.mkdir(RNFS.DocumentDirectoryPath+ '/avatar');
        if (_.trim(this.state.firstname) !== '' && _.trim(this.state.lastname) !== '' && _.trim(this.state.middlename) !== '' && _.trim(this.state.phone2) !== '') {
            var path = ''; var imagePath = ''; var imageMime = 'jpeg';
            if (this.state.avatar) {
                var imagePath = 'avatar/'+this.guid()+'.jpeg';
                path = RNFS.DocumentDirectoryPath + '/' + imagePath;
            }
            var birthdate = moment(this.state.birthdate.date).format('YYYY-MM-DD');
            db.transaction((tx) => {
                var insertID = this.state.mobileID*100000;
                tx.executeSql("SELECT id FROM doctors WHERE id BETWEEN "+insertID+" AND "+((insertID*2)-1)+" ORDER BY created_at DESC LIMIT 1", [], (tx, rs) => {
                    if (rs.rows.length > 0)
                        insertID = rs.rows.item(0).id + 1;
                    tx.executeSql("INSERT INTO doctors (id, firstname, middlename, lastname, nameSuffix, birthdate, sex, status, address, phone1, phone2, email, imagePath, imageMime, created_at, updated_at, rank, type, code, licenseID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                    , [insertID, this.state.firstname, this.state.middlename, this.state.lastname, this.state.nameSuffix, birthdate, this.state.sex, this.state.status, this.state.address, this.state.phone1, this.state.phone2, this.state.email, imagePath, imageMime, this.state.created_at, this.state.updated_at, this.state.rank, this.state.type, this.state.code, this.state.licenseID]
                    , (tx, rs) => {
                        console.log("updated: " + rs.rowsAffected);
                    })
                });
            }, (err) => {
                this.setState({refreshing: false})
                alert(err.message)
                ToastAndroid.show("Error Occured!", 1000)
            }, () => {
                this.setState({refreshing: false})
                if (this.state.avatar) {
                    RNFS.writeFile(path, this.state.avatar, 'base64').then((success) => {
                        this.props.navigator.pop()
                        ToastAndroid.show("Successfully Saved!", 3000)
                    }).catch((err) => {
                        this.props.navigator.pop()
                        ToastAndroid.show("Error Occured!", 1000)
                    });
                } else {
                    this.props.navigator.pop()
                    ToastAndroid.show("Successfully Saved!", 3000)
                }
            })
        } else {
            if (_.trim(this.state.firstname) == '') {
                ToastAndroid.show("Invalid Last Name!", 1000)
            } else if ( _.trim(this.state.lastname) == '') {
                ToastAndroid.show("Invalid First Name!", 1000)
            } else if (_.trim(this.state.middlename) == '') {
                ToastAndroid.show("Invalid Middle Name!", 1000)
            } else {
                ToastAndroid.show("Invalid Phone Number!", 1000)
            }
        }
    }
    guid() {
        var s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return moment().utc() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }
}

var styles = StyleSheet.create({
    avatarImage: {
        height:  300,
        width: width,
        // borderRadius: 100,
        marginLeft: 16,
        marginRight: 16,
        marginBottom: 6,
    },
    heading: {
        fontSize: 34,
        color: '#424242',
        marginBottom: 10,
        marginLeft: 4,
        marginRight: 4,
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
    rows: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    label: {
        color: '#757575',
        paddingRight: 5,
        paddingLeft: 5,
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
    hr: {
      flex: 1,
      height: 1,
      backgroundColor: '#b3b3b3',
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
})

var NavigationBarRouteMapper = {
    LeftButton(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
                onPress={() => {
                    navigator.parentNavigator.pop()
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
                <Text style={Styles.titleText}>Doctor</Text>
            </TouchableOpacity>
        )
    }
}

module.exports = AddDoctor

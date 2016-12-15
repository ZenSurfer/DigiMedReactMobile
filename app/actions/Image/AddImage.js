'use strict';

import React, {Component} from 'react'
import {StyleSheet, Text, View, ListView, RefreshControl, Navigator, Dimensions, ToastAndroid, TouchableOpacity, TouchableNativeFeedback, Image, Alert, ScrollView, TextInput, AsyncStorage} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import ImagePicker from 'react-native-image-picker'
import RNFS from 'react-native-fs'
import _ from 'lodash'
import Styles from '../../assets/Styles'
import Env from '../../env'
import moment from 'moment'

const {height, width} = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()

class AddImage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            image: false,
            avatar: false,
            imageAnnotation: '',
            renderPlaceholderOnly: true,
        }
    }
    componentWillMount() {
        this.setState({patientID: this.props.patientID})
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
            this.setState({doctorID: JSON.parse(doctor).id, mobileID: JSON.parse(doctor).mobileID})
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
                    <Text style={Styles.subTitle}>Add Imaging</Text>
                </View>
                <ScrollView
                    keyboardShouldPersistTaps={true}>
                    <View style={{position: 'absolute', top: 0, flex: 1, flexDirection: 'row', justifyContent: 'center', zIndex: 2}}>
                        {(this.state.image) ? (
                            <View style={{flex: 1, alignItems: 'center', height: 300, flexDirection: 'row', justifyContent: 'center'}}>
                                <TouchableOpacity
                                    style={{padding: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, marginRight: 4}}
                                    onPress={() => {
                                        this.setState({image: false})
                                    }}>
                                    <Icon name={'close'} color={'#FFFFFF'} size={30}/>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{flex: 1, alignItems: 'center', height: 300, flexDirection: 'row', justifyContent: 'center'}}>
                                <TouchableOpacity
                                    style={{padding: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, marginRight: 4}}
                                    onPress={() => {
                                        ImagePicker.launchCamera({maxWidth: 800}, (response)  => {
                                            this.setState({image: (!_.isEmpty(response.data)) ? 'data:image/jpeg;base64,'+response.data : this.state.image})
                                        });
                                    }}>
                                    <Icon name={'photo-camera'} color={'#FFFFFF'} size={30}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{padding: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, marginLeft: 4}}
                                    onPress={() => {
                                        ImagePicker.launchImageLibrary({maxWidth: 800}, (response)  => {
                                            this.setState({image: (!_.isEmpty(response.data)) ? 'data:image/jpeg;base64,'+response.data : this.state.image})
                                        });
                                    }}>
                                    <Icon name={'photo-library'} color={'#FFFFFF'} size={30}/>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', height: 300, backgroundColor: '#E0E0E0'}}>
                        {(this.state.image) ? (
                            <Image
                                style={{flex: 1, alignItems: 'stretch', height: 300}}
                                resizeMode={'cover'}
                                source={{uri: this.state.image}} />
                        ) : (<View/>)}

                    </View>
                    <View style={{margin: 16, paddingBottom: 60}}>
                        <Text style={styles.label}>Annotation</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput, {textAlignVertical: 'top'}]}
                            autoCapitalize={'words'}
                            multiline={true}
                            numberOfLines={3}
                            value={this.state.imageAnnotation}
                            placeholderTextColor={'#E0E0E0'}
                            onChangeText={(text) => this.setState({imageAnnotation: text})} />
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
        if (this.state.image) {
            var image = this.guid()+'.jpg';
            RNFS.writeFile(RNFS.ExternalDirectoryPath+'/patient/'+image, this.state.image, 'base64').then((success) => {
                db.transaction((tx) => {
                    var insertID = this.state.mobileID*100000;
                    tx.executeSql("SELECT id FROM patientImages WHERE id BETWEEN "+insertID+" AND "+((insertID*2)-1)+" ORDER BY created_at DESC LIMIT 1", [], (tx, rs) => {
                        if (rs.rows.length > 0)
                            insertID = rs.rows.item(0).id + 1;
                        var values = {
                            id: insertID,
                            patientID: this.props.patientID,
                            assocRecordID: this.props.diagnosisID,
                            image: image,
                            image1: null,
                            imageAnnotation: this.state.imageAnnotation,
                            forDisplay: null,
                            imageType: 'jpg',
                            imageModule: 'diagnosis',
                            deleted_at: '',
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                        }
                        tx.executeSql("INSERT INTO patientImages (`id`, `patientID`, `assocRecordID`, `image`, `image1`, `imageAnnotation`, `forDisplay`, `imageType`, `imageModule`, `deleted_at`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", _.values(values), (tx, rs) => {
                            console.log("created: " + rs.rowsAffected);
                        })
                    })
                }, (err) => {
                    alert(err.message)
                }, () => {
                    this.props.navigator.replacePreviousAndPop({
                        id: 'ImagePage',
                        passProps: {
                            diagnosisID: this.props.diagnosisID,
                            patientID: this.props.patientID,
                            patientAvatar: this.props.patientAvatar,
                            patientName: this.props.patientName
                        },
                    })
                    ToastAndroid.show("Imaging successfully created!", 3000)
                })
            }).catch((err) => {
                alert(err.message)
                ToastAndroid.show("Error occured while creating image!", 3000)
            });
        } else {
            ToastAndroid.show('Invalid image available!', 1000)
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
        height: 48,
        width: 48,
        borderRadius: 30,
        margin: 5,
        marginRight: 10,
    },
    avatarIcon: {
        margin: 0,
    },
    loading: {
        alignItems: 'center',
        width: width,
    },
    progress: {
        width: width,
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
})

var NavigationBarRouteMapper = (patientID, patientName, avatar) => ({
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
        return null
    },
    Title(route, navigator, index, nextState) {
        return (
            <TouchableOpacity style={[Styles.title, {marginLeft: 50}]}>
                <Text style={[Styles.titleText]}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = AddImage;

'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, View, TouchableNativeFeedback, TouchableHighlight, Image, StatusBar, ScrollView, Navigator, TouchableOpacity, AsyncStorage} from 'react-native'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Env from '../env'
import RNFS from 'react-native-fs'

import Styles from '../assets/Styles'
const EnvInstance = new Env()
const db = EnvInstance.db()

class DrawerPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            avatar: false,
        }
    }
    componentDidMount() {
        this.updateCredentials().done();
    }
    componentWillReceiveProps(nextProps) {
        if (_.size(nextProps.navigator.getCurrentRoutes(0)) > 1) {
            this.setState({lastRoute: nextProps.navigator.getCurrentRoutes(0)[1].id})
        } else {
            if (this.state.lastRoute == 'EditUserProfile' || this.state.lastRoute == 'EditUserSetting') {
                this.setState({lastRoute: ''});
                this.updateCredentials().done();
            }
        }
    }
    onRefresh() {
        db.transaction((tx) => {
            tx.executeSql("SELECT imagePath FROM doctors WHERE id=? LIMIT 1", [this.state.doctorID], (tx, rs) => {
                db.data = rs.rows.item(0)
            })
        }, (err) => {
            alert(err.message)
        }, () => {
            RNFS.exists(db.data.imagePath).then((exist) => {
                if (exist)
                    RNFS.readFile(db.data.imagePath, 'base64').then((rs) => {
                        this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')})
                    })
            })
        })
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            this.setState({
                userID: JSON.parse(doctor).userID,
                doctorID: JSON.parse(doctor).id,
                doctorName: JSON.parse(doctor).name,
                doctorType: JSON.parse(doctor).type,
                doctorInitial: JSON.parse(doctor).initial,
                cloudUrl: JSON.parse(doctor).cloudUrl,
            })
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            this.onRefresh();
        }
    }
    render() {
        return (
            <ScrollView>
                <View style={styles.drawerView}>
                    {(this.state.avatar) ? (
                        <Image
                            style={{height: 200, width: 300, overlayColor: 'rgba(0,0,0,1)'}}
                            source={{uri: this.state.avatar}}
                            resizeMode={'cover'}>
                            <View style={{position: 'absolute', height: 200, width: 300, backgroundColor: 'rgba(0,0,0,0.25)'}}></View>
                            <View style={styles.drawerImageContainer}>
                                <View style={{borderRadius: 40, width: 80, marginTop: 6, marginBottom: 10}}>
                                    <Image
                                        style={[styles.drawerImageAvatar, {borderRadius: 40}]}
                                        source={{uri: this.state.avatar}}/>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{flex: 1, flexDirection: 'column'}}>
                                        <Text style={styles.drawerImageName}>{this.state.doctorName}</Text>
                                        <Text style={styles.drawerImageEmail}>{this.state.doctorInitial} / {this.state.doctorType}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={{justifyContent: 'center', width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 30}}
                                        onPress={() => this.props.navigator.replace({
                                            id: 'UserProfilePage',
                                            passProps: {
                                                userID: this.state.userID,
                                                doctorID: this.state.doctorID,
                                                doctorName: this.state.doctorName,
                                            }
                                        })
                                        }>
                                        <Icon name={'arrow-drop-down'} size={25} color={'#FFF'} style={{textAlign: 'center', textAlignVertical: 'center'}}/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Image>
                        ) : (
                        <View style={{flexDirection: 'row', padding: 16, paddingTop: 40, backgroundColor: '#2979FF'}}>
                            <View style={{flex: 1, flexDirection: 'column'}}>
                                <Text style={[styles.drawerImageName]}>{this.state.doctorName}</Text>
                                <Text style={[styles.drawerImageEmail]}>{this.state.doctorInitial} / {this.state.doctorType}</Text>
                            </View>
                            <TouchableOpacity
                                style={{justifyContent: 'center', width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 30}}
                                onPress={() => this.props.navigator.replace({
                                    id: 'UserProfilePage',
                                    passProps: {
                                        userID: this.state.userID,
                                        doctorID: this.state.doctorID,
                                        doctorName: this.state.doctorName,
                                    }
                                })
                                }>
                                <Icon name={'arrow-drop-down'} size={25} color={'#FFF'} style={{textAlign: 'center', textAlignVertical: 'center'}}/>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={[styles.drawerContainer, {marginTop: 5}]}>
                        <TouchableNativeFeedback
                            onPress={() => this.props.navigator.replace({
                                id: 'AppointmentPage',
                            })
                            }>
                            <View style={[styles.drawerViewWrapper, {backgroundColor: (this.props.routeName == 'appointments') ? '#EEEEEE' : '#FFFFFF'}]}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='assignment' style={[styles.icon, {color: '#4CAF50'}]} />
                                </View>
                                <Text style={styles.drawerViewText}>Appointments</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback
                            onPress={() => this.props.navigator.replace({
                                id: 'PatientPage',
                            })
                            }>
                            <View style={[styles.drawerViewWrapper, {backgroundColor: (this.props.routeName == 'patients') ? '#EEEEEE' : '#FFFFFF'}]}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='group' style={[styles.icon, {color: '#2979FF'}]}/>
                                </View>
                                <Text style={styles.drawerViewText}>Patients</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <View style={{marginTop: 5, marginBottom: 5, borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0'}}></View>
                        <Text style={[styles.drawerLabel]}>Syncing (<Text style={{fontStyle: 'italic'}}>{(this.state.cloudUrl) ? this.state.cloudUrl : '-'}</Text>)</Text>
                        <TouchableNativeFeedback>
                            <View style={[styles.drawerViewWrapper, {opacity: (this.state.cloudUrl) ? 1 : 0.2, backgroundColor: (this.props.routeName == 'imports') ? '#EEEEEE' : '#FFFFFF'}]}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='cloud-download' style={[styles.icon, {color: '#FF5722'}]} />
                                </View>
                                <Text style={styles.drawerViewText}>Import to Cloud</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback>
                            <View style={[styles.drawerViewWrapper, {opacity: (this.state.cloudUrl) ? 1 : 0.2, backgroundColor: (this.props.routeName == 'exports') ? '#EEEEEE' : '#FFFFFF'}]}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='cloud-upload' style={[styles.icon, {color: '#01579B'}]} />
                                </View>
                                <Text style={styles.drawerViewText}>Export to Cloud</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <View style={{marginTop: 5, marginBottom: 5, borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0'}}></View>
                        <Text style={styles.drawerLabel}>Dashboard</Text>
                        <TouchableNativeFeedback
                            onPress={() => this.props.navigator.replace({
                                id: 'UserSettingPage',
                                passProps: {
                                    userID: this.state.userID,
                                    doctorID: this.state.doctorID,
                                    doctorName: this.state.doctorName,
                                }
                            })
                        }>
                            <View style={[styles.drawerViewWrapper, {backgroundColor: (this.props.routeName == 'settings') ? '#EEEEEE' : '#FFFFFF'}]}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='settings' style={styles.icon} />
                                </View>
                                <Text style={styles.drawerViewText}>Settings</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback
                            onPress={() => this.props.navigator.replace({
                                id: 'LoginPage',
                                sceneConfig: Navigator.SceneConfigs.FadeAndroid
                            })
                        }>
                            <View style={styles.drawerViewWrapper}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='exit-to-app' style={styles.icon} />
                                </View>
                                <Text style={styles.drawerViewText}>Logout</Text>
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            </ScrollView>
        )
    }

}

module.exports = DrawerPage

const styles = StyleSheet.create({
    drawerImageContainer: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 25,
        marginLeft: 16,
        marginRight: 16,
    },
    drawerImageAvatar: {
        height: 80,
        width: 80,
    },
    drawerImageName: {
        color: '#FFF',
        fontSize: 18,
    },
    drawerImageEmail: {
        color: '#FFF',
    },
    drawerView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        marginBottom: 0,
    },
    drawerContainer: {
        marginTop: 0,
        flex: 1,
    },
    drawerLabel: {
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 16,
        color: '#424242',
        fontWeight: 'bold'
    },
    drawerViewWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
        height: 45,
    },
    drawerViewText: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#424242',
        textAlignVertical: 'center',
    },
    iconWrapper: {
        borderRadius: 2,
        marginRight: 30
    },
    icon: {
        textAlignVertical: 'center',
        textAlign: 'center',
        width: 30,
        paddingTop: 2,
        paddingBottom: 2,
        color: '#757575',
        fontSize: 28,
    },
})

module.exports = DrawerPage

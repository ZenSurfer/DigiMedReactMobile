'use strict'

import React, {Component} from 'react'
import {AppRegistry, Navigator, BackAndroid, DeviceEventEmitter, AsyncStorage} from 'react-native'
import FCM from 'react-native-fcm'
import routes from './app/routes'
import _ from 'lodash'
import env from './app/env'

class AwesomeProject extends Component {
    constructor(props) {
        super(props)
        this.state = {
            completed: false,
            initialRoute: 'SplashPage',
            passProps: {},
        }
        this.navInstance = {}
    }
    componentDidMount() {
        FCM.requestPermissions();
        this.notificationUnsubscribe = FCM.on('notification', (notif) => {
            if (!_.isUndefined(notif['fcm'])) {
                FCM.presentLocalNotification({
                    title: notif.fcm.title,
                    body:  notif.fcm.body,
                    large_icon: "ic_notification",
                    icon: 'ic_notification',
                    show_in_foreground: true,
                    priority: "high",
                });
                if (notif.local_notification || notif.opened_from_tray) {
                    console.log(notif)
                    this.updateCredentials().then(data => {
                        if (data.validate) {
                            if (notif.title === 'Laboratory') {
                                this.navInstance.push({
                                    id: 'CompletedOrder',
                                    passProps: {userID: data.userID},
                                    sceneConfig: Navigator.SceneConfigs.FadeAndroid
                                })
                            } else if (notif.title === 'Doctor Referral') {
                                this.navInstance.push({
                                    id: 'ReferralPage',
                                    passProps: {doctorID: data.doctorID},
                                    sceneConfig: Navigator.SceneConfigs.FadeAndroid
                                })
                            }
                        } else {
                            this.navInstance.replace({
                                id: 'LoginPage',
                                sceneConfig: Navigator.SceneConfigs.FadeAndroid
                            })
                        }
                    });
                }
            }
        });
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            if (!_.isNull(doctor))
                return {
                    validate: true,
                    userID: JSON.parse(doctor).userID,
                    doctorID: JSON.parse(doctor).id,
                }
            else
                return {validate: false}
        } catch (error) {
            return {validate: false}
        }
    }
    componentWillUnmount() {
        this.notificationUnsubscribe();
    }
    render() {
        return (
            <Navigator
                ref={ref => this.navInstance = ref}
                initialRoute={{id: 'SplashPage'}}
                renderScene={this.renderScene.bind(this)}
                configureScene={(route) => {
                    if (route.sceneConfig) {
                        return route.sceneConfig
                    }
                    return Navigator.SceneConfigs.PushFromRight
                }}/>
        )
    }
    renderScene(route, navigator) {
        BackAndroid.addEventListener('hardwareBackPress', function() {
            console.log(navigator.getCurrentRoutes(0))
            if (route.id === 'DoctorPage' || route.id === 'LoginPage' || route.id === 'AppointmentPage' || route.id === 'StepOne' || route.id === 'SplashPage' || route.id === 'ImportPage' || route.id === 'ExportPage' || route.id === 'CompletedOrder' || route.id === 'PendingOrder' || route.id === 'ReferralPage' || route.id === 'PatientPage' || route.id === 'UserProfilePage' || route.id === 'UserSettingPage') {
                return true;
            } else {
                navigator.pop();
                return true;
            }
        });
        return routes(route, navigator, this)
    }
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject)

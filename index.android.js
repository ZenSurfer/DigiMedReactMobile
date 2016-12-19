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
        }
    }
    componentDidMount() {
        this.updateCredentials().then(doctor => {
            FCM.requestPermissions();
            this.notificationUnsubscribe = FCM.on('notification', (notif) => {
                console.log(doctor)
                if (!_.isUndefined(notif['fcm'])) {
                    FCM.presentLocalNotification({
                        title: notif.fcm.title,
                        body:  notif.fcm.body,
                        show_in_foreground: true,
                        priority: "high",
                    });
                }
                if(notif.local_notification){
                    if (!_.isUndefined(doctor)) {
                        this.nav.replace({
                            id: 'CompletedOrder',
                            passProps: {
                                userID: doctor.userID,
                            },
                            sceneConfig: Navigator.SceneConfigs.FadeAndroid
                        })
                    }
                }
                if(notif.opened_from_tray){
                    if (!_.isUndefined(doctor)) {
                        this.nav.replace({
                            id: 'CompletedOrder',
                            passProps: {
                                userID: doctor.userID,
                            },
                            sceneConfig: Navigator.SceneConfigs.FadeAndroid
                        })
                    }
                }
            });
            this.refreshUnsubscribe = FCM.on('refreshToken', (token) => {
                console.log('token', token)
            });
        }).done();
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            return  JSON.parse(doctor)
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        }
    }
    componentWillUnmount() {
        this.refreshUnsubscribe();
        this.notificationUnsubscribe();
    }
    otherMethods(){
        FCM.subscribeToTopic('/topics/foo-bar');
        FCM.unsubscribeFromTopic('/topics/foo-bar');
        FCM.getInitialNotification().then(notif=>console.log(notif));
        FCM.presentLocalNotification({
            id: "UNIQ_ID_STRING",                               // (optional for instant notification)
            title: "My Notification Title",                     // as FCM payload
            body: "My Notification Message",                    // as FCM payload (required)
            sound: "default",                                   // as FCM payload
            priority: "high",                                   // as FCM payload
            click_action: "ACTION",                             // as FCM payload
            badge: 10,                                          // as FCM payload IOS only, set 0 to clear badges
            number: 10,                                         // Android only
            ticker: "My Notification Ticker",                   // Android only
            auto_cancel: true,                                  // Android only (default true)
            large_icon: "ic_launcher",                           // Android only
            icon: "ic_notification",                            // as FCM payload
            big_text: "Show when notification is expanded",     // Android only
            sub_text: "This is a subText",                      // Android only
            color: "red",                                       // Android only
            vibrate: 300,                                       // Android only default: 300, no vibration if you pass null
            tag: 'some_tag',                                    // Android only
            group: "group",                                     // Android only
            my_custom_data:'my_custom_field_value',             // extra data you want to throw
            lights: true,                                       // Android only, LED blinking (default false)
            show_in_foreground                                  // notification when app is in foreground (local & remote)
        });

        FCM.scheduleLocalNotification({
            fire_date: new Date().getTime(),      //RN's converter is used, accept epoch time and whatever that converter supports
            id: "UNIQ_ID_STRING",    //REQUIRED! this is what you use to lookup and delete notification. In android notification with same ID will override each other
            body: "from future past",
            repeat_interval: "week" //day, hour
        })

        FCM.getScheduledLocalNotifications().then(notif=>console.log(notif));
        FCM.cancelLocalNotification("UNIQ_ID_STRING");
        FCM.cancelAllLocalNotifications();
        FCM.setBadgeNumber();
        FCM.getBadgeNumber().then(number=>console.log(number));
    }
    render() {
        return (
            <Navigator
                ref={nav => this.nav = nav}
                initialRoute={{id: 'LoginPage'}}
                renderScene={this.renderScene.bind(this)}
                configureScene={(route) => {
                    if (route.sceneConfig) {
                        return route.sceneConfig
                    }
                    return Navigator.SceneConfigs.PushFromRight
                }} />
        )
    }
    renderScene(route, navigator) {
        BackAndroid.addEventListener('hardwareBackPress', function() {
            if (route.id !== 'PatientPage') {
                navigator.pop();
                return true;
            }
            return false
        });
        return routes(route, navigator, this)
    }
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject)

'use strict';

import React, {Component} from 'react'
import {StyleSheet, Text, View, Navigator, TouchableHighlight, TouchableOpacity, TextInput, Image, Dimensions, ScrollView, TouchableNativeFeedback, ActivityIndicator, ToastAndroid, AsyncStorage} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import RNFS from 'react-native-fs'
import Styles from '../assets/Styles'
import bcrypt from 'react-native-bcrypt'
import Env from '../env'
import FCM from 'react-native-fcm';

const dirPath = RNFS.ExternalDirectoryPath
const EnvInstance = new Env()
const db = EnvInstance.db()

class LoginPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: '',
            cloudUrl: '',
            auth: false,
            visibility: false,
        }
    }
    componentDidMount() {
        this.removeCredentials().done();
    }
    async removeCredentials() {
        try {
            var doctor = await AsyncStorage.removeItem('doctor');
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        }
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#2962FF'}}>
                {this.props.children}
                <View style={{flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', }}>
                    <ScrollView
                        keyboardShouldPersistTaps={true}>
                        <View style={[styles.scrollViewWrapper]}>
                            <View style={styles.imageWrapper}>
                                <Image
                                    style={{width: 300, height: 160}}
                                    resizeMode={'contain'}
                                    source={require('../assets/images/logo.png')}
                                />
                            </View>
                            <View style={{alignItems: 'center'}}>
                                <View style={[styles.textInputWrapper, {width: 300}]}>
                                    <TextInput
                                        placeholder={'Username'}
                                        style={[styles.textInput,{color: '#FFF', textAlign: 'center'}]}
                                        value={this.state.username}
                                        placeholderTextColor={'#90CAF9'}
                                        underlineColorAndroid={'#2979FF'}
                                        onChangeText={(text) => this.setState({username: text})}
                                        returnKeyType={'next'}/>
                                    <View>
                                        <TextInput
                                            placeholder={'Password'}
                                            style={[styles.textInput,{color: '#FFF', textAlign: 'center'}]}
                                            value={this.state.password}
                                            secureTextEntry={!this.state.visibility}
                                            placeholderTextColor={'#90CAF9'}
                                            underlineColorAndroid={'#2979FF'}
                                            onChangeText={(text) => this.setState({password: text})}
                                            returnKeyType={'next'}/>
                                        {(this.state.visibility) ? (
                                            <TouchableOpacity
                                                style={{position: 'absolute', top: 0, height: 50, right: 0, flex: 1, justifyContent: 'center'}}
                                                onPress={() => this.setState({visibility: false})}>
                                                <Icon size={25} name={'visibility-off'} color={'#90CAF9'} style={{padding: 10}}/>
                                            </TouchableOpacity>
                                            ) : (
                                            <TouchableOpacity
                                                style={{position: 'absolute', top: 0, height: 50, right: 0, flex: 1, justifyContent: 'center'}}
                                                onPress={() => this.setState({visibility: true})}>
                                                <Icon size={25} name={'visibility'} color={'#90CAF9'} style={{padding: 10}}/>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <TextInput
                                        placeholder={'Cloud Server (Optional)'}
                                        style={[styles.textInput,{color: '#FFF', textAlign: 'center'}]}
                                        value={this.state.cloudUrl}
                                        placeholderTextColor={'#90CAF9'}
                                        underlineColorAndroid={'#2979FF'}
                                        onChangeText={(text) => this.setState({cloudUrl: text})}
                                        returnKeyType={'next'}/>
                                    <View style={[{flexDirection: 'column'}]}>
                                        {(!this.state.auth) ? (
                                            <TouchableNativeFeedback
                                                onPress={() => {
                                                    this.setState({auth: true})
                                                    db.transaction((tx) => {
                                                        db.passed = false;
                                                        tx.executeSql("SELECT `doctors`.`userID`, `doctors`.`id`, ('Dr. ' || `doctors`.`firstname` || ' ' || `doctors`.`middlename` || ' ' || `doctors`.`lastname`) as name, `doctors`.`type`, `doctors`.`initial`, `users`.`password` FROM `users` LEFT OUTER JOIN `doctors` ON `doctors`.`userID`=`users`.`id` WHERE `users`.`username`=? AND `users`.`userType`='doctor' AND `users`.`accountVerified`=1 AND (`users`.`deleted_at` in (null, 'NULL', '') OR `users`.`deleted_at` is null) LIMIT 1", [this.state.username], (tx, rs) => {
                                                            if (bcrypt.compareSync(this.state.password, rs.rows.item(0).password)) {
                                                                db.data = rs.rows.item(0);
                                                                db.passed = true;
                                                                console.log('passed');
                                                            }
                                                        })
                                                    }, (err) => {
                                                        alert(err.message)
                                                    }, () => {
                                                        if(db.passed) {
                                                            var doctor = _.omit(db.data, ['password']);
                                                            doctor['cloudUrl'] = this.state.cloudUrl;
                                                            AsyncStorage.setItem('doctor', JSON.stringify(doctor))
                                                            this.props.navigator.replace({
                                                                id: 'SplashPage',
                                                                sceneConfig: Navigator.SceneConfigs.FadeAndroid
                                                            })
                                                            this.setState({auth: false})
                                                        } else {
                                                            ToastAndroid.show('Invalid username / password!', 1000);
                                                            this.setState({auth: false})
                                                        }
                                                    })
                                                }}>
                                                <View style={[Styles.coloredButton, styles.button, {marginBottom: 0}]}>
                                                    <Text style={{color: '#FFF'}}>LOGIN</Text>
                                                </View>
                                            </TouchableNativeFeedback>
                                            ) : (
                                            <View style={[Styles.coloredButton, styles.button, {marginBottom: 0}]}>
                                                <Text style={{color: '#FFF'}}>AUTHENTICATING</Text>
                                            </View>
                                        )}
                                        <TouchableNativeFeedback>
                                            <View style={[Styles.coloredButton, styles.button, {backgroundColor: '#2962FF', marginTop: 0}]}>
                                                <Text style={{color: '#90CAF9'}}>FORGET PASSWORD</Text>
                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>
                                    {(this.state.auth) ? (
                                        <View style={{position: 'absolute', height: 150, width: 280, top: 0}}>
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2962FF', paddingBottom: 20}}>
                                                <ActivityIndicator animating={true} size={'large'} color={'#FFF'}/>
                                            </View>
                                        </View>
                                    ) : (<View/>)}
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    button: {
        height: 50,
        backgroundColor: '#2979FF',
        elevation: 0,
    },
    scrollViewWrapper: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    label: {
        color: '#FFF',
        textAlign: 'left',
        marginLeft: 16,
        marginRight: 16,
    },
    imageWrapper: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInputWrapper: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 6,
        paddingBottom: 6,
        marginLeft: 16,
        marginRight: 16,
        marginTop: 5,
    },
    textInput: {
        fontSize: 17,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 10,
        paddingRight: 10,
        height: 50,
    },
})

module.exports = LoginPage;

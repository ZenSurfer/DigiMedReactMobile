'use strict';

import React, {Component} from 'react'
import {Text, View, Navigator, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, AsyncStorage, ToastAndroid, ProgressBarAndroid, Animated, Easing, TextInput, TouchableNativeFeedback} from 'react-native'
import RNFS from 'react-native-fs'
import Schema from '../database/schema.js'
import Populate from '../database/values.js'
import Demo from '../database/testDB.js'
import Styles from '../assets/Styles.js'
import Env from '../env.js'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/MaterialIcons'
import * as Animatable from 'react-native-animatable';

const EnvInstance = new Env()
const db = EnvInstance.db()

class VerifyPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: '',
            code : '',
            emailVerified: false,
            verifying: false,
        }
    }
    emailVerified() {
        this.setState({verifying: true})
        this.pull('emailverification', this.jsonToQueryString({
            email: this.state.email,
            userID: this.props.doctorUserID,
        })).then((data) => {
            console.log(data)
            if (data.success)
                this.setState({verifying: false, emailVerified: true})
            else {
                ToastAndroid.show('Email missmatched!', 1000)
                this.setState({verifying: false})
            }
        }).done()
    }
    codeVerified() {
        this.setState({verifying: true})
        this.pull('codeverification', this.jsonToQueryString({
            code: this.state.code,
            userID: this.props.doctorUserID,
        })).then((data) => {
            if (data.success) {
                this.setState({verifying: false})
                this.props.navigator.replace({
                    id: 'SplashPage',
                    passProps: {
                        initial: true,
                        doctorUserID: this.props.doctorUserID,
                    },
                    sceneConfig: Navigator.SceneConfigs.FadeAndroid
                })
            } else
                this.setState({verifying: false})
        }).done()
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#2962FF', alignItems: 'center', justifyContent: 'center'}}>
                {this.props.children}
                {(this.state.emailVerified) ? (
                    <View style={{flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',}}>
                        <Animatable.Text
                            animation="pulse"
                            iterationCount={'infinite'}
                            easing="ease-out">
                            <Icon name={'code'}  size={100} color={'#FFF'}/>
                        </Animatable.Text>
                        <View style={[styles.textInputWrapper, {width: 300}]}>
                            {(this.state.verifying) ? (
                                <View>
                                    <ActivityIndicator animating={true} size={'large'} color={'#FFF'} style={{height: 50}}/>
                                    <View style={[styles.button, {marginBottom: 0}]}>
                                        <Text style={{color: '#FFF'}}>VERIFYING CODE</Text>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <TextInput
                                        placeholder={'Verification Code'}
                                        style={[styles.textInput,{color: '#FFF', textAlign: 'center'}]}
                                        value={this.state.code}
                                        placeholderTextColor={'#90CAF9'}
                                        underlineColorAndroid={'#2979FF'}
                                        onChangeText={(text) => this.setState({code: text})}/>
                                    <TouchableNativeFeedback
                                        onPress={() => this.codeVerified()}>
                                        <View style={[styles.button, {marginBottom: 0}]}>
                                            <Text style={{color: '#FFF'}}>VERIFY</Text>
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            <TouchableNativeFeedback onPress={() => this.props.navigator.replace({
                                    id: 'LoginPage',
                                    sceneConfig: Navigator.SceneConfigs.FadeAndroid
                                })}>
                                <View style={[styles.button, {backgroundColor: '#2962FF', marginTop: 0}]}>
                                    <Text style={{color: '#90CAF9'}}>LOGIN</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                ) : (
                    <View style={{flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',}}>
                        <Animatable.Text
                            animation="pulse"
                            iterationCount={'infinite'}
                            easing="ease-out">
                            <Icon name={'link'}  size={100} color={'#FFF'}/>
                        </Animatable.Text>
                        <View style={[styles.textInputWrapper, {width: 300}]}>
                            {(this.state.verifying) ? (
                                <View>
                                    <ActivityIndicator animating={true} size={'large'} color={'#FFF'} style={{height: 50}}/>
                                    <View style={[styles.button, {marginBottom: 0}]}>
                                        <Text style={{color: '#FFF'}}>VERIFYING EMAIL ADDRESS</Text>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <TextInput
                                        placeholder={'Email Address'}
                                        style={[styles.textInput,{color: '#FFF', textAlign: 'center'}]}
                                        value={this.state.email}
                                        keyboardType={'email-address'}
                                        placeholderTextColor={'#90CAF9'}
                                        underlineColorAndroid={'#2979FF'}
                                        onChangeText={(text) => this.setState({email: text})}
                                        returnKeyType={'next'}/>
                                    <TouchableNativeFeedback
                                        onPress={() => this.emailVerified()}>
                                        <View style={[styles.button, {marginBottom: 0}]}>
                                            <Text style={{color: '#FFF'}}>SEND VERIFICATION CODE</Text>
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            <TouchableNativeFeedback onPress={() => this.props.navigator.replace({
                                    id: 'LoginPage',
                                    sceneConfig: Navigator.SceneConfigs.FadeAndroid
                                })}>
                                <View style={[styles.button, {backgroundColor: '#2962FF', marginTop: 0}]}>
                                    <Text style={{color: '#90CAF9'}}>LOGIN</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                )}
            </View>
        );
    }
    async pull(link, param) {
        console.log(EnvInstance.cloudUrl+'/api/v2/'+link+'?'+param)
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/'+link+'?'+param).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(err.message)
        }
    }
    jsonToQueryString(json) {
        return Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
        }).join('&');
    }
}

var styles = StyleSheet.create({
    loading: {
        alignItems: 'stretch',
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        backgroundColor: '#2979FF',
        elevation: 0,
        marginTop: 5,
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

module.exports = VerifyPage;

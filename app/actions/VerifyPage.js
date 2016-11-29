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
            code : '',
        }
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#2962FF', alignItems: 'center', justifyContent: 'center'}}>
                {this.props.children}
                <View style={{flexDirection: 'row', justifyContent: 'space-between', }}>
                    <View style={[styles.textInputWrapper, {width: 300}]}>
                        <TextInput
                            placeholder={'Verification Code'}
                            style={[styles.textInput,{color: '#FFF', textAlign: 'center'}]}
                            value={this.state.code}
                            placeholderTextColor={'#90CAF9'}
                            underlineColorAndroid={'#2979FF'}
                            onChangeText={(text) => this.setState({code: text})}
                            returnKeyType={'next'}/>
                        <TouchableNativeFeedback>
                            <View style={[Styles.coloredButton, styles.button, {marginBottom: 0}]}>
                                <Text style={{color: '#FFF'}}>VERIFY</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback onPress={() => this.props.navigator.replace({
                                id: 'LoginPage',
                                sceneConfig: Navigator.SceneConfigs.FadeAndroid
                            })}>
                            <View style={[Styles.coloredButton, styles.button, {backgroundColor: '#2962FF', marginTop: 0}]}>
                                <Text style={{color: '#90CAF9'}}>LOGIN</Text>
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            </View>
        );
    }
    async pull(param) {
        try {
            return await fetch(this.state.cloudUrl+'/api/v2/pull?'+param).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(err.message)
        }
    }
}

var styles = StyleSheet.create({
    loading: {
        alignItems: 'stretch',
    },
    button: {
        height: 50,
        backgroundColor: '#2979FF',
        elevation: 0,
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

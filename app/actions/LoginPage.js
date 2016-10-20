'use strict';

import React, {Component} from 'react'
import {StyleSheet, Text, View, Navigator, TouchableHighlight, TouchableOpacity, TextInput, Image, Dimensions, ScrollView} from 'react-native'
import _ from 'lodash'
import RNFS from 'react-native-fs'
import Styles from '../assets/Styles'

const dirPath = RNFS.ExternalDirectoryPath
const {height, width} = Dimensions.get('window');

class LoginPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: '',
            cloudUrl: '',
        }
    }
    render() {
        return (
            <Navigator
                renderScene={this.renderScene.bind(this)}
                />
        );
    }
    renderScene(route, navigator) {
        return (
            <View style={{flex: 1, backgroundColor: '#2979FF'}}>
                {this.props.children}
                <ScrollView>
                    <View style={styles.scrollViewWrapper}>
                        <View style={styles.imageWrapper}>
                          <Image
                              style={{width: 300, height: 160}}
                              resizeMode={'contain'}
                              source={require('../assets/images/logo.png')}
                              />
                        </View>
                        <View style={styles.textInputWrapper}>
                            <TextInput
                                placeholder={'Username'}
                                style={styles.textInput}
                                value={this.state.username}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({username: text})}
                                returnKeyType={'next'}/>
                            <TextInput
                                placeholder={'Password'}
                                style={styles.textInput}
                                value={this.state.password}
                                secureTextEntry={true}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({password: text})}
                                returnKeyType={'next'}/>
                            <TextInput
                                placeholder={'Cloud Url'}
                                style={styles.textInput}
                                value={this.state.cloudUrl}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({cloudUrl: text})}
                                returnKeyType={'next'}/>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <TouchableOpacity
                                style={[Styles.coloredButton, styles.button]}
                                onPress={this.gotoNext.bind(this)}>
                                <Text style={{color: '#FFF'}}>LOGIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
    gotoNext() {
        this.props.navigator.replace({
            id: 'SplashPage',
            sceneConfig: Navigator.SceneConfigs.FadeAndroid
        });
    }
}

var styles = StyleSheet.create({
    button: {
        height: 50,
        marginLeft: 16,
        marginRight: 16,
        backgroundColor: '#00C853'
    },
    scrollViewWrapper: {
        height: (height - 40),
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
        width: width,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInputWrapper: {
        backgroundColor: '#FFF',
        borderRadius: 2,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 6,
        paddingBottom: 6,
        marginLeft: 16,
        marginRight: 16,
        elevation: 1,
        marginTop: 5,
    },
    textInput: {
        fontSize: 16,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 10,
        paddingRight: 10,
        height: 50,
    },
})

module.exports = LoginPage;

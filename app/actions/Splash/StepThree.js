'use strict';

import React, {Component} from 'react'
import {Text, Image, View, Navigator, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, AsyncStorage, ToastAndroid, ProgressBarAndroid, Animated, Easing, NetInfo} from 'react-native'
import moment from 'moment'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Styles from '../../assets/Styles.js'

class StepThree extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#435F8E', alignItems: 'center', justifyContent: 'center'}}>
                {this.props.children}
                <View style={{flex: 1, alignItems: 'stretch', justifyContent: 'center', marginBottom: 60}}>
                    <Image
                        style={{width: 300}}
                        resizeMode={'contain'}
                        source={require('./../../assets/images/laboratory.jpg')}
                    />
                </View>
                <View style={{position: 'absolute', bottom: 0, flex: 1, flexDirection: 'row'}}>
                    <View style={{flex: 1, alignItems: 'stretch', flexDirection: 'column'}}>
                        <View style={{flex: 1, padding: 16, borderBottomWidth: 0.5, borderColor: '#FFF', paddingBottom: 30}}>
                            <Text style={{color: '#FFF', textAlign: 'center', fontSize: 16}}>Laboratory tests check a sample of your blood, urine, or body tissues. A technician or your doctor analyzes the test samples to see if your results fall within the normal range.</Text>
                        </View>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <TouchableOpacity
                                style={{padding: 16}}
                                onPress={() => this.props.navigator.pop()}>
                                <View style={{width: 80, flexDirection: 'row', justifyContent: 'flex-start'}}>
                                    <Icon color={'#FFF'} size={25} name={'navigate-before'} />
                                    <Text style={{textAlign: 'right', color: '#FFF', textAlignVertical: 'center'}}>PREV</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center'}}>
                                <Icon color={'#FFF'} size={8} name={'lens'} style={{marginLeft: 2, marginRight: 2, textAlignVertical: 'center'}}/>
                                <Icon color={'#FFF'} size={8} name={'lens'} style={{marginLeft: 2, marginRight: 2, textAlignVertical: 'center'}}/>
                                <Icon color={'#FFF'} size={8} name={'adjust'} style={{marginLeft: 2, marginRight: 2, textAlignVertical: 'center'}}/>
                            </View>
                            <TouchableOpacity
                                style={{padding: 16, justifyContent: 'center'}}
                                onPress={() => this.props.navigator.push({
                                    id: 'LoginPage',
                                    sceneConfig: Navigator.SceneConfigs.FloatFromBottomAndroid
                                })}>
                                <Text style={{width: 80, textAlign: 'right', textAlignVertical: 'center', color: '#FFF'}}>LOGIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    loading: {
        alignItems: 'stretch',
    }
})

module.exports = StepThree;

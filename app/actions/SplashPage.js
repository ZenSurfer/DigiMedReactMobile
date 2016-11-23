'use strict';

import React, {Component} from 'react'
import {Text, View, Navigator, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, AsyncStorage, ToastAndroid, ProgressBarAndroid} from 'react-native'
import SQLite from 'react-native-sqlite-storage'
import RNFS from 'react-native-fs'
import Schema from '../database/schema.js'
import Populate from '../database/values.js'
import Demo from '../database/testDB.js'
import Styles from '../assets/Styles.js'
import Env from '../env.js'
import _ from 'lodash'

const {height, width} = Dimensions.get('window');
const EnvInstance = new Env()
const db = EnvInstance.db()

class SplashPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            progress: 0,
            title: 'Validating Requirements...',
        }
    }
    componentWillMount() {
        RNFS.mkdir(RNFS.ExternalDirectoryPath + '/patient')
        RNFS.mkdir(RNFS.ExternalDirectoryPath + '/avatar')
    }
    componentDidMount() {
        if (this.props.initial)
            this.initial();
        else
            this.updateCredentials().done();
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            this.setState({
                doctorID: JSON.parse(doctor).id,
                doctorUserID: JSON.parse(doctor).userID,
                cloudUrl: JSON.parse(doctor).cloudUrl,
            })
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            this.validate();
        }
    }
    initial() {
        this.setState({title: 'Initial Configuration...'})
        db.transaction(function(tx) {
            _.forEach(Schema, (v, i) => {
                tx.executeSql(v, [], (rs) => {console.log('title: '+i)});
            })
        }, (error) => { console.log('Transaction ERROR: ' + error.message);
        }, () => {
            // setTimeout(() => {
            //     this.props.navigator.replace({
            //         // id: 'MainPage',
            //         id: 'AppointmentPage',
            //         sceneConfig: Navigator.SceneConfigs.FadeAndroid
            //     });
            // }, 1000);
            console.log(this.state)
            ToastAndroid.show('Initial', 1000);
        });
        console.log('initial');
    }
    validate() {
        this.setState({title: 'Validating Requirements...'})
        db.transaction(function(tx) {
            _.forEach(Schema, (v, i) => {
                tx.executeSql("DROP TABLE IF EXISTS "+i);
                // tx.executeSql(v, [], (rs) => {console.log('title: '+i)});
            })
        }, (error) => { console.log('Transaction ERROR: ' + error.message);
        }, () => {
            // setTimeout(() => {
            //     this.props.navigator.replace({
            //         // id: 'MainPage',
            //         id: 'AppointmentPage',
            //         sceneConfig: Navigator.SceneConfigs.FadeAndroid
            //     });
            // }, 1000);
            console.log(this.state)
            ToastAndroid.show('Clean', 1000);
        });
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#2962FF', alignItems: 'center', justifyContent: 'center'}}>
                {this.props.children}
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <TouchableOpacity
                        style={{padding: 30, backgroundColor: '#FFF'}}
                        onPress={() => this.initial()}>
                        <Text>Initial</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{padding: 30, backgroundColor: '#FFF'}}
                        onPress={() => this.validate()}>
                        <Text>Validate</Text>
                    </TouchableOpacity>
                </View>
                <View style={{position: 'absolute', bottom: 20, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    <View style={{flex: 1, alignItems: 'stretch'}}>
                        <Text style={{color: 'white', fontSize: 20, paddingBottom: 20, textAlign: 'center'}}>{this.state.title}</Text>
                        <View style={[styles.loading]}>
                            <ProgressBarAndroid
                                progress={this.state.progress}
                                indeterminate={!(this.state.progress > 0) ? true : false}
                                styleAttr={'Horizontal'}
                                color={'#FFF'}/>
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

module.exports = SplashPage;

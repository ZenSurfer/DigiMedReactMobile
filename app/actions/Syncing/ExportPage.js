'use strict';

import React, { Component } from 'react'
import { StyleSheet, Text, View, Navigator, ScrollView, ProgressBarAndroid, ToastAndroid, DrawerLayoutAndroid, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, Animated, AsyncStorage, LayoutAnimation} from 'react-native'
import Schema from '../../database/schema.js'
import Icon from 'react-native-vector-icons/MaterialIcons'
import IconFont from 'react-native-vector-icons/FontAwesome'
import Styles from '../../assets/Styles'
import Env from '../../env.js'
import _ from 'lodash'
import * as Animatable from 'react-native-animatable';

const {height, width} = Dimensions.get('window');
const EnvInstance = new Env()
const db = EnvInstance.db()
var initialize = {}

class ExportPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            export: {},
            exportFile: 0,
            progress: 0,
            table: 'Initializing Exported Data...',
        }
    }
    componentWillMount() {
        var schema = {}
        _.forEach(_.omit(Schema, ['index']), (v, i) => {
            schema[i] = '';
        })
        this.setState({export: schema});
        LayoutAnimation.spring();
    }
    componentDidMount() {
        this.updateCredentials().done();
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            this.setState({
                doctorID: JSON.parse(doctor).id,
                doctorUserID: JSON.parse(doctor).userID,
            })
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            setTimeout(() => {
                this.export();
            }, 1000)
        }
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#2962FF', justifyContent: 'center' , flexDirection: 'column'}}>
                {this.props.children}
                {!(this.state.progress >= 0.1) ? (
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        {/**<View style={{width: 200, justifyContent: 'center'}}>**/}
                            <Animatable.Text
                                animation="pulse"
                                iterationCount={'infinite'}
                                easing="ease-out">
                                <Icon name={'insert-drive-file'}  size={100} color={'#FFF'}/>
                            </Animatable.Text>
                        {/**</View>
                        <View style={{marginLeft: -60, justifyContent: 'center'}}>
                            <IconFont name={'server'} size={40} color={'#FFF'}/>
                        </View>**/}
                    </View>
                ) : (
                    <View style={{flexDirection: 'row', justifyContent: 'center', height: 100}}>
                        <View style={{width: 200, justifyContent: 'center'}}>
                            <Animated.View
                                style={{paddingLeft: (this.state.progress * 220), opacity: (1 - this.state.progress), transform: [{scale: (1 - this.state.progress)}]}}>
                                <Icon
                                    name={'insert-drive-file'} color={'#FFF'} size={60}/>
                            </Animated.View>
                        </View>
                        <View style={{marginLeft: -60, justifyContent: 'center'}}>
                            <IconFont name={'server'} size={35} color={'#FFF'}/>
                        </View>
                    </View>
                )}
                <View style={{position: 'absolute', bottom: 20, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    <View style={{flex: 1, alignItems: 'stretch'}}>
                        <Text style={{color: 'white', fontSize: 20, paddingBottom: 20, textAlign: 'center'}}>{this.state.table}</Text>
                        <View style={[styles.loading]}>
                            <ProgressBarAndroid
                                progress={this.state.progress}
                                indeterminate={!(this.state.progress > 0) ? true : false}
                                styleAttr={'Horizontal'}
                                color={'#FFF'}/>
                        </View>
                    </View>
                </View>
                {/**<TouchableOpacity
                    style={{marginTop: 20, padding: 30, backgroundColor: '#FFF'}}
                    onPress={() => this.export()}>
                    <Text style={{flex: 1, alignItems: 'stretch', }}>DEBUG</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{marginTop: 20, padding: 10}}
                    onPress={() => {
                        this.props.navigator.replacePreviousAndPop({
                            id: 'AppointmentPage'
                        });
                    }}>
                    <Text style={{color: '#FFF'}}>RETURN</Text>
                </TouchableOpacity>**/}
            </View>
        );
    }
    export() {
        var where = ''
        this.setState({exportFile: 0})
        db.transaction(tx => {
            _.forEach(this.state.export, (v, table) => {
                if (v) {
                    if (table === 'users')
                        where = ' WHERE (created_at>="'+v+'" OR updated_at>="'+v+'") AND id='+this.state.doctorUserID;
                    else
                        where = ' WHERE (created_at>="'+v+'" OR updated_at>="'+v+'")';
                    tx.executeSql("SELECT * FROM "+table+where, [], (tx, rs) => {
                        var rows = [];
                        _.forEach(rs.rows, (v, i) => {
                            rows.push(i+ '='+ encodeURIComponent('{') + this.jsonToQueryString(rs.rows.item(i)) + encodeURIComponent('}'))
                        })
                        this.post(rows, table, where).then((data) => {
                            this.setState({table: 'Exporting '+Math.round(((this.state.exportFile + 1) / _.size(this.state.export)) * 100)+'%'})
                            if ((data.insert + data.exist) !== _.size(rows)) {
                                _.forEach(JSON.parse(data.error), (v, i) => {
                                    console.log(v)
                                })
                            }
                            console.log(data)
                            var res = {};
                            res['table'] = table;
                            res['request'] = _.size(rows);
                            res['response'] = data.insert + data.exist + _.size(JSON.parse(data.error));
                            console.log(res);
                            if ((this.state.exportFile + 1) == _.size(this.state.export)) {
                                this.props.navigator.replace({
                                    id: 'AppointmentPage',
                                    sceneConfig: Navigator.SceneConfigs.PushFromRight,
                                });
                                ToastAndroid.show('Exporting successfully done!', 1000);
                            } else
                                this.setState({exportFile: this.state.exportFile + 1, progress: ((this.state.exportFile + 1) / _.size(this.state.export))})
                        }).catch((err) => console.log(table+':', err)).done();
                    })
                } else {
                    if (table === 'users')
                        where = ' WHERE id='+this.state.doctorUserID;
                    tx.executeSql("SELECT * FROM "+table+where, [], (tx, rs) => {
                        var rows = [];
                        _.forEach(rs.rows, (v, i) => {
                            rows.push(i+ '='+ encodeURIComponent('{') + this.jsonToQueryString(rs.rows.item(i)) + encodeURIComponent('}'))
                        })
                        this.post(rows, table, where).then((data) => {
                            this.setState({table: 'Exporting '+Math.round(((this.state.exportFile + 1) / _.size(this.state.export)) * 100)+'%'})
                            if ((data.insert + data.exist) !== _.size(rows)) {
                                _.forEach(JSON.parse(data.error), (v, i) => {
                                    console.log(v)
                                })
                            }
                            console.log(data)
                            var res = {};
                            res['table'] = table;
                            res['request'] = _.size(rows);
                            res['response'] = data.insert + data.exist + _.size(JSON.parse(data.error));
                            console.log(res);
                            if ((this.state.exportFile + 1) == _.size(this.state.export)) {
                                this.props.navigator.replace({
                                    id: 'AppointmentPage',
                                    sceneConfig: Navigator.SceneConfigs.PushFromRight,
                                });
                                ToastAndroid.show('Exporting successfully done!', 1000);
                            } else
                                this.setState({exportFile: this.state.exportFile + 1, progress: ((this.state.exportFile + 1) / _.size(this.state.export))})
                        }).catch((err) => console.log(table+':', err)).done();
                    })
                }
            })
        })
    }
    async post(rows, table) {
        try {
            return await fetch('http://192.168.1.40/imd5/public/api/v2/export?table='+table, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: _.join(rows, '&')
            }).then((response) => {
                return response.json()
            });
        } catch (e) {
            console.log(table+':', e.message)
        }
    }
    jsonToQueryString(json) {
        return Object.keys(json).map((key) => {
            return encodeURIComponent('"') + encodeURIComponent(key) + encodeURIComponent('"') + encodeURIComponent(":") + encodeURIComponent('"') + encodeURIComponent(json[key])+ encodeURIComponent('"');
        }).join(encodeURIComponent(','));
    }
}

var styles = StyleSheet.create({
    loading: {
        alignItems: 'stretch',
    },
})

module.exports = ExportPage;

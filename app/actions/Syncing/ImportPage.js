'use strict';

import React, {Component} from 'react'
import {Text, View, Navigator, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, AsyncStorage, ToastAndroid, ProgressBarAndroid, NetInfo} from 'react-native'
import RNFS from 'react-native-fs'
import Schema from '../../database/schema.js'
import Styles from '../../assets/Styles.js'
import Env from '../../env.js'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/MaterialIcons'
import IconFont from 'react-native-vector-icons/FontAwesome'
import * as Animatable from 'react-native-animatable';

const EnvInstance = new Env()
const db = EnvInstance.db()

class ImportPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            progress: 0,
            importFile: 0,
            title: 'Validating Requirements...',
        }
    }
    componentDidMount() {
        setTimeout(() => {
            this.validate();
        }, 1000)
    }
    validate() {
        this.setState({title: 'Validating Requirements...', progress: 0, importFile: 0,})
        NetInfo.isConnected.fetch().then(isConnected => {
            if (isConnected) {
                _.forEach(Schema, (v, table) => {
                    this.pull(this.parse(table, [])).then((data) => {
                        db.sqlBatch(_.transform(data.data, (result, n, i) => {
                            result.push(["INSERT OR REPLACE INTO "+data.table+" VALUES ("+_.join(_.fill(Array(_.size(n)), '?'), ',')+")", _.values(n)])
                            if (data.table === 'patients' || data.table === 'staff' || data.table === 'doctors' || data.table === 'nurses') {
                                var path = RNFS.ExternalDirectoryPath + n.imagePath;
                                var param = {id: n.id, type: data.table};
                                this.image(Object.keys(param).map((key) => {
                                    return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
                                }).join('&')).then((data) => {
                                    if (!_.isUndefined(data)) {
                                        console.log(data)
                                        if (data.success)
                                            RNFS.writeFile(path, data.avatar, 'base64').then((success) => {
                                                console.log("Successfully created!")
                                            }).catch((err) => {
                                                console.log("Error occured while creating image!")
                                            });
                                    }
                                }).done();
                            }
                            return true
                        }, []), () => {
                            this.setState({title: 'Importing '+Math.round(((this.state.importFile + 1) / _.size(Schema)) * 100)+'%'})
                            if ((this.state.importFile + 1) == _.size(Schema)) {
                                this.props.navigator.replace({
                                    id: 'AppointmentPage',
                                    sceneConfig: Navigator.SceneConfigs.PushFromRight,
                                });
                                ToastAndroid.show('Importing successfully done!', 1000);
                            } else
                                this.setState({importFile: this.state.importFile + 1, progress: ((this.state.importFile + 1) / _.size(Schema))})
                        }, (err) => {
                            this.setState({importFile: this.state.importFile + 1, progress: ((this.state.importFile + 1) / _.size(Schema))})
                            console.log(err.message);
                        });
                    }).done()
                })
            } else {
                setTimeout(() => {
                    ToastAndroid.show('Connection problem!', 1000);
                    this.props.navigator.replace({
                        id: 'AppointmentPage',
                        sceneConfig: Navigator.SceneConfigs.PushFromRight
                    });
                }, 3000)
            }
        })
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#2962FF', alignItems: 'center', justifyContent: 'center'}}>
                {this.props.children}
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    {!(this.state.progress >= 0.1) ? (
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <Animatable.Text
                                animation="pulse"
                                iterationCount={'infinite'}
                                easing="ease-out">
                                <Icon name={'insert-drive-file'}  size={100} color={'#FFF'}/>
                            </Animatable.Text>
                        </View>
                    ) : (
                        <View style={{flexDirection: 'row', justifyContent: 'center', height: 100}}>
                            <View style={{marginRight: -60, justifyContent: 'center'}}>
                                <IconFont name={'server'} size={35} color={'#FFF'}/>
                            </View>
                                <View style={{width: 200, justifyContent: 'center'}}>
                                    <View
                                        style={{paddingRight: 200 - (this.state.progress * 200), opacity: (this.state.progress>0.2) ? this.state.progress : 0.2, transform: [{scale: (this.state.progress>0.2) ? this.state.progress : 0.2}]}}>
                                        <Icon style={{textAlign: 'right'}}
                                            name={'insert-drive-file'} color={'#FFF'} size={60}/>
                                    </View>
                                </View>
                        </View>
                    )}
                </View>
                {/**<TouchableOpacity
                    style={{padding: 30, backgroundColor: '#FFF'}}
                    onPress={() => this.validate()}>
                    <Text>Validate</Text>
                </TouchableOpacity>**/}
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
    async image(param) {
        try {
            return await fetch(this.props.cloudUrl+'/api/v2/image?'+param).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(err.message)
        }
    }
    async pull(param) {
        try {
            return await fetch(this.props.cloudUrl+'/api/v2/pull?'+param).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(err.message)
        }
    }
    parse(table, values) {
        var rows = []; var where = [];
        rows.push('table='+table)
        _.forEach(values, (v, i) => {
            where.push(encodeURIComponent('{') + this.jsonToQueryString(v) + encodeURIComponent('}'))
        })
        rows.push('where='+ encodeURIComponent('[') + _.join(where, encodeURIComponent(',')) + encodeURIComponent(']'))
        return _.join(rows, '&')
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
    }
})

module.exports = ImportPage;

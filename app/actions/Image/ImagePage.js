'use strict';

import React, {Component} from 'react'
import {StyleSheet, Text, View, ListView, RefreshControl, Navigator, Dimensions, ToastAndroid, TouchableOpacity, TouchableNativeFeedback, Image, Alert, ScrollView, InteractionManager, ActivityIndicator, AsyncStorage, NetInfo} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'
import _ from 'lodash'
import Styles from '../../assets/Styles'
import Env from '../../env'
import moment from 'moment'

const {height, width} = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()

class ImagePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            imaging: [],
            avatar: false,
            syncing: false,
            syncingTitle: 'Syncing Imaging...',
        }
    }
    componentWillMount() {
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
                RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                    this.setState({avatar: (rs.toString().indexOf('dataimage/jpegbase64') !== -1) ? _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,') : 'data:image/jpeg;base64,'+rs.toString()})
                })
        })
    }
    componentDidMount() {
        this.updateCredentials().done();
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            this.setState({doctorID: JSON.parse(doctor).id})
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            setTimeout(() => {
                this.onRefresh();
            }, 1000)
        }
    }
    render() {
        return (
            <Navigator
                renderScene={this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={[Styles.navigationBar,{marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper(this.props.patientID, this.props.patientName, this.state.avatar)} />
                }/>
        );
    }
    renderScene(route, navigator) {
        return (
            <View style={[Styles.containerStyle, {backgroundColor: '#E0E0E0'}]}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Imaging</Text>
                </View>
                {(this.state.syncing) ? (
                    <View style={{alignItems: 'center'}}>
                        <View style={{flexDirection: 'row', padding: 15, paddingTop: 10, paddingBottom: 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}>
                            <ActivityIndicator color="#616161" size={15}/>
                            <Text style={{textAlignVertical: 'center', paddingLeft: 10, color: '#616161', fontSize: 11}}>{this.state.syncingTitle}</Text>
                        </View>
                    </View>
                ) : (
                    <View />
                )}
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh.bind(this)}
                        />
                    }>
                    {_.map(this.state.imaging, (v, i) => {
                        if ((i % 2) == 0)
                        return (
                            <View key={i} style={{flexDirection: 'row'}}>
                                <View style={{flex: 1, alignItems: 'stretch'}}>
                                    <View style={{height: 180, backgroundColor: '#FFFFFF'}}>
                                        <Image
                                            resizeMode={'cover'}
                                            style={{height: 180, alignItems: 'stretch'}}
                                            source={{uri: (this.state.imaging[i].image) ? this.state[this.state.imaging[i].image] : '' }}/>
                                        <View style={{position: 'absolute', top: 0, flex: 1, flexDirection: 'row',}}>
                                            <View style={{flex: 1, height: 180, justifyContent: 'center', alignItems: 'center'}}>
                                                <TouchableOpacity
                                                    style={{padding: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 100}}
                                                    onPress={() => this.props.navigator.push({
                                                        id: 'ViewImage',
                                                        passProps: {
                                                            diagnosisID: this.props.diagnosisID,
                                                            patientImageID: this.state.imaging[i].id,
                                                            patientID: this.props.patientID,
                                                            patientAvatar: this.props.patientAvatar,
                                                            patientName: this.props.patientName
                                                        },
                                                        sceneConfig:  Navigator.SceneConfigs.FloatFromBottomAndroid
                                                    })}>
                                                    <Icon name={'launch'} color={'#FFF'} size={25}/>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{flexDirection: 'row', backgroundColor: '#FFEB3B'}}>
                                        <TouchableOpacity
                                            style={{flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 10}}
                                            onPress={() => {
                                                Alert.alert(
                                                'Annotation',
                                                ((this.state.imaging[i].imageAnnotation) ? this.state.imaging[i].imageAnnotation : '-')+'\n\n'+moment(this.state.imaging[i].created_at).format('MMMM DD, YYYY'),
                                                [
                                                {text: 'DELETE', onPress: () => {
                                                    Alert.alert(
                                                    'Delete Confirmation',
                                                    'Are you sure you want to delete?',
                                                    [
                                                    {text: 'CANCEL'},
                                                    {text: 'OK', onPress: () => {
                                                        db.transaction((tx) => {
                                                            tx.executeSql("UPDATE patientImages SET deleted_at = ?, updated_at = ? where id = ?", [moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), this.state.imaging[i].id], (tx, rs) => {
                                                                console.log("deleted: " + rs.rowsAffected);
                                                            }, (tx, err) => {
                                                                console.log('DELETE error: ' + err.message);
                                                            });
                                                        }, (err) => {
                                                            ToastAndroid.show("Error Occured!", 3000)
                                                        }, () => {
                                                            this.onRefresh();
                                                            ToastAndroid.show("Successfully Deleted!", 3000)
                                                        })
                                                    }},
                                                    ]
                                                    )
                                                }},
                                                {text: 'EDIT', onPress: () => {
                                                    this.props.navigator.push({
                                                        id: 'EditImage',
                                                        passProps: {
                                                            diagnosisID: this.props.diagnosisID,
                                                            patientImageID: this.state.imaging[i].id,
                                                            patientID: this.props.patientID,
                                                            patientAvatar: this.props.patientAvatar,
                                                            patientName: this.props.patientName
                                                        }
                                                    })
                                                }},
                                                {text: 'CLOSE'},
                                                ]
                                                )
                                            }}>
                                            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 2}}>
                                                <Icon name={'info'} size={25} style={{color: '#212121', textAlignVertical: 'center'}}/>
                                                <Text style={{color: '#212121', paddingLeft: 10, textAlignVertical: 'center'}}>Annotation</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {(_.isEmpty(this.state.imaging[i+1])) ? (<View style={{flex: 1, alignItems: 'stretch'}}/>) : (
                                    <View style={{flex: 1, alignItems: 'stretch'}}>
                                        <View style={{height: 180, backgroundColor: '#FFFFFF'}}>
                                            <Image
                                                resizeMode={'cover'}
                                                style={{height: 180, alignItems: 'stretch'}}
                                                source={{uri: (this.state.imaging[i+1].image) ? this.state[this.state.imaging[i+1].image] : '' }}/>
                                            <View style={{position: 'absolute', top: 0, flex: 1, flexDirection: 'row',}}>
                                                <View style={{flex: 1, height: 180, justifyContent: 'center', alignItems: 'center'}}>
                                                    <TouchableOpacity
                                                        style={{padding: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 100}}
                                                        onPress={() => this.props.navigator.push({
                                                            id: 'ViewImage',
                                                            passProps: {
                                                                diagnosisID: this.props.diagnosisID,
                                                                patientImageID: this.state.imaging[i+1].id,
                                                                patientID: this.props.patientID,
                                                                patientAvatar: this.props.patientAvatar,
                                                                patientName: this.props.patientName
                                                            },
                                                            sceneConfig:  Navigator.SceneConfigs.FloatFromBottomAndroid
                                                        })}>
                                                        <Icon name={'launch'} color={'#FFF'} size={25}/>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{flexDirection: 'row', backgroundColor: '#FFEB3B'}}>
                                            <TouchableOpacity
                                                style={{flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 10}}
                                                onPress={() => {
                                                    Alert.alert(
                                                        'Annotation',
                                                        ((this.state.imaging[i+1].imageAnnotation) ? this.state.imaging[i+1].imageAnnotation : '-')+'\n\n'+moment(this.state.imaging[i+1].created_at).format('MMMM DD, YYYY'),
                                                        [
                                                            {text: 'DELETE', onPress: () => {
                                                                Alert.alert(
                                                                    'Delete Confirmation',
                                                                    'Are you sure you want to delete?',
                                                                    [
                                                                        {text: 'CANCEL'},
                                                                        {text: 'OK', onPress: () => {
                                                                            db.transaction((tx) => {
                                                                                tx.executeSql("UPDATE patientImages SET deleted_at = ?, updated_at = ? where id = ?", [moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), this.state.imaging[i+1].id], (tx, rs) => {
                                                                                    console.log("deleted: " + rs.rowsAffected);
                                                                                }, (tx, err) => {
                                                                                    console.log('DELETE error: ' + err.message);
                                                                                });
                                                                            }, (err) => {
                                                                                ToastAndroid.show("Error Occured!", 3000)
                                                                            }, () => {
                                                                                this.onRefresh();
                                                                                ToastAndroid.show("Successfully Deleted!", 3000)
                                                                            })
                                                                        }},
                                                                    ]
                                                                )
                                                            }},
                                                            {text: 'EDIT', onPress: () => {
                                                                this.props.navigator.push({
                                                                    id: 'EditImage',
                                                                    passProps: {
                                                                        diagnosisID: this.props.diagnosisID,
                                                                        patientImageID: this.state.imaging[i+1].id,
                                                                        patientID: this.props.patientID,
                                                                        patientAvatar: this.props.patientAvatar,
                                                                        patientName: this.props.patientName
                                                                    }
                                                                })
                                                            }},
                                                            {text: 'CLOSE', onPress: () => console.log('OK Pressed')},
                                                        ]
                                                    )
                                                }}>
                                                <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 2}}>
                                                    <Icon name={'info'} size={25} style={{color: '#212121', textAlignVertical: 'center'}}/>
                                                    <Text style={{color: '#212121', paddingLeft: 10, textAlignVertical: 'center'}}>Annotation</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )
                    })}
                </ScrollView>
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 24}]}
                    onPress={() => this.props.navigator.push({
                        id: 'AddImage',
                        passProps: {
                            diagnosisID: this.props.diagnosisID,
                            patientID: this.props.patientID,
                            patientAvatar: this.props.patientAvatar,
                            patientName: this.props.patientName
                        }
                    })}>
                    <Icon name={'add'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        );
    }
    onRefresh() {
        this.setState({refreshing: true, imaging: []})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM patientImages WHERE patientID=? AND (deleted_at in (null, 'NULL', '') OR deleted_at is null) ORDER BY created_at DESC", [this.props.patientID], (tx, rs) => {
                db.data = rs.rows
            })
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            var imaging = [];
            _.forEach(db.data, (v, i) => {
                if (db.data.item(i).image != '')
                    RNFS.readFile(RNFS.DocumentDirectoryPath+'/patient/'+db.data.item(i).image, 'base64').then((rs) => {
                        var obj = {};
                        obj[db.data.item(i).image] = (rs.toString().indexOf('dataimage/jpegbase64') !== -1) ? _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,') : 'data:image/jpeg;base64,'+rs.toString();
                        this.setState(obj);
                    })
                imaging.push(db.data.item(i))
            })
            this.setState({refreshing: false, imaging: imaging})
            this.updateData(['patientImages']);
        })
    }
    updateData(tables) {
        NetInfo.isConnected.fetch().then(isConnected => {
            if (isConnected) {
                _.forEach(tables, (table, ii) => {
                    this.exportDate(table).then(exportDate => {
                        if (exportDate === null) {
                            exportDate = moment().year(2000).format('YYYY-MM-DD HH:mm:ss')
                        }
                        db.transaction(tx => {
                            tx.executeSql("SELECT * FROM "+table+" WHERE (created_at>='"+exportDate+"' OR updated_at>='"+exportDate+"')", [], (tx, rs) => {
                                db.data = rs.rows;
                            })
                        }, (err) => console.log(err.message), () => {
                            var rows = [];
                            _.forEach(db.data, (v, i) => {
                                rows.push(i+ '='+ encodeURIComponent('{') + this.jsonToQueryString(db.data.item(i)) + encodeURIComponent('}'))
                                if (table == 'patients' || table == 'staff' || table == 'nurses' || table == 'doctors') {
                                    RNFS.exists(RNFS.DocumentDirectoryPath+'/'+db.data.item(i).image).then((exist) => {
                                        if (exist)
                                            RNFS.readFile(RNFS.DocumentDirectoryPath+'/'+db.data.item(i).image, 'base64').then((image) => {
                                                this.exportImage({
                                                    imagePath: db.data.item(i).image,
                                                    image: (image.toString().indexOf('dataimage/jpegbase64') !== -1) ? encodeURIComponent(_.replace(image.toString(), 'dataimage/jpegbase64','')) :  encodeURIComponent(image.toString())
                                                }, table).done();
                                            })
                                    })
                                }
                                if (table == 'patientImages') {
                                    RNFS.exists(RNFS.DocumentDirectoryPath+'/patient/'+db.data.item(i).image).then((exist) => {
                                        if (exist)
                                            RNFS.readFile(RNFS.DocumentDirectoryPath+'/patient/'+db.data.item(i).image, 'base64').then((image) => {
                                                this.exportImage({
                                                    imagePath: 'patient/'+db.data.item(i).image,
                                                    image: (image.toString().indexOf('dataimage/jpegbase64') !== -1) ? encodeURIComponent(_.replace(image.toString(), 'dataimage/jpegbase64','')) :  encodeURIComponent(image.toString())
                                                }, table).done();
                                            })
                                    })
                                }
                            })
                            this.exportData(table, rows).then(data => {
                                if(!_.isUndefined(data) && data.success) {
                                    this.updateExportDate(table, data.exportdate).then(msg => console.log(data.table+' export', msg)).done()
                                    this.importDate(table).then(importDate => {
                                        if (importDate === null) {
                                            importDate = moment().year(2000).format('YYYY-MM-DD HH:mm:ss')
                                        }
                                        if (moment().diff(moment(importDate), 'minutes') >= EnvInstance.interval) {
                                            this.setState({syncing: true})
                                            this.importData(table, importDate).then((data) => {
                                                var currentImportDate = importDate;
                                                if (data.total > 0) {
                                                    db.sqlBatch(_.transform(data.data, (result, n, i) => {
                                                        result.push(["INSERT OR REPLACE INTO "+table+" VALUES ("+_.join(_.fill(Array(_.size(n)), '?'), ',')+")", _.values(n)])
                                                        var param = {id: n.id, type: data.table};
                                                        this.importImage(Object.keys(param).map((key) => {
                                                            return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
                                                        }).join('&')).then((data) => {
                                                            console.log(data)
                                                            if (!_.isUndefined(data)) {
                                                                if (data.success) {
                                                                    RNFS.writeFile(RNFS.DocumentDirectoryPath+'/patient/'+n.image, decodeURIComponent(data.avatar), 'base64').then((success) => {
                                                                        console.log("Successfully created!")
                                                                    }).catch((err) => {
                                                                        console.log("Error occured while creating image!")
                                                                    });
                                                                }
                                                            }
                                                        }).done();
                                                        return true
                                                    }, []), () => {
                                                        if(_.last(tables) === table)
                                                            this.setState({syncing: false})
                                                        currentImportDate = data.importdate;
                                                        this.updateImportDate(table, currentImportDate).then(msg => {
                                                            console.log(data.table+' import', msg)
                                                            if(_.last(tables) === table)
                                                                this.onRefresh()
                                                            // ToastAndroid.show('Appointments updated!', 1000)
                                                        }).done()
                                                    }, (err) => {
                                                        if(_.last(tables) === table)
                                                            this.setState({syncing: false})
                                                        // ToastAndroid.show(err.message+'!', 1000)
                                                    });
                                                } else {
                                                    currentImportDate = data.importdate;
                                                    if(_.last(tables) === table)
                                                        this.setState({syncing: false})
                                                    this.updateImportDate(table, currentImportDate  ).then(msg => {
                                                        console.log(data.table+' import', msg)
                                                        // ToastAndroid.show('Appointments up to date!', 1000)
                                                    }).done()
                                                }
                                            }).done()
                                        } else {
                                            if(_.last(tables) === table)
                                                this.setState({syncing: false})
                                        }
                                    }).done()
                                }
                            }).done();
                        })
                    }).done()
                })
            }
        })
    }
    async importImage(param) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/image?'+param).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(err.message)
        }
    }
    async exportImage(rows, table) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/storeimage?type='+table, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rows)
            }).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(table+':', err.message)
        }
    }
    async importDate(table) {
        try {
            var importDate = JSON.parse(await AsyncStorage.getItem('importDate'));
            return (_.isUndefined(importDate[table])) ? null : importDate[table];
        } catch (err) {
            return null;
        }
    }
    async importData(table, date) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/import?table='+table+'&date='+encodeURIComponent(date)).then((res) => {
                return res.json()
            });
        } catch (err) {
            return err.message;
        }
    }
    async updateImportDate(table, date) {
        try {
            var importDate = JSON.parse(await AsyncStorage.getItem('importDate'));
            importDate[table] = date;
            AsyncStorage.setItem('importDate', JSON.stringify(importDate));
            return 'updated '+date;
        } catch (err) {
            return err.message;
        }
    }
    async exportDate(table) {
        try {
            var exportDate = JSON.parse(await AsyncStorage.getItem('exportDate'));
            return (_.isUndefined(exportDate[table])) ? null : exportDate[table];
        } catch (err) {
            return null;
        }
    }
    async updateExportDate(table, date) {
        try {
            var exportDate = JSON.parse(await AsyncStorage.getItem('exportDate'));
            exportDate[table] = date;
            AsyncStorage.setItem('exportDate', JSON.stringify(exportDate));
            return 'updated '+date;
        } catch (err) {
            return err.message;
        }
    }
    async exportData(table, rows) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/export?table='+table, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: _.join(rows, '&')
            }).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(table+':', err.message)
        }
    }
    jsonToQueryString(json) {
        return Object.keys(json).map((key) => {
            return encodeURIComponent('"') + encodeURIComponent(key) + encodeURIComponent('"') + encodeURIComponent(":") + encodeURIComponent('"') + encodeURIComponent(json[key])+ encodeURIComponent('"');
        }).join(encodeURIComponent(','));
    }
}

var styles = StyleSheet.create({
    avatarImage: {
        height: 48,
        width: 48,
        borderRadius: 30,
        margin: 5,
        marginRight: 10,
    },
    avatarIcon: {
        margin: 0,
    },
    listView: {
        borderStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
        elevation: 10,
    },
    listText: {
        alignItems: 'stretch',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 16,
        marginRight: 16,
    },
    listItemHead: {
        fontSize: 22,
        paddingTop: 0,
        paddingBottom: 2,
        color: '#424242'
    },
    listItem: {
        fontSize: 14,
    },
})
var NavigationBarRouteMapper = (patientID, patientName, avatar) => ({
    LeftButton(route, navigator, index, nextState) {
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                    onPress={() => {
                        navigator.parentNavigator.pop()
                    }}>
                    <Text style={{color: 'white', margin: 10, marginTop: 15}}>
                        <Icon name="keyboard-arrow-left" size={30} color="#FFF" />
                    </Text>
                </TouchableOpacity>
                {(avatar) ? (<Image source={{uri: avatar}} style={styles.avatarImage}/>) : (<Icon name={'account-circle'} color={'#FFFFFF'} size={65}  style={styles.avatarIcon}/>)}
            </View>
        )
    },
    RightButton(route, navigator, index, nextState) {
        return null
    },
    Title(route, navigator, index, nextState) {
        return (
            <TouchableOpacity
                style={[Styles.title, {marginLeft: 50}]}
                onPress={() => {
                    navigator.parentNavigator.push({
                        id: 'PatientProfile',
                        passProps: { patientID: patientID},
                    })
                }}>
                <Text style={[Styles.titleText]}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = ImagePage;

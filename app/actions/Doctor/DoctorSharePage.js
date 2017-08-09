'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, TextInput, Image, View, Alert, DatePickerAndroid, Navigator, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl, NetInfo, AsyncStorage, ActivityIndicator, ToastAndroid} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import IconAwesome from 'react-native-vector-icons/FontAwesome'
import RNFS from 'react-native-fs'
import _ from 'lodash'
import moment from 'moment'
import Env from '../../env'
import Parser from 'react-native-html-parser'
import FCM from 'react-native-fcm'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const drawerRef = {}
const DomParser = Parser.DOMParser
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()

class DoctorSharePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            doctors: [],
            syncing: false,
            syncingTitle: 'Syncing Doctors...',
            avatar: false,
            note: '',
            selected: [{rowID: '', id: ''}],
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
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM doctors WHERE id!=? AND (deleted_at in (null, 'NULL', '') OR deleted_at is null) ORDER BY firstname ASC, middlename ASC, lastname ASC", [this.state.doctorID], (tx, rs) => {
                db.data = rs.rows
            })
        }, (err) => alert(err.message), () => {
            var doctors = [];
            _.forEach(db.data, (v, i) => {
                doctors.push(db.data.item(i))
                if (db.data.item(i).imagePath != '')
                    RNFS.exists(RNFS.DocumentDirectoryPath +'/'+ db.data.item(i).imagePath).then((exist) => {
                        if (exist)
                            RNFS.readFile(RNFS.DocumentDirectoryPath +'/'+ db.data.item(i).imagePath, 'base64').then((rs) => {
                                var obj = {};
                                if (rs.toString().indexOf('dataimage/jpegbase64') !== -1) {
                                    obj['doctor'+db.data.item(i).id] = _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,');
                                } else {
                                    obj['doctor'+db.data.item(i).id] = 'data:image/jpeg;base64,'+rs.toString();
                                }
                                this.setState(obj);
                            })
                    })
            })
            this.setState({doctors: doctors, refreshing: false})
            this.updateData(['doctors']);
        })
    }
    render() {
        return (
            <Navigator
                renderScene={this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar style={[Styles.navigationBar, {marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper(this.props.patientID, this.props.patientName, this.state.avatar)} />
                }
                />
        )
    }
    renderScene(route, navigator) {
        return (
            <View style={[Styles.containerStyle, {}]}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Refer to Doctor</Text>
                </View>
                {(this.state.syncing) ? (
                    <View style={{alignItems: 'center', backgroundColor: '#607D8B'}}>
                        <View style={{flexDirection: 'row', padding: 15, paddingTop: 10, paddingBottom: 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}>
                            <ActivityIndicator color="#FFF" size={15}/>
                            <Text style={{paddingLeft: 10, fontSize: 10, textAlignVertical: 'center', color: '#FFF'}}>UPDATING DATA</Text>
                            {/* <Text style={{textAlignVertical: 'center', paddingLeft: 10, color: '#616161', fontSize: 11}}>{this.state.syncingTitle}</Text> */}
                        </View>
                    </View>
                ) : (
                    <View />
                )}
                <ListView
                    dataSource={ds.cloneWithRows(this.state.doctors)}
                    renderRow={(rowData, sectionID, rowID) => this.renderListView(rowData, rowID)}
                    enableEmptySections={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh.bind(this)}
                        />
                    }/>
                <View style={{flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderColor: '#E0E0E0', borderTopWidth: 0.5, paddingBottom: 10}}>
                    <View style={{flex: 1, alignItems: 'stretch'}}>
                        <Text style={styles.label} >Note</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={[styles.textInput, {textAlignVertical: 'top', paddingTop: 10, paddingBottom: 20, height: Math.max(35, this.state.height)}]}
                            onContentSizeChange={(event) => {
                                this.setState({height: event.nativeEvent.contentSize.height});
                            }}
                            autoCapitalize={'words'}
                            value={this.state.note}
                            placeholderTextColor={'#E0E0E0'}
                            multiline={true}
                            onChangeText={(text) => this.setState({note: text})} />
                    </View>
                    <View style={{marginLeft: 10, justifyContent: 'flex-end', marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            NetInfo.isConnected.fetch().then(isConnected => {
                                if (isConnected) {
                                    console.log({
                                        diagnosisID: this.props.diagnosisID,
                                        patientID: this.props.patientID,
                                        doctorReferralID: this.state.selected[0].id,
                                        note: this.state.note
                                    })
                                    this.sendReferral({
                                        diagnosisID: this.props.diagnosisID,
                                        patientID: this.props.patientID,
                                        doctorReferralID: this.state.selected[0].id,
                                        note: this.state.note
                                    }).then(data => {
                                        if (!_.isUndefined(data)) {
                                            if (data.success) {
                                                ToastAndroid.show(_.upperFirst(data.message), 3000)
                                                this.props.navigator.pop()
                                            } else {
                                                ToastAndroid.show(_.upperFirst(data.message), 3000)
                                            }
                                        } else {
                                            ToastAndroid.show('Encountered Problem!', 3000)
                                        }
                                    }).done();
                                } else {
                                    ToastAndroid.show('Connection Problem!', 3000)
                                }
                            });
                        }}>
                            <Icon name={'send'} color={'#4CAF50'} size={30}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
    renderListView(rowData, rowID) {
        return (
            <TouchableNativeFeedback
                onPress={() => {
                    var selected = [];
                    selected[0] = {rowID: rowID, id: rowData.id};
                    this.setState({selected: selected})
                }}>
                <View style={{flex: 1, backgroundColor: (this.state.selected[0].rowID == rowID) ? '#4CAF50' : '#FFF', borderColor: '#E0E0E0', borderBottomWidth: 0.5}}>
                    <View style={{flex: 1, flexDirection: 'row', padding: 16, paddingTop: 0, paddingBottom: 0, height: 80, justifyContent: 'center'}}>
                        <View style={{justifyContent: 'center', alignItems: 'center', marginRight: 16}}>
                            {(rowData.imagePath) ? ((this.state['doctor'+rowData.id]) ? (<Image resizeMode={'cover'} style={{width: 59, height: 59, borderRadius: 100}} source={{uri: this.state['doctor'+rowData.id]}}/>) : ((<Image source={require('./../../assets/images/patient.png')} resizeMode={'cover'} style={{width: 59, height: 59, borderRadius: 100}} />))) : (<Image source={require('./../../assets/images/patient.png')} resizeMode={'cover'} style={{width: 59, height: 59, borderRadius: 100}} />)}
                        </View>
                        <View style={{flex: 1, alignItems: 'stretch', flexDirection: 'column', justifyContent: 'center'}}>
                            <Text style={[styles.listItemHead, {color: (this.state.selected[0].rowID == rowID) ? '#FFF' : '#424242'}]}>Dr. {rowData.firstname} {(rowData.middlename) ? rowData.middlename+' ' : ''}{rowData.lastname}</Text>
                            <Text style={[styles.listItem,(rowData.type) ? {color: '#424242'} : {}, {color: (this.state.selected[0].rowID == rowID) ? '#FFF' : '#424242'}]}>{(rowData.type) ? rowData.type : '-'}</Text>
                            {/* <Text style={[styles.listItem, {paddingTop: 5}]}>{(rowData.address) ? rowData.address : '-'}</Text> */}
                            {/* <Text style={[styles.listItem, {color: (this.state.selected[0].rowID == rowID) ? '#FFF' : '#616161'}]}>{(rowData.phone1) ? rowData.phone1 : ''} {(rowData.phone2) ? '/ '+rowData.phone2 : ''}</Text> */}
                        </View>
                    </View>
                </View>
            </TouchableNativeFeedback>
        )
    }
    drawerInstance(instance) {
        drawerRef = instance
    }
    async sendReferral(param) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/postReferrals?api_token=RchwRDA6potmChgFDhF78CDT2HIvmMwDYMO2UWtcFvjRHtNlH072VLoMtu5N', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(param)
            }).then((response) => {
                return response.json()
            });
        } catch (err) {
            alert(err.message)
        }
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
                                    RNFS.exists(RNFS.DocumentDirectoryPath+'/'+db.data.item(i).imagePath).then((exist) => {
                                        if (exist)
                                            RNFS.readFile(RNFS.DocumentDirectoryPath+'/'+db.data.item(i).imagePath, 'base64').then((image) => {
                                                this.exportImage({
                                                    imagePath: db.data.item(i).imagePath,
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
                                            // this.setState({syncing: true, syncingTitle: 'Syncing Doctors...'})
                                            this.setState({syncing: true})
                                            this.importData(table, importDate).then((data) => {
                                                var currentImportDate = importDate;
                                                if (data.total > 0) {
                                                    db.sqlBatch(_.transform(data.data, (result, n, i) => {
                                                        result.push(["INSERT OR REPLACE INTO "+table+" VALUES ("+_.join(_.fill(Array(_.size(n)), '?'), ',')+")", _.values(n)])
                                                        if (!_.isUndefined(n.imagePath)) {
                                                            var param = {id: n.id, type: data.table};
                                                            this.importImage(Object.keys(param).map((key) => {
                                                                return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
                                                            }).join('&')).then((data) => {
                                                                if (!_.isUndefined(data)) {
                                                                    if (data.success) {
                                                                        RNFS.writeFile(RNFS.DocumentDirectoryPath+'/'+n.imagePath, decodeURIComponent(data.avatar), 'base64').then((success) => {
                                                                            console.log("Successfully created!")
                                                                        }).catch((err) => {
                                                                            console.log("Error occured while creating image!")
                                                                        });
                                                                    }
                                                                }
                                                            }).done();
                                                        }
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

const styles = StyleSheet.create({
    time: {
        color: '#616161',
        fontSize: 20,
        textAlignVertical: 'center',
        height: 30,
        marginLeft: 16,
        marginRight: 16,
    },
    textResult: {
        margin: 6,
        marginLeft: 16,
        flexDirection: 'row',
    },
    listView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#EEE',
        backgroundColor: '#FFF',
        paddingTop: 4,
        paddingBottom: 4,
        paddingRight: 16,
        paddingLeft: 16,
    },
    listItemHead: {
        fontSize: 19,
        color: '#424242'
    },
    listItem: {
        fontSize: 14,
        paddingTop: 1,
        paddingBottom: 1,
    },
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
    textInput: {
        fontSize: 16,
        paddingTop: 5,
        marginBottom: 5,
        marginLeft: -2,
    },
})


var NavigationBarRouteMapper = (patientID, patientName, avatar) => ({
    LeftButton(route, navigator, index, navState) {
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
                {(avatar) ? (<Image source={{uri: avatar}} style={styles.avatarImage}/>) : (<Image source={require('./../../assets/images/patient.png')} style={styles.avatarImage}/>)}
            </View>
        )
    },
    RightButton(route, navigator, index, navState) {
        return null
    },
    Title(route, navigator, index, navState) {
        return (
            <TouchableOpacity
                style={[Styles.title, {marginLeft: 50}]}
                onPress={() => {
                    navigator.parentNavigator.push({
                        id: 'PatientProfile',
                        passProps: { patientID: patientID},
                    })
                }}>
                <Text style={Styles.titleText}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = DoctorSharePage

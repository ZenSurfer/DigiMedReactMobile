'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Alert, DatePickerAndroid, Navigator, DrawerLayoutAndroid, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl, NetInfo, AsyncStorage, ActivityIndicator} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import IconAwesome from 'react-native-vector-icons/FontAwesome'
import RNFS from 'react-native-fs'
import _ from 'lodash'
import moment from 'moment'
import Env from '../../env'
import Parser from 'react-native-html-parser'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const DomParser = Parser.DOMParser
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()

class DoctorPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            doctors: [],
            syncing: false,
            syncingTitle: 'Syncing Doctors...',
        }
        this.drawerRef = {}
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
            this.onRefresh();
        }
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM doctors WHERE id!=? AND (deleted_at in (null, 'NULL', '') OR deleted_at is null) ORDER BY firstname ASC, middlename ASC, lastname ASC", [this.props.doctorID], (tx, rs) => {
                db.data = rs.rows
            })
        }, (err) => alert(err.message), () => {
            var doctors = []; var self = this;
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
                                self.setState(obj);
                            })
                    })
            })
            this.setState({doctors: doctors, refreshing: false})
            this.updateData(['doctors']);
        })
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator}  routeName={'doctors'}></DrawerPage>)
                }}
                statusBarBackgroundColor={'#2962FF'}
                ref={ref => this.drawerRef = ref}
            >
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar
                            style={[Styles.navigationBar,{}]}
                            routeMapper={NavigationBarRouteMapper(this.drawerRef)} />
                    } />
            </DrawerLayoutAndroid>
        )
    }
    renderScene(route, navigator) {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={[Styles.subTolbar, {}]}>
                    <Text style={Styles.subTitle}>Doctor</Text>
                </View>
                {(this.state.syncing) ? (
                    <View style={{alignItems: 'center'}}>
                        <View style={{flexDirection: 'row', padding: 15, paddingTop: 10, paddingBottom: 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}>
                            <ActivityIndicator color="#616161" size={15}/>
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
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {}]}
                    onPress={() => this.props.navigator.push({
                        id: 'AddDoctor',
                    })}>
                    <Icon name={'person-add'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        )
    }
    renderListView(rowData, rowID) {
        return (
            <TouchableNativeFeedback
                onPress={() => this.props.navigator.push({
                    id: 'DoctorProfile',
                    passProps: {
                        doctorID: rowData.id,
                        doctorName: 'Dr. '+rowData.firstname+' '+((rowData.middlename) ? rowData.middlename+' ' : '')+rowData.lastname,
                    }
                })}>
                <View style={{flex: 1, backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderBottomWidth: 0.5}}>
                    <View style={{flex: 1, flexDirection: 'row', padding: 16, paddingTop: 0, paddingBottom: 0, minHeight: 100, justifyContent: 'center'}}>
                        <View style={{justifyContent: 'center', alignItems: 'center', marginRight: 16}}>
                            {(rowData.imagePath) ? ((this.state['doctor'+rowData.id]) ? (<Image resizeMode={'cover'} style={{width: 59, height: 59, borderRadius: 100}} source={{uri: this.state['doctor'+rowData.id]}}/>) : ((<Image source={require('./../../assets/images/patient.png')} resizeMode={'cover'} style={{width: 59, height: 59, borderRadius: 100}} />))) : (<Image source={require('./../../assets/images/patient.png')} resizeMode={'cover'} style={{width: 59, height: 59, borderRadius: 100}} />)}
                        </View>
                        <View style={{flex: 1, alignItems: 'stretch', flexDirection: 'column', justifyContent: 'center'}}>
                            <Text style={styles.listItemHead}>Dr. {rowData.firstname} {(rowData.middlename) ? rowData.middlename+' ' : ''}{rowData.lastname}</Text>
                            <Text style={[styles.listItem,(rowData.type) ? {color: '#424242'} : {}]}>{(rowData.type) ? rowData.type : '-'}</Text>
                            {/* <Text style={[styles.listItem, {paddingTop: 5}]}>{(rowData.address) ? rowData.address : '-'}</Text> */}
                            <Text style={styles.listItem}>{(rowData.phone1) ? rowData.phone1 : ''} {(rowData.phone2) ? '/ '+rowData.phone2 : ''}</Text>
                        </View>
                    </View>
                </View>
            </TouchableNativeFeedback>
        )
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
                                                                        // console.log(RNFS.DocumentDirectoryPath+'/'+n.imagePath, decodeURIComponent(data.avatar))
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
})

var NavigationBarRouteMapper = (drawerRef) => ({
    LeftButton(route, navigator, index, navState) {
        return (
            <TouchableOpacity
                style={{flex: 1, justifyContent: 'center'}}
                onPress={() => drawerRef.openDrawer()}>
                <Text style={Styles.leftButtonText}>
                    <Icon name="menu" size={30} color="#FFF" />
                </Text>
            </TouchableOpacity>
        )
    },
    RightButton(route, navigator, index, navState) {
        return null
    },
    Title(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={Styles.title}>
                <Text style={Styles.titleText}>Menu</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = DoctorPage

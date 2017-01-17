'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, ToastAndroid, Image, View, Alert, DatePickerAndroid, Navigator, DrawerLayoutAndroid, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl, NetInfo, AsyncStorage, ActivityIndicator} from 'react-native'
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
const referralStatus = {
    'okay': 'Not Concern',
    'monitor': 'Monitor',
    'bloodTest': 'Request for blood test:',
    'labwork': 'Request for laboratory works:',
    'seeDoctor': 'Need to see me'
}

class ReferralPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            referrals: [],
            labItemSelect: {},
            syncing: false,
            syncingTitle: 'Syncing Doctor Referrals...',
        }
        this.drawerRef = {}
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
                mobileID: JSON.parse(doctor).mobileID,
            })
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            this.onRefresh();
        }
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT referrals.diagnosisID, referrals.created_at ,referrals.patientID, (patients.firstname || ' ' || patients.middlename || ' ' || patients.lastname) as patientName, patients.imagePath, diagnosis.chiefComplaint, (doctors.firstname || ' ' || doctors.middlename || ' ' || doctors.lastname) as doctorName, referrals.updated_at as date, diagnosis.symptoms, referrals.comment, referrals.note, referrals.type, referrals.view, referrals.labworkID FROM `referrals` left outer join diagnosis on diagnosis.id=referrals.diagnosisID LEFT OUTER JOIN patients on patients.id=referrals.patientID LEFT OUTER JOIN doctors on doctors.id=doctorReferralID WHERE diagnosis.doctorID=? ORDER BY referrals.updated_at DESC", [this.state.doctorID], (tx, rs) => {
                var referrals = [];
                _.forEach(rs.rows, (v, i) => {
                    var refer = rs.rows.item(i);
                    if (refer.type === 'bloodTest' || refer.type === 'labwork') {
                        if (!_.isNull(refer.labworkID)) {
                            tx.executeSql("SELECT name FROM labItem WHERE id IN ("+refer.labworkID+")", [], (tx, rs) => {
                                refer['labwork'] = '\n'+_.join(_.map(rs.rows, (v, i) => {
                                    return rs.rows.item(i).name
                                }), ', ')
                            })
                        } else {
                            refer['labwork'] = '';
                        }
                    } else {
                        refer['labwork'] = '';
                    }
                    referrals.push(refer)
                })
                db.referrals = referrals
            })
        }, (err) => alert(err.message), () => {
            this.setState({referrals: db.referrals, refreshing: false})
            this.updateData(['referrals'])
        })
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator}  routeName={'referrals'}></DrawerPage>)
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
                    <Text style={Styles.subTitle}>Doctor Referrals</Text>
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
                <ListView
                    dataSource={ds.cloneWithRows(this.state.referrals)}
                    renderRow={(rowData, sectionID, rowID) => this.renderListView(rowData, rowID)}
                    enableEmptySections={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh.bind(this)}
                        />
                    }
                />
            </View>
        )
    }
    renderListView(rowData, rowID) {
        return (
            <View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: '#EEE'}}>
                <TouchableNativeFeedback onPress={() => {
                        this.props.navigator.push({
                            id: 'HPEDInfo',
                            passProps: {
                                diagnosisID: rowData.diagnosisID,
                                patientID: rowData.patientID,
                                patientAvatar: RNFS.DocumentDirectoryPath +'/'+ rowData.imagePath,
                                patientName: rowData.patientName,
                            }
                        })
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF'}}>
                        <View style={[styles.listView, {elevation: 0, flex: 1, alignItems: 'stretch'}]}>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <View style={{justifyContent: 'center'}}>
                                    <TouchableOpacity
                                        style={{padding: 14, backgroundColor: (rowData.view) ? '#4CAF50' : '#03A9F4', borderRadius: 100, marginRight: 16}}
                                        onPress={() => {
                                            Alert.alert(
                                                (rowData.view) ? 'Doctor Replied' : 'Waiting for Response',
                                                (rowData.view) ? rowData.comment+'\n\n'+referralStatus[rowData.type]+rowData.labwork+'\n\nNote:\n'+rowData.note : rowData.note,
                                                [
                                                    {text: (rowData.type === 'labwork' || rowData.type === 'bloodTest') ? 'LABWORK' : '', onPress: () => {
                                                        this.props.navigator.push({
                                                            id: 'OrderItem',
                                                            passProps: {
                                                                diagnosisID: rowData.diagnosisID,
                                                                patientID: rowData.patientID,
                                                                patientAvatar: RNFS.DocumentDirectoryPath +'/'+ rowData.imagePath,
                                                                patientName: rowData.patientName,
                                                                labItemSelect: (rowData.labworkID !== '') ? rowData.labworkID : false,
                                                            }
                                                        })
                                                    }},
                                                    {text: (rowData.type === 'labwork' || rowData.type === 'bloodTest') ? 'ORDER' : '', onPress: () => {
                                                        this.setState({labItemSelect: {}})
                                                        if (!_.isNull(rowData.labworkID)) {
                                                            _.forEach(_.split(rowData.labworkID, ','), (v, i) => {
                                                                this.labItemSelect(v)
                                                            })
                                                            this.labItemOrder(rowData.patientID, rowData.diagnosisID, this.state.doctorUserID);
                                                        } else {
                                                            ToastAndroid.show('Invalid Laboratory Items Order!', 3000)
                                                        }
                                                    }},
                                                    {text: 'OK', onPress: () => console.log('OK Pressed')},
                                                ]
                                            )
                                        }}>
                                        <Icon name={(rowData.view) ? 'question-answer' : 'repeat'} color={'#FFF'} size={24}/>
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.listText, {flex: 1, alignItems: 'stretch'}]}>
                                    <Text style={styles.listItem}>{(rowData.date) ? moment(rowData.date).format('MMMM DD, YYYY') : ''}</Text>
                                    <Text style={styles.listItemHead}>{rowData.doctorName}</Text>
                                    <Text style={{color: '#FF5722', fontSize: 10}}>Referred to doctor {moment().from(rowData.created_at, true)} ago.</Text>
                                    <Text style={[]}>{rowData.chiefComplaint}</Text>
                                    <View style={{flex: 1, flexDirection: 'row', marginTop: 5, marginBottom: 5}}>
                                        {_.map(['Hodgkin\'s Lymphoma', "Multiple Myeloma"], (v, i) => {
                                            var symptomsSelected = _.transform(_.split(rowData.symptoms, ','), (res, n) => {
                                                res.push(_.toInteger(n))
                                                return true
                                            }, []);
                                            console.log(symptomsSelected)
                                            if (rowData.symptoms === '' || rowData.symptoms === null)
                                                return false
                                            else
                                                return this.analyze(i, v, symptomsSelected)
                                            // console.log(symptomsSelected)
                                        })}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableNativeFeedback>
            </View>
        )
    }
    drawerInstance(instance) {
        drawerRef = instance
    }
    labItemSelect(labItemID) {
        var obj = this.state.labItemSelect; obj[labItemID] = (_.isEmpty(obj[labItemID])) ? labItemID : false;
        var myArray = []; myArray.push(obj);
        this.setState({labItemSelect: myArray[0]})
    }
    labItemOrder(patientID, diagnosisID, doctorUserID) {
        var labItems = _.compact(_.toArray(this.state.labItemSelect))
        var values = _.join(_.fill(Array(_.size(labItems))), '@@') ;
        var data = _.join(labItems, '@@');
        var labData = data+':::'+values;
        db.transaction((tx) => {
            var insertID = this.state.mobileID*100000;
            tx.executeSql("SELECT id FROM labwork WHERE id BETWEEN "+insertID+" AND "+((insertID*2)-1)+" ORDER BY created_at DESC LIMIT 1", [], (tx, rs) => {
                if (rs.rows.length > 0)
                    insertID = rs.rows.item(0).id + 1;
                var insert = [insertID, patientID, diagnosisID, doctorUserID, moment().format('YYYY-MM-DD'), null, null, labData, null, null, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];
                tx.executeSql("INSERT INTO `labwork` (`id`, `patientID`, `diagnosisID`, `userID`, `orderDate`, `completionDate`, `completed`, `labData`, `viewed`, `deleted_at`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", insert, (tx, rs) => {
                    console.log('insert:', rs.insertId)
                })
            })
        }, (err) => {
            alert(err.message)
        }, () => {
            ToastAndroid.show('Laboratory Items Successfully Order!', 3000)
            this.updateData(['doctors', 'labItem', 'labItemClass', 'labwork']);
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
    analyze(key, cancer, symptomsSelected) {
        if (cancer == 'Hodgkin\'s Lymphoma') {
            var symptoms = [0,1,2,3,4,5,6];
            var count = 0;
        } else {
            var symptoms = [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
            var count = 0;
        }
        _.map(symptomsSelected, (v, i) => {
            if (contains.call(symptoms, v))
                count++;
        })
        if (count) {
            var percentage = count/_.size(symptoms) * 100;
            var color = '#212121';
            if (contains.call(symptomsSelected, 0) && cancer == 'Hodgkin\'s Lymphoma') {
                var backgroundColor = '#9D0B0E';
                color= '#FFF';
            } else if (percentage <= 20) {
                var backgroundColor = '#F1C40F';
            } else if (percentage <= 50) {
                var backgroundColor = '#E77E23';
                color= '#FFF';
            } else if (percentage <= 90) {
                var backgroundColor = '#E84C3D';
                color= '#FFF';
            } else {
                var backgroundColor = '#9D0B0E';
                color= '#FFF';
            }
            return (
                <Text key={key} style={[styles.listItem, {fontSize: 10, backgroundColor: backgroundColor, color: color, borderRadius: 2, marginRight: 5, padding: 2, paddingLeft: 5, paddingRight: 5}]} >{cancer}</Text>
            )
        }
        return (<View/>)
    }
}

var contains = function(needle) {
    var findNaN = needle !== needle;
    var indexOf;
    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                var item = this[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }
    return indexOf.call(this, needle) > -1;
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

module.exports = ReferralPage

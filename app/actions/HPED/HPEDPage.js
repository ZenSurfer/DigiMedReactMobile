'use strict';

import React, {Component} from 'react'
import {StyleSheet, Text, View, ListView, DrawerLayoutAndroid, RefreshControl, Navigator, Dimensions, ToastAndroid, TouchableOpacity, TouchableNativeFeedback, Image, Alert, AsyncStorage, NetInfo, ActivityIndicator} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'
import _ from 'lodash'
import Styles from '../../assets/Styles'
import Env from '../../env'
import moment from 'moment'
import DrawerPage from '../../components/DrawerPage'

const {height, width} = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()

class HPEDPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            doctorID: 0,
            refreshing: false,
            rowData: [],
            avatar: false,
            syncing: false,
            syncingTitle: 'Syncing H.P.E.D...',
        }
        this.drawerRef = {}
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
            this.setState({
                doctorID: JSON.parse(doctor).id,
                doctorUserID: JSON.parse(doctor).userID,
            })
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            setTimeout(() => {
                this.onRefresh()
            }, 1000)
        }
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator} routeName={'patients'}></DrawerPage>)
                }}
                statusBarBackgroundColor={'#2962FF'}
                ref={ref => this.drawerRef = ref}
                >
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar
                            style={[Styles.navigationBar, {}]}
                            routeMapper={NavigationBarRouteMapper(this.drawerRef, this.props.patientID, this.props.patientName, this.state.avatar)} />
                    }/>
            </DrawerLayoutAndroid>
        );
    }
    renderScene(route, navigator) {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={[Styles.subTolbar, {}]}>
                    <Text style={Styles.subTitle}>H.P.E.D.</Text>
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
                    style={{marginBottom: 60}}
                    dataSource={ds.cloneWithRows(this.state.rowData)}
                    renderRow={(rowData, sectionID, rowID) => this.renderListView(rowData, rowID)}
                    enableEmptySections={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh.bind(this)}
                        />
                    }
                />
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {}]}
                    onPress={() => this.props.navigator.push({
                        id: 'AddHPED',
                        passProps: {
                            patientID: this.props.patientID,
                            patientAvatar: this.props.patientAvatar,
                            patientName: this.props.patientName
                        }
                    })}>
                    <Icon name={'add'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
                <View style={{position: 'absolute', bottom: 0, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    <TouchableNativeFeedback
                        onPress={() => this.drawerRef.openDrawer()}>
                        <View style={{backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#EC407A', borderStyle: 'solid', borderRightWidth: 1}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'menu'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Menu</Text>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback
                        onPress={() => this.props.navigator.push({
                            id: 'PrescriptionPage',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName
                            }
                        })}>
                        <View style={{backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#EC407A', borderStyle: 'solid', borderRightWidth: 1}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'assignment'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Prescription</Text>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback
                        onPress={() => this.props.navigator.push({
                            id: 'ImagePage',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName
                            }
                        })}>
                        <View style={{backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'photo'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Imaging</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        );
    }
    renderListView(rowData, rowID) {
        return (
            <View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: '#EEE'}}>
                <TouchableNativeFeedback onPress={() => {
                        this.props.navigator.push({
                            id: 'HPEDInfo',
                            passProps: {
                                diagnosisID: rowData.id,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName,
                            }
                        })
                    }}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF'}}>
                        <TouchableOpacity
                            style={{justifyContent: 'center', padding: 12, borderRadius: 50, backgroundColor: '#FFEB3B', marginLeft: 16}}
                            onPress={() => this.props.navigator.push({
                                id: 'FollowupPage',
                                passProps: {
                                    diagnosisID: rowData.id,
                                    patientID: this.props.patientID,
                                    patientAvatar: this.props.patientAvatar,
                                    patientName: this.props.patientName,
                                }
                            })}>
                            <Icon style={{textAlignVertical: 'center', textAlign: 'center', color: '#616161'}} name='format-list-bulleted' size={20}/>
                        </TouchableOpacity>
                        <View style={[styles.listView, {flex: 1, alignItems: 'stretch', elevation: 0}]}>
                            <View style={styles.listText}>
                                <Text style={styles.listItem}>{(rowData.date) ? moment(rowData.date).format('MMMM DD, YYYY') : ''}</Text>
                                <Text style={styles.listItemHead}>{rowData.chiefComplaint}</Text>
                                <View style={{flexDirection: 'row'}}>
                                    {_.map(['Hodgkin\'s Lymphoma', "Multiple Myeloma"], (v, i) => {
                                        var symptomsSelected = _.transform(_.split(rowData.symptoms, ','), (res, n) => {
                                            res.push(_.toInteger(n))
                                            return true
                                        }, []);
                                        if (rowData.symptoms === '' || rowData.symptoms === null)
                                            return (<View key={i}></View>)
                                        else {
                                            var data = this.analyze(i, v, symptomsSelected)
                                            if (data)
                                                return (
                                                    <View key={i} style={{}}>
                                                        <Text style={[styles.listItem, data.style]} >{data.title}</Text>
                                                    </View>
                                                )
                                            else return (<View key={i}></View>)
                                        }

                                        // console.log(symptomsSelected)
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableNativeFeedback>
                {(rowData.upcoming || rowData.last) ? (
                    <View style={{flex: 1, flexDirection: 'column', backgroundColor: '#FAFAFA'}}>
                        <TouchableNativeFeedback
                            onPress={() => {
                            Alert.alert(
                                'Description',
                                _.split(rowData.upcoming, '@@')[2],
                                [{text: 'OK'}]
                            )
                        }}>
                        {(rowData.upcoming) ? (
                            <View style={{fflexDirection: 'column',padding: 16, paddingTop: 5, paddingBottom: 5}}>
                                <Text style={{color: '#F44336', fontSize: 10, fontWeight: 'bold'}}>Upcoming Follow-Up</Text>
                                <Text style={{color: '#616161', flex: 1, alignItems: 'stretch'}}>
                                    {_.map(_.split(rowData.upcoming, '@@'), (v,i) => {
                                        if (i==1)
                                            return (<Text key={i}> {v}</Text>)
                                        else if (i==0)
                                            return (<Text key={i}>{moment(v).format('MMMM DD, YYYY')} at {moment(v).format('hh:mm A')},</Text>)
                                        else
                                            return (<Text key={i}/>)

                                    })}
                                </Text>
                            </View>
                        ) : (
                            <View style={{flexDirection: 'column',padding: 16, paddingTop: 5, paddingBottom: 5}}>
                                <Text style={{color: '#616161', fontSize: 10, fontWeight: 'bold'}}>Last Follow-Up</Text>
                                <Text style={{color: '#616161', flex: 1, alignItems: 'stretch'}}>
                                    {_.map(_.split(rowData.last, '@@'), (v,i) => {
                                        if (i==1)
                                            return (<Text key={i}> {v}</Text>)
                                        else if (i==0)
                                            return (<Text key={i}>{moment(v).format('MMMM DD, YYYY')} at {moment(v).format('hh:mm A')},</Text>)
                                        else
                                            return (<Text key={i}/>)

                                    })}
                                </Text>
                            </View>
                        )}
                        </TouchableNativeFeedback>
                    </View>
                ) : (<View/>) }

            </View>

        )
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT `diagnosis`.`id` AS `id`, `diagnosis`.`symptoms` as `symptoms`, ('Dr. ' || `doctors`.`firstname` || ' ' || `doctors`.`middlename` || ' ' || `doctors`.`lastname`)  AS `doctorName`, `diagnosis`.`date` AS `date`, `diagnosis`.`chiefComplaint` AS `chiefComplaint`, (SELECT (`followup`.`date`|| ' ' ||`followup`.`time`|| '@@' ||`followup`.`name` || '@@' || `followup`.`description`) as description FROM `followup` WHERE `followup`.`leadSurgeon`="+this.state.doctorID+" AND `followup`.`diagnosisID` = `diagnosis`.`id` AND (`followup`.`date` || ' ' || `followup`.`time`) >= '"+moment().format('YYYY-MM-DD HH:mm:SS')+"' AND (`followup`.`deleted_at` in (null, 'NULL', '') OR `followup`.`deleted_at` is null) ORDER BY `followup`.`date` ASC, `followup`.`time` ASC LIMIT 1) as upcoming, (SELECT (`followup`.`date`|| ' ' ||`followup`.`time`|| '@@' ||`followup`.`name` || '@@' || `followup`.`description`) as description  FROM `followup` WHERE `followup`.`leadSurgeon`="+this.state.doctorID+" AND `followup`.`diagnosisID` = `diagnosis`.`id` AND (`followup`.`date` || ' ' || `followup`.`time`) < '"+moment().format('YYYY-MM-DD HH:mm:SS')+"' AND (`followup`.`deleted_at` in (null, 'NULL', '') OR `followup`.`deleted_at` is null) ORDER BY `followup`.`date` DESC, `followup`.`time` DESC LIMIT 1) as last FROM `diagnosis` LEFT OUTER JOIN `patients` on `diagnosis`.`patientID` = `patients`.`id` LEFT OUTER JOIN `doctors` on `diagnosis`.`doctorID` = `doctors`.`id` WHERE `diagnosis`.`doctorID`="+this.state.doctorID+" AND (`diagnosis`.`deleted_at` in (null, 'NULL', '') OR `diagnosis`.`deleted_at` is null) AND `diagnosis`.`patientID` = ? ORDER BY `diagnosis`.`date` DESC, `diagnosis`.`timeStart` DESC", [this.props.patientID], function(tx, rs) {
                db.data = rs.rows
            }, function(error) {
                alert(error.message);
            });
        }, (error) => {
            alert(error.message);
        }, () => {
            var rowData = [];
            _.forEach(db.data, function(v, i) {
                rowData.push(db.data.item(i))
            })
            this.setState({refreshing: false, rowData: rowData})
            this.updateData(['diagnosis']);
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
            // return (
            //     <View key={key}>
            //         <Text style={[styles.listItem, {flex: 1, fontSize: 10, backgroundColor: backgroundColor, color: color, borderRadius: 2, marginRight: 5, padding: 2, paddingLeft: 5, paddingRight: 5}]} >{cancer}</Text>
            //     </View>
            // )
            return {
                style: {flex: 1, fontSize: 10, backgroundColor: backgroundColor, color: color, borderRadius: 2, marginRight: 5, padding: 2, paddingLeft: 5, paddingRight: 5},
                title: cancer,
            }
        }
        return false
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
        paddingTop: 2,
        paddingBottom: 2,
        color: '#424242'
    },
    listItem: {
        fontSize: 14,
    },
})
var NavigationBarRouteMapper = (drawerRef, patientID, patientName, avatar) => ({
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
                {(avatar) ? (<Image source={{uri: avatar}} style={styles.avatarImage}/>) : (<Image source={require('./../../assets/images/patient.png')} style={styles.avatarImage}/>)}
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

module.exports = HPEDPage;

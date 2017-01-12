'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Alert, DatePickerAndroid, Navigator, DrawerLayoutAndroid, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl, ToastAndroid, AsyncStorage, NetInfo, ActivityIndicator} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import moment from 'moment'
import Env from '../../env'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()

const months = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];

class PendingOrder extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: true,
            pendingItem: {},
            syncing: false,
            syncingTitle: 'Syncing Pending Order...',
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
            tx.executeSql("SELECT `diagnosis`.`symptoms` as `symptoms`, (`patients`.`firstname` || ' ' || `patients`.`middlename` || ' ' || `patients`.`lastname`) as `patientName`, `labwork`.`id` as `id`, `labwork`.`orderDate`, `labwork`.`labData`, `labwork`.`created_at` FROM `labwork` OUTER LEFT JOIN `patients` ON `patients`.`id`=`labwork`.`patientID` OUTER LEFT JOIN `diagnosis` on `diagnosis`.`id`=`labwork`.`diagnosisID` WHERE (`labwork`.`deleted_at` in (null, 'NULL', '') OR `labwork`.`deleted_at` is null) AND (`labwork`.`completed` in (null, 'NULL', '') OR `labwork`.`completed` is null  OR `labwork`.`completed`=0) AND `labwork`.`userID`=? ORDER BY `labwork`.`orderDate` DESC, `labwork`.`updated_at` DESC", [this.props.userID], (tx, rs) => {
                db.pendingItem = [];
                _.forEach(rs.rows, (v, i) => {
                    var pendingItemObj = {};
                    pendingItemObj['orderDate'] = rs.rows.item(i).orderDate;
                    pendingItemObj['patientName'] = rs.rows.item(i).patientName;
                    pendingItemObj['symptoms'] = rs.rows.item(i).symptoms;
                    pendingItemObj['labworkID'] = rs.rows.item(i).id;
                    pendingItemObj['created_at'] = rs.rows.item(i).created_at;
                    var labData = _.split(_.split(rs.rows.item(i).labData, ':::')[1], '@@');
                    tx.executeSql("SELECT `labItem`.`name`, `labItem`.`unit`, `labItem`.`normalMinValue`, `labItem`.`normalMaxValue`, `labItem`.`isNumeric` FROM `labItem` WHERE `labItem`.`id` in ("+_.join(_.split(_.split(rs.rows.item(i).labData, ':::')[0], '@@'), ',')+")", [], (tx, rs) => {
                        var items = [];
                        _.forEach(rs.rows, (v, i) => {
                            items.push(rs.rows.item(i).name);
                        })
                        pendingItemObj['items'] = items;
                    })
                    db.pendingItem.push(pendingItemObj)
                })
            })
        }, (err) => {
            alert(err.message)
        }, () => {
            this.setState({pendingItem: db.pendingItem, refreshing: false})
            this.updateData(['labtItem', 'labItemClass', 'labwork']);
        })
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator} routeName={'pending'}></DrawerPage>)
                }}
                statusBarBackgroundColor={'#2962FF'}
                ref={ref =>  this.drawerRef = ref}
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
                <View style={[Styles.subTolbar, {}]}>
                    <Text style={Styles.subTitle}>Pending Order</Text>
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
                    dataSource={ds.cloneWithRows(this.state.pendingItem)}
                    renderRow={(rowData) => this.renderListView(rowData)}
                    enableEmptySections={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh.bind(this)}/>
                    }/>
            </View>
        )
    }
    renderListView(rowData) {
        return (
            <View style={[styles.listView, {flex: 1, alignItems: 'center', justifyContent: 'center'}]}>
                <View style={{flex: 1, alignItems: 'stretch', paddingRight: 16}}>
                    <Text>{moment(rowData.orderDate).format('MMMM DD, YYYY')}</Text>
                    <Text style={styles.listItemHead}>{rowData.patientName}</Text>
                    <Text style={{color: '#FF5722', fontSize: 10}}>Labwork ordered {moment().from(rowData.created_at, true)} ago.</Text>
                    <Text style={{color: '#E91E63'}}>{_.join(rowData.items, ', ')}</Text>
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
                <TouchableOpacity
                    style={{backgroundColor: '#FAFAFA', padding: 10, borderRadius: 100, marginRight: 5}}
                    onPress={() => this.deletePendingOrder(rowData.labworkID)}>
                    <Icon name={'delete'} size={22} color={'#424242'}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{backgroundColor: '#2979FF', padding: 10, borderRadius: 100}}
                    onPress={() => this.updatePendingOrder(rowData.labworkID)}>
                    <Icon name={'update'} size={22} color={'#FFF'}/>
                </TouchableOpacity>
            </View>
        )
    }
    updatePendingOrder(labworkID) {
        var values = {
            orderDate: moment().format('YYYY-MM-DD'),
            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            labworkID: labworkID,
        };
        db.transaction((tx) => {
            tx.executeSql("UPDATE labwork SET orderDate=?, updated_at=? WHERE id=?", _.values(values), (tx, rs) => {
                console.log("created: " + rs.rowsAffected);
            }, (err) => alert(err.message))
        }, (err) => alert(err.message), () => {
            ToastAndroid.show('Pending Order Updated!', 3000)
            this.onRefresh()
        })
    }
    deletePendingOrder(labworkID) {
        Alert.alert(
        'Delete Confirmation',
        'Are you sure you want to delete?',
        [
            {text: 'CANCEL'},
            {text: 'OK', onPress: () => {
                db.transaction((tx) => {
                    tx.executeSql("UPDATE labwork SET deleted_at = ?, updated_at = ? where id = ?", [moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), labworkID], (tx, rs) => {
                        console.log("deleted: " + rs.rowsAffected);
                    }, (tx, err) => {
                        console.log('DELETE error: ' + err.message);
                    });
                }, (err) => {
                    ToastAndroid.show("Error Occured!", 3000)
                }, () => {
                    ToastAndroid.show("Successfully Deleted!", 3000)
                    this.onRefresh();
                })
            }},
        ])
    }
    drawerInstance(instance) {
        drawerRef = instance
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
    listView: {
        flex: 1,
        flexDirection: 'row',
        borderStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
        padding: 16,
        paddingTop: 4,
        paddingBottom: 4,
    },
    listIcon: {
        marginLeft: 16,
        marginRight: 16,
        marginTop: 5,
        marginBottom: 5,
    },
    listText: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        marginTop: 10,
        marginBottom: 10,
    },
    listItemHead: {
        fontSize: 22,
        color: '#424242'
    },
    listItem: {
        fontSize: 14,
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
                <Text style={Styles.titleText}>Labworks</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = PendingOrder

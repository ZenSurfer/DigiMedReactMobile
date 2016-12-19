'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Alert, DatePickerAndroid, Navigator, DrawerLayoutAndroid, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl, ToastAndroid, AsyncStorage, NetInfo, ActivityIndicator} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import moment from 'moment'
import Env from '../../env'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const drawerRef = {}
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
            completedItem: {},
            syncing: false,
            syncingTitle: 'Syncing Completed Order...',
        }
    }
    componentDidMount() {
        this.updateCredentials().done();
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            this.setState({
                doctorID: JSON.parse(doctor).id,
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
            tx.executeSql("SELECT (`patients`.`firstname` || ' ' || `patients`.`middlename` || ' ' || `patients`.`lastname`) as `patientName`, `labwork`.`id` as `id`, `labwork`.`orderDate`, `labwork`.`labData`, `labwork`.`completionDate` FROM `labwork` OUTER LEFT JOIN `patients` ON `patients`.`id`=`labwork`.`patientID` WHERE (`labwork`.`deleted_at` in (null, 'NULL', '') OR `labwork`.`deleted_at` is null) AND `labwork`.`completionDate` IS NOT NULL AND `labwork`.`userID`=? ORDER BY `labwork`.`orderDate` DESC, `labwork`.`created_at` DESC", [this.props.userID], (tx, rs) => {
                db.completedItem = [];
                _.forEach(rs.rows, (v, i) => {
                    var completedItemObj = {};
                    completedItemObj['orderDate'] = rs.rows.item(i).orderDate;
                    completedItemObj['completionDate'] = rs.rows.item(i).completionDate;
                    completedItemObj['patientName'] = rs.rows.item(i).patientName;
                    completedItemObj['labworkID'] = rs.rows.item(i).id;
                    var labData = _.split(_.split(rs.rows.item(i).labData, ':::')[1], '@@');
                    tx.executeSql("SELECT `labItem`.`name`, `labItem`.`unit`, `labItem`.`normalMinValue`, `labItem`.`normalMaxValue`, `labItem`.`isNumeric` FROM `labItem` WHERE `labItem`.`id` in ("+_.join(_.split(_.split(rs.rows.item(i).labData, ':::')[0], '@@'), ',')+")", [], (tx, rs) => {
                        var items = []; var values = []; var units = [];
                        _.forEach(rs.rows, (v, i) => {
                            items.push(rs.rows.item(i).name);
                            values.push(labData[i]);
                            units.push(rs.rows.item(i).unit);
                        })
                        completedItemObj['items'] = items;
                        completedItemObj['values'] = values;
                        completedItemObj['units'] = units;
                    })
                    db.completedItem.push(completedItemObj)
                })
            })
        }, (err) => {
            alert(err.message)
        }, () => {
            this.setState({completedItem: db.completedItem, refreshing: false})
            this.updateData(['labItem', 'labItemClass', 'labwork']);
        })
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator} routeName={'completed'}></DrawerPage>)
                }}
                ref={this.drawerInstance}
                >
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar
                            style={[Styles.navigationBar,{marginTop: 24}]}
                            routeMapper={NavigationBarRouteMapper} />
                    } />
            </DrawerLayoutAndroid>
        )
    }
    renderScene(route, navigator) {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Completed Order</Text>
                </View>
                {(this.state.syncing) ? (
                    <View style={{position: 'absolute', top: 74, zIndex: 1, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'center'}}>
                            <View style={{ backgroundColor: '#FF5722', flexDirection: 'row', padding: 15, paddingTop: 5, paddingBottom: 5, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}>
                                <ActivityIndicator color="#FFF" size={15}/>
                                <Text style={{textAlignVertical: 'center', paddingLeft: 10, color: '#FFF', fontSize: 11}}>{this.state.syncingTitle}</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View />
                )}
                <ListView
                    dataSource={ds.cloneWithRows(this.state.completedItem)}
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
            <View>
                <View style={[styles.listView, {flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}]}>
                    <View style={{flex: 1, justifyContent: 'center', flexDirection: 'row', paddingTop: 5, paddingBottom: 5}}>
                        <View style={{flex: 1, alignItems: 'stretch', paddingRight: 16}}>
                            <Text>{moment(rowData.orderDate).format('MMMM DD, YYYY')}</Text>
                            <Text style={styles.listItemHead}>{rowData.patientName}</Text>
                            <Text style={{color: '#FF5722', fontSize: 10}}>Updated last {rowData.completionDate}</Text>
                        </View>
                        <View style={{justifyContent: 'center'}}>
                            <TouchableOpacity
                                style={{backgroundColor: '#4CAF50', padding: 10, borderRadius: 100}}
                                onPress={() => this.updateCompletedOrder(rowData.labworkID)}>
                                <Icon name={'check'} size={22} color={'#FFF'}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{flex: 1, alignItems: 'stretch', fontWeight: 'bold'}}>Laboratory Items</Text>
                        <Text style={{flex: 1, alignItems: 'stretch', fontWeight: 'bold'}}>Result</Text>
                    </View>
                </View>
                <View style={{backgroundColor: '#FFF'}}>
                    {_.map(rowData.items, (v, i) => {
                        return (
                            <View key={i} style={{flexDirection: 'row', padding: 5, paddingLeft: 16, paddingRight: 16, borderStyle: 'solid', borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0',}}>
                                <Text style={{flex: 1, alignItems: 'stretch'}}>{v}</Text>
                                <Text style={{flex: 1, alignItems: 'stretch'}}>{(rowData.values[i]) ? rowData.values[i] : '-'} {rowData.units[i]}</Text>
                            </View>
                        )
                    })}
                </View>
            </View>
        )
    }
    updateCompletedOrder(labworkID) {
        Alert.alert(
        'Labwork Confirmation',
        'Are you sure you want to complete this labworks?',
        [
            {text: 'CANCEL'},
            {text: 'OK', onPress: () => {
                var values = {
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    labworkID: labworkID,
                };
                db.transaction((tx) => {
                    tx.executeSql("UPDATE labwork SET completed=1, updated_at=? WHERE id=?", _.values(values), (tx, rs) => {
                        console.log("created: " + rs.rowsAffected);
                    }, (err) => alert(err.message))
                }, (err) => alert(err.message), () => {
                    ToastAndroid.show('Successfully updated!', 3000)
                    this.onRefresh()
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
                                                        table// ToastAndroid.show(err.message+'!', 1000)
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
            console.log(table+':', e.message)
        }
    }
    jsonToQueryString(json) {
        return Object.keys(json).map((key) => {
            return encodeURIComponent('"') + encodeURIComponent(key) + encodeURIComponent('"') + encodeURIComponent(":") + encodeURIComponent('"') + encodeURIComponent(json[key])+ encodeURIComponent('"');
        }).join(encodeURIComponent(','));
    }
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

var NavigationBarRouteMapper = {
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
}

module.exports = PendingOrder

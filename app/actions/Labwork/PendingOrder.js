'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Alert, DatePickerAndroid, Navigator, DrawerLayoutAndroid, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl, ToastAndroid} from 'react-native'
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
            refreshing: false,
            pendingItem: {},
        }
    }
    componentDidMount() {
        this.onRefresh()
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT (`patients`.`firstname` || ' ' || `patients`.`middlename` || ' ' || `patients`.`lastname`) as `patientName`, `labwork`.`id` as `id`, `labwork`.`orderDate`, `labwork`.`labData` FROM `labwork` OUTER LEFT JOIN `patients` ON `patients`.`id`=`labwork`.`patientID` WHERE (`labwork`.`deleted_at` in (null, 'NULL', '') OR `labwork`.`deleted_at` is null) AND (`labwork`.`completed` in (null, 'NULL', '') OR `labwork`.`completed` is null) AND `labwork`.`userID`=? ORDER BY `labwork`.`orderDate` DESC, `labwork`.`created_at` DESC", [this.props.userID], (tx, rs) => {
                db.pendingItem = [];
                _.forEach(rs.rows, (v, i) => {
                    var pendingItemObj = {};
                    pendingItemObj['orderDate'] = rs.rows.item(i).orderDate;
                    pendingItemObj['patientName'] = rs.rows.item(i).patientName;
                    pendingItemObj['labworkID'] = rs.rows.item(i).id;
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
        })
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                statusBarBackgroundColor={'#2962FF'}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator} routeName={'pending'}></DrawerPage>)
                }}
                ref={this.drawerInstance}
            >
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar style={Styles.navigationBar}
                            routeMapper={NavigationBarRouteMapper} />
                    } />
            </DrawerLayoutAndroid>
        )
    }
    renderScene(route, navigator) {
        return (
            <View style={Styles.containerStyle}>
                <View style={Styles.subTolbar}>
                    <Text style={Styles.subTitle}>Pending Order</Text>
                </View>
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
            <View style={[styles.listView, {alignItems: 'center', justifyContent: 'center'}]}>
                <View style={{flex: 1, alignItems: 'stretch', paddingRight: 16}}>
                    <Text>{rowData.orderDate}</Text>
                    <Text style={styles.listItemHead}>{rowData.patientName}</Text>
                    <Text style={{color: '#FF5722'}}>{_.join(rowData.items, ', ')}</Text>
                </View>
                <TouchableOpacity
                    style={{backgroundColor: '#FAFAFA', padding: 10, borderRadius: 100, marginRight: 5}}
                    onPress={() => this.deletePendingOrder(rowData.labworkID)}>
                    <Icon name={'delete'} size={22} color={'#424242'}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{backgroundColor: '#E91E63', padding: 10, borderRadius: 100}}
                    onPress={() => this.updatePendingOrder(rowData.labworkID)}>
                    <Icon name={'autorenew'} size={22} color={'#FFF'}/>
                </TouchableOpacity>
            </View>
        )
    }
    updatePendingOrder(labworkID) {
       var values = {
           orderDate: moment().format('YYYY-MM-DD'),
           updated_at: moment().format('YYYY-MM-DD'),
           labworkID: labworkID,
       };
       db.transaction((tx) => {
           tx.executeSql("UPDATE labwork SET orderDate=?, updated_at=? WHERE id=?", _.values(values), (tx, rs) => {
               console.log("created: " + rs.rowsAffected);
           }, (err) => alert(err.message))
       }, (err) => alert(err.message), () => {
           ToastAndroid.show('Pending order updated!', 3000)
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
                    tx.executeSql("UPDATE labworkID SET deleted_at = ?, updated_at = ? WHERE id = ?", [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'), labworkID], (tx, rs) => {
                        console.log("deleted: " + rs.rowsAffected);
                    }, (tx, err) => {
                        console.log('DELETE error: ' + err.message);
                    });
                }, (err) => {
                    ToastAndroid.show("Error occured while deleting!", 3000)
                }, () => {
                    ToastAndroid.show("Successfully deleted!", 3000)
                    this.onRefresh();
                })
            }},
        ])
    }
    drawerInstance(instance) {
        drawerRef = instance
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

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
            completedItem: {},
        }
    }
    componentDidMount() {
        this.onRefresh()
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT (`patients`.`firstname` || ' ' || `patients`.`middlename` || ' ' || `patients`.`lastname`) as `patientName`, `labwork`.`id` as `id`, `labwork`.`orderDate`, `labwork`.`labData` FROM `labwork` OUTER LEFT JOIN `patients` ON `patients`.`id`=`labwork`.`patientID` WHERE (`labwork`.`deleted_at` in (null, 'NULL', '') OR `labwork`.`deleted_at` is null) AND `labwork`.`completionDate` IS NOT NULL AND `labwork`.`userID`=? ORDER BY `labwork`.`orderDate` DESC, `labwork`.`created_at` DESC", [this.props.userID], (tx, rs) => {
                db.completedItem = [];
                _.forEach(rs.rows, (v, i) => {
                    var completedItemObj = {};
                    completedItemObj['orderDate'] = rs.rows.item(i).orderDate;
                    completedItemObj['patientName'] = rs.rows.item(i).patientName;
                    completedItemObj['labworkID'] = rs.rows.item(i).id;
                    var labData = _.split(_.split(rs.rows.item(i).labData, ':::')[1], '@@');
                    tx.executeSql("SELECT `labItem`.`name`, `labItem`.`unit`, `labItem`.`normalMinValue`, `labItem`.`normalMaxValue`, `labItem`.`isNumeric` FROM `labItem` WHERE `labItem`.`id` in ("+_.join(_.split(_.split(rs.rows.item(i).labData, ':::')[0], '@@'), ',')+")", [], (tx, rs) => {
                        var items = []; var values = [];
                        _.forEach(rs.rows, (v, i) => {
                            items.push(rs.rows.item(i).name);
                            values.push(labData[i]);
                        })
                        completedItemObj['items'] = items;
                        completedItemObj['values'] = values;
                    })
                    db.completedItem.push(completedItemObj)
                })
            })
        }, (err) => {
            alert(err.message)
        }, () => {
            this.setState({completedItem: db.completedItem, refreshing: false})
        })
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                statusBarBackgroundColor={'#2962FF'}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator} routeName={'completed'}></DrawerPage>)
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
                    <Text style={Styles.subTitle}>Completed Order</Text>
                </View>
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
                    <View style={{flex: 1, alignItems: 'stretch', flexDirection: 'row', paddingTop: 5, paddingBottom: 5}}>
                        <View style={{flex: 1, alignItems: 'stretch', paddingRight: 16}}>
                            <Text>{rowData.orderDate}</Text>
                            <Text style={styles.listItemHead}>{rowData.patientName}</Text>
                        </View>
                        <TouchableOpacity
                            style={{backgroundColor: '#4CAF50', padding: 10, paddingLeft: 12, paddingRight: 12, borderRadius: 100}}
                            onPress={() => this.updateCompletedOrder(rowData.labworkID)}>
                            <Icon name={'check'} size={22} color={'#FFF'}/>
                        </TouchableOpacity>
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
                                <Text style={{flex: 1, alignItems: 'stretch'}}>{rowData.values[i]}</Text>
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
                    updated_at: moment().format('YYYY-MM-DD'),
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

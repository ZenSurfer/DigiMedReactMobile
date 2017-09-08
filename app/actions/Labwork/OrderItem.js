'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Navigator, InteractionManager, DrawerLayoutAndroid, StatusBar, TouchableOpacity, TouchableNativeFeedback, DatePickerAndroid, ScrollView, RefreshControl, TextInput, Picker, TimePickerAndroid, Slider, Switch, ToastAndroid, ListView, Modal, AsyncStorage, NetInfo, ActivityIndicator} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'
import {LineChart} from 'react-native-chart-android';

import _ from 'lodash'
import moment from 'moment'
import ImagePicker from 'react-native-image-picker'
import Env from '../../env'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const _scrollView = {}
const EnvInstance = new Env()
const db = EnvInstance.db()
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

class OrderItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            steps: {active: 1},
            avatar: false,
            refreshing: false,
            modalVisible: false,
            labItem: {},
            labItemSelect: {},
            pendingItem: {},
            recentItem: {},
            recentItemData: {},
            allItem: {},
            modalItems: {},
            syncing: false,
            syncingTitle: 'Syncing Laboratory Works...',
        }
    }
    componentWillMount() {
        this.setState({refreshing: true})
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
            RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                this.setState({avatar: (rs.toString().indexOf('dataimage/jpegbase64') !== -1) ? _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,') : 'data:image/jpeg;base64,'+rs.toString()})
            })
        })
        if (this.props.labItemSelect) {
            _.forEach(_.split(this.props.labItemSelect, ','), (v, i) => {
                this.labItemSelect(v)
            })
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
                doctorUserID: JSON.parse(doctor).userID,
                mobileID: JSON.parse(doctor).mobileID,
            })
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            setTimeout(() => {
                this.labItemUpdate()
            }, 1000)
        }
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
            <View style={[Styles.containerStyle, {backgroundColor: '#EEE'}]}>
                {this.state.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Laboratory Works</Text>
                </View>
                {/* {(this.state.syncing) ? (
                    <View style={{alignItems: 'center', backgroundColor: '#607D8B'}}>
                        <View style={{flexDirection: 'row', padding: 15, paddingTop: 10, paddingBottom: 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}>
                            <ActivityIndicator color="#FFF" size={15}/>
                            <Text style={{paddingLeft: 10, fontSize: 10, textAlignVertical: 'center', color: '#FFF'}}>UPDATING DATA</Text>
                        </View>
                    </View>
                ) : (
                    <View />
                )} */}
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.setState({modalVisible: false})
                    }}>
                    <View style={{flex: 1, alignItems: 'stretch'}}>
                        <View style={{flex: 1, backgroundColor: '#FFF'}}>
                            <View style={{padding: 16, paddingRight: 0, paddingBottom: 16, paddingTop: 16, backgroundColor: '#2962FF', elevation: 2}}>
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <Text style={{color: '#FFF', fontSize: 26, textAlignVertical: 'center'}}>Pending Laboratory</Text>
                                    <TouchableOpacity
                                        style={{padding: 16, paddingTop: 0, paddingBottom: 0,}}
                                        onPress={() => this.setState({modalVisible: false})}>
                                        <Icon name={'close'} size={30} color={'#FFF'} style={{textAlignVertical: 'center'}}/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <ScrollView
                                style={{flex: 1}}
                                keyboardShouldPersistTaps={'always'}>
                                <View style={{padding: 16}}>
                                    {_.map(this.state.modalItems, (v, i) => {
                                        return (
                                            <View key={i} style={{flexDirection: 'column', marginLeft: -1, marginRight: -1}}>
                                                <Text style={styles.label}>{i}</Text>
                                                <View style={{flex: 1, flexDirection: 'row'}}>
                                                    {(this.state.modalItems[i].unit) ? (
                                                        <Text style={{marginTop: 13, fontSize: 16, paddingLeft: 4, paddingRight: 5, fontWeight: 'bold'}}>{this.state.modalItems[i].unit}:</Text>
                                                        ):(<View/>)}
                                                    <View style={{flex: 1, alignItems: 'stretch'}}>
                                                        <TextInput
                                                            placeholder={'Text Here...'}
                                                            style={[styles.textInput]}
                                                            keyboardType={(this.state.modalItems[i].isNumeric) ? 'numeric' : 'default'}
                                                            value={this.state.modalItems[i].value}
                                                            placeholderTextColor={'#E0E0E0'}
                                                            onChangeText={(text) => {
                                                                var result = this.state.modalItems[i]; result['value'] = text;
                                                                var obj = this.state.modalItems || {}; obj[i] = result;
                                                                this.setState({modalItems: obj})
                                                            }} />
                                                    </View>
                                                </View>
                                            </View>
                                        )
                                    })}
                                </View>
                            </ScrollView>
                            <View style={{flexDirection: 'row', alignItems: 'stretch'}}>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    style={{flex: 1, alignItems: 'stretch', borderStyle: 'solid', borderRightWidth: 0.5, borderRightColor: '#81C784'}}
                                    onPress={() => {
                                        db.transaction((tx) => {
                                            tx.executeSql("SELECT labData FROM labwork WHERE id=? LIMIT 1", [this.state.modalLabworkID], (tx, rs) => {
                                                var labData = _.split(rs.rows.item(0).labData, ':::');
                                                labData[1] = _.join(_.flatMap(this.state.modalItems, (n) => {
                                                    return n.value
                                                }), '@@');
                                                tx.executeSql("UPDATE labwork SET completionDate='"+moment().format('YYYY-MM-DD')+"', completed=1, labData='"+_.join(labData, ':::')+"' WHERE id=?",[this.state.modalLabworkID], (tx, rs) => {
                                                    console.log(rs.rowsAffected)
                                                }, (err) => alert(err.message))
                                            }, (err) => alert(err.message))
                                        }, (err) => alert(err.message), () => {
                                            this.setState({modalVisible: false})
                                            this.pendingItemUpdate();
                                            ToastAndroid.show('Successfully Completed!', 3000);
                                        })
                                    }}>
                                    <View style={{backgroundColor: '#4CAF50'}}>
                                        <Text style={{textAlign: 'center', padding: 16, color: '#FFF', paddingTop: 20, paddingBottom: 20}}>COMPLETED</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    style={{flex: 1, alignItems: 'stretch'}}
                                    onPress={() => {
                                        db.transaction((tx) => {
                                            tx.executeSql("SELECT labData FROM labwork WHERE id=? LIMIT 1", [this.state.modalLabworkID], (tx, rs) => {
                                                var labData = _.split(rs.rows.item(0).labData, ':::');
                                                labData[1] = _.join(_.flatMap(this.state.modalItems, (n) => {
                                                    return n.value
                                                }), '@@');
                                                tx.executeSql("UPDATE labwork SET completionDate='"+moment().format('YYYY-MM-DD')+"', labData='"+_.join(labData, ':::')+"' WHERE id=?",[this.state.modalLabworkID], (tx, rs) => {
                                                    console.log(rs.rowsAffected)
                                                }, (err) => alert(err.message))
                                            }, (err) => alert(err.message))
                                        }, (err) => alert(err.message), () => {
                                            this.setState({modalVisible: false})
                                            this.pendingItemUpdate();
                                            ToastAndroid.show('Successfully Saved!', 3000);
                                        })
                                    }}>
                                    <View style={{backgroundColor: '#4CAF50'}}>
                                        <Text style={{textAlign: 'center', color: '#FFF', padding: 16, paddingTop: 20, paddingBottom: 20}}>SAVE</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <View style={{flexDirection: 'row', backgroundColor: '#EEE', zIndex: 0}}>
                    <TouchableOpacity
                        ref={ref => this.refStep1 = ref}
                        activeOpacity={(this.state.steps.active == 1) ? 1 : 0.2}
                        style={[styles.steps, (this.state.steps.active == 1) ? styles.stepsActive : {}]}
                        onPress={() => {
                            this.refStep1.setOpacityTo(1)
                            if (this.state.steps.active != 1) {
                                this.labItemUpdate();
                                this.setState({steps: {active: 1}})
                            }
                        }}>
                        <Text style={[styles.stepsText, (this.state.steps.active == 1) ? styles.stepsTextActive : {}]}>Ordering</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        ref={ref => this.refStep2 = ref}
                        activeOpacity={(this.state.steps.active == 2) ? 1 : 0.2}
                        style={[styles.steps, (this.state.steps.active == 2) ? styles.stepsActive : {}]}
                        onPress={() => {
                            this.refStep2.setOpacityTo(1)
                            if (this.state.steps.active != 2) {
                                this.pendingItemUpdate();
                                this.setState({steps: {active: 2}})
                            }
                        }}>
                        <Text style={[styles.stepsText, (this.state.steps.active == 2) ? styles.stepsTextActive : {}]}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        ref={ref => this.refStep3 = ref}
                        activeOpacity={(this.state.steps.active == 3) ? 1 : 0.2}
                        style={[styles.steps, (this.state.steps.active == 3) ? styles.stepsActive : {}]}
                        onPress={() => {
                            this.refStep3.setOpacityTo(1)
                            if (this.state.steps.active != 3) {
                                this.recentItemUpdate();
                                this.setState({steps: {active: 3}})
                            }
                        }}>
                        <Text style={[styles.stepsText, (this.state.steps.active == 3) ? styles.stepsTextActive : {}]}>Recent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        ref={ref => this.refStep4 = ref}
                        activeOpacity={(this.state.steps.active == 4) ? 1 : 0.2}
                        style={[styles.steps, (this.state.steps.active == 4) ? styles.stepsActive : {}]}
                        onPress={() => {
                            this.refStep4.setOpacityTo(1)
                            if (this.state.steps.active != 4) {
                                this.getChart();
                                this.setState({steps: {active: 4}})
                            }
                        }}>
                        <Text style={[styles.stepsText, (this.state.steps.active == 4) ? styles.stepsTextActive : {}]}>All</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex:1, backgroundColor: '#FFF'}}>
                    {this.steps(this.state.steps.active)}
                </View>
                {(this.state.steps.active == 1) ? (<TouchableOpacity
                    style={[Styles.buttonFab, {backgroundColor: (_.size(_.compact(_.toArray(this.state.labItemSelect))) > 0) ? '#E91E63' : '#E0E0E0', elevation:  (_.size(_.compact(_.toArray(this.state.labItemSelect))) > 0) ? 4 : 0}]}
                    onPress={this.labItemOrder.bind(this)}>
                    <Icon name={'shopping-cart'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>) : (<View/>)}
            </View>
        )
    }
    labItemUpdate() {
        this.setState({refreshing: true, labItem: {}, labItemSelect: (this.props.labItemSelect) ? this.state.labItemSelect : {}})
        db.transaction((tx) => {
            tx.executeSql("SELECT `labItemClass`.`value` as `class`, (SELECT GROUP_CONCAT((`labItem`.`id` || ':' ||`labItem`.`name`), '@') FROM labItem WHERE (`labItem`.`deleted_at` in (null, 'NULL', '') OR `labItem`.`deleted_at` is null) AND `labItem`.`labItemClassID` = `labItemClass`.`id` ORDER BY `labItem`.`name` ASC) as `value` FROM labItemClass ORDER BY `labItemClass`.`value` ASC", [], (tx, rs) => {
                db.data = rs.rows
            })
        }, (err) => {
            this.setState({refreshing: false})
        }, () => {
            var labItem = []
            _.forEach(db.data, (v, i) => {
                labItem.push(db.data.item(i))
            })
            this.setState({labItem: labItem, refreshing: false})
            this.updateData(['labItem', 'labItemClass', 'labwork']);
        })
    }
    pendingItemUpdate() {
        this.setState({refreshing: true, pendingItem: {}})
        db.transaction((tx) => {
            tx.executeSql("SELECT `labwork`.`id` as `id`, `labwork`.`orderDate`, `labwork`.`labData` FROM `labwork` WHERE (`labwork`.`deleted_at` in (null, 'NULL', '') OR `labwork`.`deleted_at` is null) AND (`labwork`.`completed` in (null, 'NULL', '') OR `labwork`.`completed` is null) AND `labwork`.`patientID` = ? AND `labwork`.`userID` = ?  ORDER BY `labwork`.`orderDate` DESC, `labwork`.`created_at` DESC", [this.props.patientID, this.state.doctorUserID], (tx, rs) => {
                var pendingItemObj = {};
                _.forEach(rs.rows, (v, i) => {
                    var orderDate = rs.rows.item(i).orderDate;
                    var labworkID = rs.rows.item(i).id;
                    var labData = _.split(_.split(rs.rows.item(i).labData, ':::')[1], '@@');
                    tx.executeSql("SELECT `labItem`.`name`, `labItem`.`unit`, `labItem`.`normalMinValue`, `labItem`.`normalMaxValue`, `labItem`.`isNumeric` FROM `labItem` WHERE `labItem`.`id` in ("+_.join(_.split(_.split(rs.rows.item(i).labData, ':::')[0], '@@'), ',')+")", [], (tx, rs) => {
                        var obj = {};
                        _.forEach(rs.rows, (v, i) => {
                            obj[rs.rows.item(i).name] = {value: labData[i], isNumeric: rs.rows.item(i).isNumeric, unit: rs.rows.item(i).unit, normalMinValue: rs.rows.item(i).normalMinValue, normalMaxValue: rs.rows.item(i).normalMaxValue, labworkID: labworkID}
                        })
                        if (orderDate in pendingItemObj) {
                            pendingItemObj[orderDate].push(obj);
                        } else {
                            pendingItemObj[orderDate] = []
                            pendingItemObj[orderDate].push(obj);
                        }
                    })

                })
                db.pendingItem = pendingItemObj
            })
        }, (err) => {
            this.setState({refreshing: false})
        }, () => {
            this.setState({pendingItem: db.pendingItem, refreshing: false})
            this.updateData(['labwork']);
        })
    }
    recentItemUpdate() {
        this.setState({refreshing: true, recentItem: {}})
        db.transaction((tx) => {
            tx.executeSql("SELECT `labwork`.`completionDate`, `labwork`.`labData` FROM `labwork` WHERE (`labwork`.`deleted_at` in (null, 'NULL', '') OR `labwork`.`deleted_at` is null) AND `labwork`.`completed` = 1 AND `labwork`.`patientID` = ? AND `labwork`.`userID` = ? ORDER BY `labwork`.`completionDate` DESC, `labwork`.`created_at` DESC", [this.props.patientID, this.state.doctorUserID], (tx, rs) => {
                var recentItemObj = {};
                _.forEach(rs.rows, (v, i) => {
                    var completionDate = rs.rows.item(i).completionDate;
                    var labData = _.split(_.split(rs.rows.item(i).labData, ':::')[1], '@@');
                    tx.executeSql("SELECT `labItem`.`name`, `labItem`.`unit`, `labItem`.`normalMinValue`, `labItem`.`normalMaxValue`, `labItem`.`isNumeric` FROM `labItem` WHERE `labItem`.`id` in ("+_.join(_.split(_.split(rs.rows.item(i).labData, ':::')[0], '@@'), ',')+")", [], (tx, rs) => {
                        var obj = {};
                        _.forEach(rs.rows, (v, i) => {
                            var color = '#616161';
                            if (labData[i] < rs.rows.item(i).normalMinValue)
                                color = '#673AB7';
                            else if (labData[i] > rs.rows.item(i).normalMaxValue)
                                color = '#F44336';
                            obj[rs.rows.item(i).name] = {value: labData[i], isNumeric: rs.rows.item(i).isNumeric, unit: rs.rows.item(i).unit, normalMinValue: rs.rows.item(i).normalMinValue, normalMaxValue: rs.rows.item(i).normalMaxValue, color: color}
                        })
                        if (completionDate in recentItemObj) {
                            recentItemObj[completionDate].push(obj);
                        } else {
                            recentItemObj[completionDate] = []
                            recentItemObj[completionDate].push(obj);
                        }
                    })

                })
                db.recentItem = recentItemObj
            })
        }, (err) => {
            this.setState({refreshing: false})
        }, () => {
            this.setState({recentItem: db.recentItem, refreshing: false})
            this.updateData(['labwork']);
        })
    }
    steps(step) {
        switch (step) {
            case 1:
            return (
                <ScrollView
                    ref={(ref) => this.refStep1 = ref}
                    keyboardShouldPersistTaps={'always'}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.labItemUpdate.bind(this)}/>
                    }>
                    <View style={{marginBottom: 50}}>
                        {_.map(this.state.labItem, (v, i) => {
                            var labItems = _.split(v.value, '@');
                            return (
                                <View key={i} style={{flexDirection: 'column', backgroundColor: '#FFFFFF'}}>
                                    <View style={{flex:1, backgroundColor: '#FFEB3B', elevation: 1}}>
                                        <Text style={[styles.heading, {fontSize: 25, color: '#424242'} ]}>{v.class}</Text>
                                    </View>
                                    {_.map(labItems, (v, i) => {
                                        if ((i % 2) == 0)
                                        return (
                                            <View key={i} style={{flexDirection: 'row', backgroundColor: ((i%4)==0) ? '#FAFAFA': '#FFF', paddingLeft: 16, paddingRight: 16, borderStyle: 'solid', borderBottomWidth: 0.5, borderBottomColor: '#EEE'}}>
                                                <TouchableOpacity style={{flex: 1, alignItems: 'stretch', flexDirection: 'row'}}
                                                    activeOpacity={1}
                                                    onPress={this.labItemSelect.bind(this, _.split(labItems[i], ':')[0])}>
                                                    <Icon name={(this.state.labItemSelect[_.split(labItems[i], ':')[0]]) ? 'check-box' : 'check-box-outline-blank'} size={20} style={{paddingTop: 12, paddingBottom: 12, color: (this.state.labItemSelect[_.split(labItems[i], ':')[0]]) ? '#4CAF50' : '#616161'}}/>
                                                        <View style={{flex: 1, alignItems: 'stretch', alignSelf: 'center'}}>
                                                            <Text style={[styles.label, {textAlignVertical: 'center'}]}>{_.split(labItems[i], ':')[1]}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                        {(_.isEmpty(labItems[i+1])) ? (<View/>) : (
                                                            <TouchableOpacity style={{flex: 1, alignItems: 'stretch', flexDirection: 'row'}}
                                                                activeOpacity={1}
                                                                onPress={this.labItemSelect.bind(this, _.split(labItems[i+1], ':')[0])}>
                                                                <Icon name={(this.state.labItemSelect[_.split(labItems[i+1], ':')[0]]) ? 'check-box' : 'check-box-outline-blank'} size={20} style={{paddingTop: 12, paddingBottom: 12, color: (this.state.labItemSelect[_.split(labItems[i+1], ':')[0]]) ? '#4CAF50' : '#616161'}}/>
                                                                <View style={{flex: 1, alignItems: 'stretch', alignSelf: 'center'}}>
                                                                    <Text style={[styles.label, {textAlignVertical: 'center'}]}>{_.split(labItems[i+1], ':')[1]}</Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        )}
                                                </View>
                                            )
                                        })}
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            )
            break;
            case 2:
            return (
                <View style={{flex: 1}}>
                    <ListView
                        dataSource={ds.cloneWithRows(this.state.pendingItem)}
                        renderRow={(rowData, sectionID, rowID) => {
                            return (
                                <View>
                                    <View style={{backgroundColor: '#FFEB3B', paddingBottom: 10, paddingLeft: 16, paddingRight: 16, elevation: 1}}>
                                        <Text style={{fontSize: 25, color: '#424242', paddingBottom: 5, paddingTop: 5}}>{moment(rowID).format('MMMM DD, YYYY')}</Text>
                                        <View style={{flexDirection: 'row'}}>
                                            <Text style={{flex:1, color: '#616161', fontSize: 16, alignItems: 'stretch'}}>Laboratory Items</Text>
                                            <Text style={{flex:1, color: '#616161', fontSize: 16, alignItems: 'stretch'}}>Normal Values</Text>
                                        </View>
                                    </View>
                                    <ListView
                                        dataSource={ds.cloneWithRows(rowData)}
                                        renderRow={(rowData, sectionID, rowID) => {
                                            return (
                                                <TouchableNativeFeedback
                                                    onPress={() => {
                                                        var modalLabworkID = _.nth(_.flatMap(rowData, (n) => {
                                                            return n.labworkID
                                                        }), 0);
                                                        this.setState({modalVisible: true, modalItems: rowData, modalLabworkID: modalLabworkID});
                                                    }}>
                                                    <View style={{paddingLeft: 16, paddingRight: 16, paddingBottom: 5, marginTop: 0, borderStyle: 'solid', borderBottomWidth: 0.5, borderBottomColor: '#EEE'}}>
                                                        {_.map(rowData, (v, i) => {
                                                            return (
                                                                <View key={i} style={{flexDirection: 'row', paddingTop: 5, paddingBottom: 5}}>
                                                                    <Text style={{flex:1, alignItems: 'stretch'}}>{i}</Text>
                                                                    <Text style={{flex:1, alignItems: 'stretch'}}>{(v.normalMinValue && v.normalMaxValue) ? (v.normalMinValue || '0')+' - '+(v.normalMaxValue || '0'): '' } {v.unit || ''}</Text>
                                                                </View>
                                                            )
                                                        })}
                                                    </View>
                                                </TouchableNativeFeedback>
                                            )
                                        }}
                                        enableEmptySections={true}
                                    />
                                </View>
                            )
                        }}
                        enableEmptySections={true}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.pendingItemUpdate.bind(this)}
                            />
                        }/>
                </View>
            )
            break;
            case 3:
            return (
                <View style={{flex: 1}}>
                    <ListView
                        dataSource={ds.cloneWithRows(this.state.recentItem)}
                        renderRow={(rowData, sectionID, rowID) => {
                            return (
                                <View>
                                    <View style={{backgroundColor: '#FFEB3B', paddingBottom: 10, paddingLeft: 16, paddingRight: 16, elevation: 1}}>
                                        <Text style={{fontSize: 25, color: '#424242', paddingBottom: 5, paddingTop: 5}}>{moment(rowID).format('MMMM DD, YYYY')}</Text>
                                        <View style={{flexDirection: 'row'}}>
                                            <Text style={{flex:1, color: '#616161', fontSize: 16, alignItems: 'stretch'}}>Laboratory Items</Text>
                                            <Text style={{color: '#616161', fontSize: 16, flex:1, alignItems: 'stretch', textAlign: 'center'}}>Result</Text>
                                            <Text style={{flex:1, color: '#616161', fontSize: 16, alignItems: 'stretch'}}>Normal Values</Text>
                                        </View>
                                    </View>
                                    <ListView
                                        dataSource={ds.cloneWithRows(rowData)}
                                        renderRow={(rowData, sectionID, rowID) => {
                                            return (
                                                <View style={{paddingLeft: 16, paddingRight: 16, paddingBottom: 5, marginTop: 0, borderStyle: 'solid', borderBottomWidth: 0.5, borderBottomColor: '#EEE'}}>
                                                    {_.map(rowData, (v, i) => {
                                                        return (
                                                            <View key={i} style={{flexDirection: 'row', paddingTop: 5, paddingBottom: 5}}>
                                                                <Text style={{flex:1, alignItems: 'stretch'}}>{i}</Text>
                                                                <Text style={{flex:1, marginLeft: 5, marginRight: 5, alignItems: 'stretch', textAlign: 'center', color: v.color}}>{v.value} {v.unit}</Text>
                                                                <Text style={{flex:1, alignItems: 'stretch'}}>{(v.normalMinValue && v.normalMaxValue) ? (v.normalMinValue || '0')+' - '+(v.normalMaxValue || '0'): '' } {v.unit || ''}</Text>
                                                            </View>
                                                        )
                                                    })}
                                                </View>
                                            )
                                        }}
                                        enableEmptySections={true}
                                    />
                                </View>
                            )
                        }}
                        enableEmptySections={true}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.recentItemUpdate.bind(this)}
                            />
                        }/>
                </View>
            )
            break;
            case 4:
            return (
                <ScrollView style={{flex: 1}}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.getChart.bind(this)}
                        />
                    }>
                    <View style={{backgroundColor: '#FFFFFF'}}>
                        {_.map(this.state.allItem, (v, i) => {
                            return (
                                <View key={i} style={{flex: 1, alignItems: 'stretch'}}>
                                    <View style={{padding: 10, paddingLeft: 16, paddingRight: 16, backgroundColor: '#FFEB3B', elevation: 1}}>
                                        <Text style={{fontSize: 20, color: '#424242'}}>{i}</Text>
                                    </View>
                                    <LineChart
                                        ref={ref => this.lineChartRef = ref}
                                        style={{flex:1, height: 300, margin: 16, marginTop: 0, marginBottom: 20}}
                                        visibleXRange={[0,7]}
                                        xAxis={{drawGridLines:false,gridLineWidth:1,position:"BOTTOM"}}
                                        yAxisRight={{enable:false}}
                                        yAxis={{startAtZero:false,drawGridLines:false, drawLimitLinesBehindData: true, position:"INSIDE_CHART"}}
                                        yAxisLeft={{max: {Limit: v.max, LineColor: "#F44336", LineWidth: 1, Label: _.toString(v.max), TextColor: '#F44336', TextSize: 10}, min: {Limit: v.min, LineColor: "#673AB7", LineWidth: 1, Label: _.toString(v.min), TextColor: '#673AB7', TextSize: 10}}}
                                        drawGridBackground={false}
                                        description={"Day/Month"}
                                        legend={{enable:false,position:'ABOVE_CHART_LEFT',direction:"LEFT_TO_RIGHT"}}
                                        data={v}/>
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            )
            break;
        }
    }
    getChart() {
        this.setState({refreshing: true, allItem: {}})
        db.transaction((tx) => {
            tx.executeSql("SELECT `labwork`.`completionDate`, `labwork`.`labData` FROM `labwork` WHERE (`labwork`.`deleted_at` in (null, 'NULL', '') OR `labwork`.`deleted_at` is null) AND `labwork`.`completed` = 1 AND `labwork`.`patientID` = ? AND `labwork`.`userID` = ? ORDER BY `labwork`.`completionDate` ASC, `labwork`.`created_at` ASC", [this.props.patientID, this.state.doctorUserID], (tx, rs) => {
                var recentItemObj = {};
                _.forEach(rs.rows, (v, i) => {
                    var orderDate = rs.rows.item(i).completionDate;
                    var labData = _.split(_.split(rs.rows.item(i).labData, ':::')[1], '@@');
                    tx.executeSql("SELECT name, normalMinValue, normalMaxValue, isNumeric FROM `labItem` WHERE `labItem`.`id` in ("+_.join(_.split(_.split(rs.rows.item(i).labData, ':::')[0], '@@'), ',')+")", [], (tx, rs) => {
                        _.forEach(rs.rows, (v, i) => {
                            if (_.isObject(recentItemObj[rs.rows.item(i).name])) {
                                if (orderDate in recentItemObj[rs.rows.item(i).name])
                                    recentItemObj[rs.rows.item(i).name][orderDate].push(labData[i]);
                                else {
                                    recentItemObj[rs.rows.item(i).name][orderDate] = [];
                                    recentItemObj[rs.rows.item(i).name][orderDate].push(labData[i]);
                                }
                            } else {
                                var obj = {};
                                obj['isNumeric'] = rs.rows.item(i).isNumeric;
                                obj['min'] = rs.rows.item(i).normalMinValue;
                                obj['max'] = rs.rows.item(i).normalMaxValue;
                                obj[orderDate] = [];
                                recentItemObj[rs.rows.item(i).name] = obj;
                                recentItemObj[rs.rows.item(i).name][orderDate].push(labData[i]);
                            }
                        })
                    })

                })
                db.recentItem = recentItemObj
            })
        }, (err) => {
            this.setState({refreshing: false})
        }, () => {
            var obj = {};
            _.forEach(db.recentItem, (v, i) => {
                var data={};
                if (v.isNumeric) {
                    data['min']= v.min;
                    data['max']= v.max;
                    data['xValues']=[];
                    data['yValues']=[{
                        data:[],
                        label: i,
                        config:{ color:'#2979FF' }
                    }, {
                        data:[],
                        label: i,
                        config:{ color:'#2979FF' }
                    }, {
                        data:[],
                        label: i,
                        config:{ color:'#2979FF' }
                    }];
                    _.forEach(v, (vv, ii) => {
                        if (ii != 'isNumeric' && ii != 'min' && ii != 'max' && moment(ii).isValid()) {
                            data.xValues.push(moment(ii).format('DD/MM'));
                        }
                    })
                    _.forEach(v, (vv, ii) => {
                        if (ii != 'isNumeric' && ii != 'min' && ii != 'max' && moment(ii).isValid()) {
                            data.yValues[0].data.push(parseFloat(vv[0]));
                            data.yValues[1].data.push(parseFloat(_.isEmpty(vv[1]) ? vv[0] : vv[1]));
                            data.yValues[2].data.push(parseFloat(_.isEmpty(vv[2]) ? vv[0] : vv[2]));
                        }
                    })
                    obj[i] = data
                }
            })
            // alert(JSON.stringify(db.recentItem))
            this.setState({allItem: obj, refreshing: false})
        })
    }
    labItemSelect(labItemID) {
        var obj = this.state.labItemSelect; obj[labItemID] = (_.isEmpty(obj[labItemID])) ? labItemID : false;
        var myArray = []; myArray.push(obj);
        this.setState({labItemSelect: myArray[0]})
    }
    labItemOrder() {
        var labItems = _.compact(_.toArray(this.state.labItemSelect))
        if (_.size(labItems) > 0) {
            var values = _.join(_.fill(Array(_.size(labItems))), '@@') ;
            var data = _.join(labItems, '@@');
            var labData = data+':::'+values;
            db.transaction((tx) => {
                var insertID = this.state.mobileID*100000;
                tx.executeSql("SELECT id FROM labwork WHERE id BETWEEN "+insertID+" AND "+((insertID*2)-1)+" ORDER BY created_at DESC LIMIT 1", [], (tx, rs) => {
                    if (rs.rows.length > 0)
                        insertID = rs.rows.item(0).id + 1;
                    var insert = [insertID, this.props.patientID, this.props.diagnosisID, this.state.doctorUserID, moment().format('YYYY-MM-DD'), null, null, labData, null, null, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];
                    tx.executeSql("INSERT INTO `labwork` (`id`, `patientID`, `diagnosisID`, `userID`, `orderDate`, `completionDate`, `completed`, `labData`, `viewed`, `deleted_at`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", insert, (tx, rs) => {
                        console.log('insert:', rs.insertId)
                    })
                })
            }, (err) => {
                alert(err.message)
            }, () => {
                ToastAndroid.show('Laboratory Items Successfully Order!', 3000)
                this.setState({labItemSelect: {}})
                this.updateData(['labwork']);
            })
        } else
        ToastAndroid.show('No Item Selected!', 1000)
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
            console.log(_.join(rows, '&'))
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
    containerWrapper: {
        backgroundColor: '#FFF',
        paddingTop: 16,
        paddingLeft: 12,
        paddingRight: 12,
    },
    heading: {
        fontSize: 30,
        color: '#616161',
        padding: 10,
        paddingLeft: 16,
        paddingRight: 16,
    },
    label: {
        color: '#616161',
        textAlign: 'left',
        marginLeft: 4,
        marginRight: 4,
    },
    select: {
        borderBottomWidth: 1,
        borderBottomColor: '#757575',
        borderStyle: 'solid',
        marginLeft: 4,
        marginRight: 4,
        marginBottom: 10,
        paddingLeft: -5,
    },
    textInput: {
        fontSize: 16,
        paddingTop: 5   ,
        marginBottom: 5,
    },
    slider: {
        paddingTop: 5,
        marginBottom: 5,
        marginLeft: -10,
        marginRight: -10,
    },
    switch: {
        height: 25,
        textAlignVertical: 'center',
        color: '#9E9E9E'
    },
    steps: {
        flex:1,
        alignItems: 'stretch',
        backgroundColor: '#FFF59D',
    },
    stepsActive: {
        backgroundColor: '#FFEB3B',
    },
    stepsText: {
        color:'#757575',
        padding: 8,
        fontSize: 16,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    stepsTextActive: {
        color: '#616161',
    }
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

module.exports = OrderItem

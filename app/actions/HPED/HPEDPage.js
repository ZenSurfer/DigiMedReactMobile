'use strict';

import React, {Component} from 'react'
import {StyleSheet, Text, View, ListView, RefreshControl, Navigator, Dimensions, ToastAndroid, TouchableOpacity, TouchableNativeFeedback, Image} from 'react-native'
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

class HPEDPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            doctorID: EnvInstance.getDoctor().id,
            refreshing: false,
            rowData: [],
            avatar: false
        }
    }
    componentWillMount() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT `diagnosis`.`id` AS `id`, ('Dr. ' || `doctors`.`firstname` || ' ' || `doctors`.`middlename` || ' ' || `doctors`.`lastname`)  AS `doctorName`, `diagnosis`.`date` AS `date`, `diagnosis`.`chiefComplaint` AS `chiefComplaint`, (SELECT (`followup`.`date`|| ' ' ||`followup`.`time`|| '@@' ||`followup`.`name`) as description FROM `followup` WHERE `followup`.`leadSurgeon`="+this.state.doctorID+" AND `followup`.`diagnosisID` = `diagnosis`.`id` AND (`followup`.`date` || ' ' || `followup`.`time`) >= '"+moment().format('YYYY-MM-DD HH:mm:SS')+"' AND (`followup`.`deleted_at` in (null, 'NULL', '') OR `followup`.`deleted_at` is null) ORDER BY `followup`.`date` ASC, `followup`.`time` ASC LIMIT 1) as upcoming, (SELECT (`followup`.`date`|| ' ' ||`followup`.`time`|| '@@' ||`followup`.`name`) as description  FROM `followup` WHERE `followup`.`leadSurgeon`="+this.state.doctorID+" AND `followup`.`diagnosisID` = `diagnosis`.`id` AND (`followup`.`date` || ' ' || `followup`.`time`) < '"+moment().format('YYYY-MM-DD HH:mm:SS')+"' AND (`followup`.`deleted_at` in (null, 'NULL', '') OR `followup`.`deleted_at` is null) ORDER BY `followup`.`date` DESC, `followup`.`time` DESC LIMIT 1) as last FROM `diagnosis` LEFT OUTER JOIN `patients` on `diagnosis`.`patientID` = `patients`.`id` LEFT OUTER JOIN `doctors` on `diagnosis`.`doctorID` = `doctors`.`id` WHERE (`diagnosis`.`deleted_at` in (null, 'NULL', '') OR `diagnosis`.`deleted_at` is null) AND `diagnosis`.`patientID` = ? ORDER BY `diagnosis`.`date` DESC, `diagnosis`.`timeStart` DESC", [this.props.patientID], function(tx, rs) {
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
        })
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
                RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                    this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')})
                })
        })
    }
    componentWillReceiveProps(nextProps) {
        if (_.size(nextProps.navigator.getCurrentRoutes(0)) > 3) {
            this.setState({lastRoute: nextProps.navigator.getCurrentRoutes(0)[3].id})
        } else {
            if (this.state.lastRoute == 'HPEDInfo') {
                this.setState({lastRoute: ''});
                this.onRefresh();
            }
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
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>H.P.E.D.</Text>
                </View>
                <ListView
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
                    style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 24}]}
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
                        onPress={() => this.props.navigator.push({
                            id: 'OrderItem',
                            passProps: {
                                diagnosisID: this.props.diagnosisID,
                                patientID: this.props.patientID,
                                patientAvatar: this.props.patientAvatar,
                                patientName: this.props.patientName }
                        })}>
                        <View style={{backgroundColor: '#E91E63',  flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#EC407A', borderStyle: 'solid', borderRightWidth: 1}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'schedule'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Labwork</Text>
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
            <View style={{borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0'}}>
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
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0'}}>
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
                            <Icon style={{textAlignVertical: 'center', textAlign: 'center', color: '#616161'}} name='date-range' size={20}/>
                        </TouchableOpacity>
                        <View style={[styles.listView, {elevation: 0, flex: 1, alignItems: 'stretch'}]}>
                            <View style={styles.listText}>
                                <Text style={styles.listItem}>{(rowData.date) ? moment(rowData.date).format('MMMM DD, YYYY') : ''}</Text>
                                <Text style={styles.listItemHead}>{rowData.chiefComplaint}</Text>
                                {/* <Text style={styles.listItem}>{rowData.doctorName}</Text> */}
                            </View>
                        </View>
                    </View>
                </TouchableNativeFeedback>
                {(rowData.upcoming || rowData.last) ? (
                    <View style={{backgroundColor: '#FFEB3B'}}>
                        <TouchableNativeFeedback>
                        {(rowData.upcoming) ? (
                            <View style={{flexDirection: 'column',padding: 16, paddingTop: 5, paddingBottom: 5, borderBottomWidth: 0.5, borderBottomColor: '#FFF176'}}>
                                <Text style={{color: '#F44336', fontWeight: 'bold'}}>Upcoming Followup</Text>
                                <Text style={{color: '#616161', flex: 1, alignItems: 'stretch', fontStyle: 'italic'}}>
                                    {_.map(_.split(rowData.upcoming, '@@'), (v,i) => {
                                        if (i==1)
                                            return (<Text key={i}> {v}</Text>)
                                        else
                                            return (<Text key={i} style={{fontWeight: 'bold'}}>{moment(v).format('MMMM DD, YYYY')} at {moment(v).format('hh:mm A')},</Text>)

                                    })}
                                </Text>
                            </View>
                        ) : (
                            <View style={{flexDirection: 'column',padding: 16, paddingTop: 5, paddingBottom: 5, borderBottomWidth: 0.5, borderBottomColor: '#FFF176'}}>
                                <Text style={{color: '#616161', fontWeight: 'bold'}}>Previous Followup</Text>
                                <Text style={{color: '#616161', flex: 1, alignItems: 'stretch', fontStyle: 'italic'}}>
                                    {_.map(_.split(rowData.last, '@@'), (v,i) => {
                                        if (i==1)
                                            return (<Text key={i}> {v}</Text>)
                                        else
                                            return (<Text key={i} style={{fontWeight: 'bold'}}>{moment(v).format('MMMM DD, YYYY')} at {moment(v).format('hh:mm A')},</Text>)

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
            tx.executeSql("SELECT `diagnosis`.`id` AS `id`, ('Dr. ' || `doctors`.`firstname` || ' ' || `doctors`.`middlename` || ' ' || `doctors`.`lastname`)  AS `doctorName`, `diagnosis`.`date` AS `date`, `diagnosis`.`chiefComplaint` AS `chiefComplaint`, (SELECT (`followup`.`date`|| ' ' ||`followup`.`time`|| '@@' ||`followup`.`name`) as description FROM `followup` WHERE `followup`.`leadSurgeon`="+this.state.doctorID+" AND `followup`.`diagnosisID` = `diagnosis`.`id` AND (`followup`.`date` || ' ' || `followup`.`time`) >= '"+moment().format('YYYY-MM-DD HH:mm:SS')+"' AND (`followup`.`deleted_at` in (null, 'NULL', '') OR `followup`.`deleted_at` is null) ORDER BY `followup`.`date` ASC, `followup`.`time` ASC LIMIT 1) as upcoming, (SELECT (`followup`.`date`|| ' ' ||`followup`.`time`|| '@@' ||`followup`.`name`) as description  FROM `followup` WHERE `followup`.`leadSurgeon`="+this.state.doctorID+" AND `followup`.`diagnosisID` = `diagnosis`.`id` AND (`followup`.`date` || ' ' || `followup`.`time`) < '"+moment().format('YYYY-MM-DD HH:mm:SS')+"' AND (`followup`.`deleted_at` in (null, 'NULL', '') OR `followup`.`deleted_at` is null) ORDER BY `followup`.`date` DESC, `followup`.`time` DESC LIMIT 1) as last FROM `diagnosis` LEFT OUTER JOIN `patients` on `diagnosis`.`patientID` = `patients`.`id` LEFT OUTER JOIN `doctors` on `diagnosis`.`doctorID` = `doctors`.`id` WHERE (`diagnosis`.`deleted_at` in (null, 'NULL', '') OR `diagnosis`.`deleted_at` is null) AND `diagnosis`.`patientID` = ? ORDER BY `diagnosis`.`date` DESC, `diagnosis`.`timeStart` DESC", [this.props.patientID], function(tx, rs) {
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
        })
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
var NavigationBarRouteMapper = (patientID, patientName, avatar) => ({
    LeftButton(route, navigator, index, nextState) {
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                    onPress={() => navigator.parentNavigator.pop()}>
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
            <TouchableOpacity style={[Styles.title, {marginLeft: 50}]}>
                <Text style={[Styles.titleText]}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = HPEDPage;

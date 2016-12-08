'use strict';

import React, {Component} from 'react'
import {StyleSheet, Text, View, ListView, RefreshControl, Navigator, Dimensions, ToastAndroid, TouchableOpacity, TouchableNativeFeedback, Image, Alert, AsyncStorage} from 'react-native'
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

class PrescriptionPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            rowData: [],
            avatar: false
        }
    }
    componentWillMount() {
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
                RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                    this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')})
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
            this.onRefresh()
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
                    <Text style={Styles.subTitle}>Prescription</Text>
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
                    }/>
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 24}]}
                    onPress={() => this.props.navigator.push({
                        id: 'AddPrescription',
                        passProps: {
                            diagnosisID: this.props.diagnosisID,
                            patientID: this.props.patientID,
                            patientAvatar: this.props.patientAvatar,
                            patientName: this.props.patientName
                        }
                    })}>
                    <Icon name={'add'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        );
    }
    renderListView(rowData, rowID) {
        return (
            <View style={styles.listView}>
                <TouchableNativeFeedback
                    onPress={() => this.props.navigator.push({
                        id: 'EditPrescription',
                        passProps: {
                            diagnosisID: this.props.diagnosisID,
                            patientID: this.props.patientID,
                            patientAvatar: this.props.patientAvatar,
                            patientName: this.props.patientName,
                            prescriptionID: rowData.prescriptionID ,
                            prescriptionRowID: rowData.prescriptionRowID}
                    })}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <TouchableOpacity
                            style={{justifyContent: 'center', padding: 12, borderRadius: 50, backgroundColor: '#03A9F4', marginLeft: 16}}
                            onPress={() => {
                                Alert.alert(
                                    'Note',
                                    rowData.note,
                                    [{text: 'CLOSE'}])
                            }}>
                            <Icon style={{textAlignVertical: 'center', textAlign: 'center', color: '#FFF'}} name='announcement' size={20}/>
                        </TouchableOpacity>
                        <View style={[styles.listText, {flex: 1, alignItems: 'stretch'}]}>
                            <Text style={styles.listItem}>{(rowData.date) ? moment(rowData.date).format('MMMM DD, YYYY') : ''}</Text>
                            <Text style={styles.listItemHead}>{rowData.generic}</Text>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={[styles.listItem, {flex: 1, alignItems: 'stretch'}]}>{rowData.brand} / {rowData.dosage} / {rowData.frequency}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableNativeFeedback>
            </View>
        )
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM prescriptions WHERE doctorID=? AND patientID = ? AND (deleted_at in (null, 'NULL', '') OR deleted_at is null) ORDER BY dateIssued DESC", [this.state.doctorID, this.props.patientID], function(tx, rs) {
                db.data = rs.rows
            }, function(error) {
                console.log('SELECT SQL statement ERROR: ' + error.message);
            });
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            var rowData = [];
            _.forEach(db.data, function(v, i) {
                var genericName = _.split(db.data.item(i).genericName, '||');
                var brandName = _.split(db.data.item(i).brandName, '||');
                var frequency = _.split(db.data.item(i).frequency, '||');
                var dosage = _.split(db.data.item(i).dosage, '||');
                var form = _.split(db.data.item(i).forms, '||');
                var notes = _.split(db.data.item(i).notes, '||');
                _.forEach(genericName, (vv, ii) => {
                    var prescription = {
                        prescriptionID: db.data.item(i).id,
                        prescriptionRowID: ii,
                        date: db.data.item(i).dateIssued,
                        generic: genericName[ii],
                        brand: brandName[ii],
                        dosage: dosage[ii],
                        form: form[ii],
                        frequency: frequency[ii],
                        note: notes[ii],
                    }
                    rowData.push(prescription)
                })
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
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
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
        paddingTop: 0,
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

module.exports = PrescriptionPage;

'use-strict'

import React, {Component} from 'react'
import {StyleSheet, Text, View, ScrollView, Navigator, TouchableOpacity, ListView, DrawerLayoutAndroid, RefreshControl, Dimensions, InteractionManager, ActivityIndicator, TouchableNativeFeedback, TouchableHighlight, Modal, TextInput, ToastAndroid} from 'react-native'
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import moment from 'moment'
import _ from 'lodash'
import Env from '../../env'
import bcrypt from 'react-native-bcrypt'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const drawerRef = {}
const {height, width} = Dimensions.get('window')
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()

class UserSettingPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rowData: [],
            updated_at: moment().format('YYYY-MM-DD'),
            refreshing: true,
            renderPlaceholderOnly: true,
        }
    }
    componentWillMount() {
        this.setState({refreshing: true});
        db.transaction((tx) => {
            tx.executeSql("SELECT `doctors`.`id` as `doctorID`, `doctors`.`userID` as `userID`, `doctors`.`email` as email, `doctors`.`firstname` as `firstname`, `doctors`.`lastname` as `lastname`, `doctors`.`middlename` as `middlename`, `doctors`.`initial` as initial, `doctors`.`rank` as rank, `doctors`.`type` as type, `doctors`.`code` as code, `doctors`.`licenseID` as licenseID, `users`.`username` as `username`, `users`.`password` as `password` FROM `doctors` LEFT OUTER JOIN `users` ON `users`.`id` = `doctors`.`userID` WHERE `doctors`.`userID`= ? LIMIT 1", [this.props.userID], function(tx, rs) {
                db.data = rs.rows.item(0);
            });
        }, (err) => {
            ToastAndroid.show("Error occured while loading!", 3000);
        }, () => {
            var rowData = db.data;
            this.setState({refreshing: false, rowData: rowData});
        });
    }
    componentWillReceiveProps(nextProps) {
        if (_.size(nextProps.navigator.getCurrentRoutes(0)) > 1) {
            this.setState({lastRoute: nextProps.navigator.getCurrentRoutes(0)[1].id})
        } else {
            if (this.state.lastRoute == 'EditUserSetting') {
                this.setState({lastRoute: ''});
                this.onRefresh();
            }
        }
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator} routeName={'settings'}></DrawerPage>)
                }}
                statusBarBackgroundColor={'#2962FF'}
                ref={this.drawerInstance} >
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar style={Styles.navigationBar}
                            routeMapper={NavigationBarRouteMapper} />
                    }
                    />
            </DrawerLayoutAndroid>
        )
    }
    renderScene(route, navigator) {
        return (
            <View style={{flex: 1}}>
                <View style={Styles.containerStyle}>
                    <View style={Styles.subTolbar}>
                        <Text style={Styles.subTitle}>{this.props.doctorName}</Text>
                    </View>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }>
                        <View style={[styles.person, {backgroundColor: '#FFFFFF', borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0'}]}>
                            <View style={{backgroundColor: '#FFFFFF', marginTop: 10}}>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={[styles.label, {fontSize: 25, color:'#424242'}]}>User Settings</Text>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Username</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.username) ? this.state.rowData.username : '-'}</Text></View>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>***************************</Text></View>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.person, {backgroundColor: '#FFFFFF', paddingTop: 20}]}>
                            <View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={[styles.label, {fontSize: 25, color:'#424242'}]}>Account Settings</Text>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column', paddingTop: 5}]}>
                                        <Text style={styles.label}>Initial</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.initial) ? this.state.rowData.initial : '-'}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Rank</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.rank) ? this.state.rowData.rank : '-'}</Text></View>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Specialization</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.type) ? this.state.rowData.type : '-'}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Code</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.code) ? this.state.rowData.code : '-'}</Text></View>
                                    </View>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>License ID</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.licenseID) ? this.state.rowData.licenseID : '-'}</Text></View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    <TouchableOpacity
                        style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 5}]}
                        onPress={() =>  this.props.navigator.push({
                            id: 'EditUserSetting',
                            passProps: {
                                userID: this.props.userID,
                                doctorID: this.props.doctorID,
                                doctorName: this.props.doctorName,
                            }
                        })}>
                        <Icon name={'edit'} color={'#FFFFFF'} size={30}/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    onRefresh() {
        this.setState({refreshing: true});
        db.transaction((tx) => {
            tx.executeSql("SELECT `doctors`.`id` as `doctorID`, `doctors`.`userID` as `userID`, `doctors`.`email` as email, `doctors`.`firstname` as `firstname`, `doctors`.`lastname` as `lastname`, `doctors`.`middlename` as `middlename`, `doctors`.`initial` as initial, `doctors`.`rank` as rank, `doctors`.`type` as type, `doctors`.`code` as code, `doctors`.`licenseID` as licenseID, `users`.`username` as `username`, `users`.`password` as `password` FROM `doctors` LEFT OUTER JOIN `users` ON `users`.`id` = `doctors`.`userID` WHERE `doctors`.`userID`= ? LIMIT 1", [this.props.userID], function(tx, rs) {
                db.data = rs.rows.item(0);
            });
        }, (err) => {
            ToastAndroid.show("Error occured while loading!", 3000);
        }, () => {
            var rowData = db.data;
            this.setState({refreshing: false, rowData: rowData});
        });
    }
    drawerInstance(instance) {
        drawerRef = instance
    }
}

var styles = StyleSheet.create({
    person: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        paddingLeft: 16,
        paddingRight: 16,
    },
    rows: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    label: {
        color: '#757575',
        paddingRight: 5,
        textAlignVertical: 'center',
        // textDecorationLine: 'underline'
    },
    textWrapper: {
        backgroundColor: '#FFFFFF',
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 2,
    },
    text: {
        color: '#212121',
        fontSize: 17,
    },
    hr: {
      flex: 1,
      height: 1,
      backgroundColor: '#b3b3b3',
    }
})

var NavigationBarRouteMapper = {
    LeftButton(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={Styles.leftButton}
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
                <Text style={Styles.titleText}>Settings</Text>
            </TouchableOpacity>
        )
    }
}

module.exports = UserSettingPage

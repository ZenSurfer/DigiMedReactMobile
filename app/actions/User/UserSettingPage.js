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
            doctorID: EnvInstance.getDoctor().id,
            doctorName: '',
            rowData: [],

            password: '',
            newPassword: '',
            cnewPassword: '',
            updated_at: moment().format('YYYY-MM-DD'),

            refreshing: true,
        }
    }
    componentWillMount() {
        this.setState({refreshing: true});
        db.transaction((tx) => {
            tx.executeSql("SELECT `doctors`.`id` as `doctorID`, `doctors`.`userID` as `userID`, `doctors`.`email` as email, `doctors`.`firstname` as `firstname`, `doctors`.`lastname` as `lastname`, `doctors`.`middlename` as `middlename`, `doctors`.`initial` as initial, `doctors`.`rank` as rank, `doctors`.`type` as type, `doctors`.`code` as code, `doctors`.`licenseID` as licenseID, `users`.`username` as `username`, `users`.`password` as `password` FROM `doctors` LEFT OUTER JOIN `users` ON `users`.`id` = `doctors`.`userID` WHERE `doctors`.`userID`= ? LIMIT 1", [this.state.doctorID], function(tx, rs) {
                // alert(JSON.stringify(rs.rows.item(0)));
                db.data = rs.rows.item(0);
            });
        }, (err) => {
            ToastAndroid.show("Error occured while loading!", 3000);
        }, () => {
            var rowData = db.data;
            var doctorName = "Dr. "+rowData.firstname+" "+((rowData.middlename) ? rowData.middlename+" ":"")+" "+rowData.lastname;
            this.setState({refreshing: false, rowData: rowData, doctorName: doctorName});
        });
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
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({renderPlaceholderOnly: false, progress: 1});
        });
    }
    renderScene(route, navigator) {
        return (
            <View style={{flex: 1}}>
                <View style={Styles.containerStyle}>
                    {this.props.children}
                    <View style={Styles.subTolbar}>
                            <Text style={Styles.subTitle}>{this.state.doctorName}</Text>
                    </View>
                    <ScrollView
                        style={{marginBottom: 30, marginTop: 0,}}
                        refreshControl={
                            <RefreshControl
                                style={{marginTop: 20}}
                                refreshing={this.state.refreshing}
                                progressViewOffset={0}
                                onRefresh={this.onRefresh.bind(this)}
                                />
                        }>
                        <View style={[styles.person, {backgroundColor: '#FFFFFF'}]}>
                            <View style={{backgroundColor: '#FFFFFF', marginTop: 10}}>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Username</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{this.state.rowData.username}</Text></View>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>***************************</Text></View>
                                </View>
                                <View style={styles.hr}></View>
                                <View style={[styles.rows, {flexDirection: 'column', paddingTop: 5}]}>
                                    <Text style={styles.label}>Rank</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.rank != '' ? this.state.rowData.rank : '-')}</Text></View>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Specialization</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.type != '' ? this.state.rowData.type : '-')}</Text></View>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Code</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.code != '' ? this.state.rowData.code : '-')}</Text></View>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>License ID</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{this.state.rowData.licenseID}</Text></View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    <TouchableOpacity
                        style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 5}]}
                        onPress={() =>  this.props.navigator.push({
                            id: 'EditUserSetting',
                            passProps: {
                                doctorID: this.state.doctorID,
                                doctorName: this.state.doctorName,
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
            tx.executeSql("SELECT `doctors`.`id` as `doctorID`, `doctors`.`userID` as `userID`, `doctors`.`email` as email, `doctors`.`firstname` as `firstname`, `doctors`.`lastname` as `lastname`, `doctors`.`middlename` as `middlename`, `doctors`.`initial` as initial, `doctors`.`rank` as rank, `doctors`.`type` as type, `doctors`.`code` as code, `doctors`.`licenseID` as licenseID, `users`.`username` as `username`, `users`.`password` as `password` FROM `doctors` LEFT OUTER JOIN `users` ON `users`.`id` = `doctors`.`userID` WHERE `doctors`.`userID`= ? LIMIT 1", [this.state.doctorID], function(tx, rs) {
                //alert(JSON.stringify(rs.rows.item(0)));
                db.data = rs.rows.item(0);
            });
        }, (err) => {
            ToastAndroid.show("Error occured while loading!", 3000);
        }, () => {
            var rowData = db.data;
            var doctorName = "Dr. "+rowData.firstname+" "+((rowData.middlename) ? rowData.middlename+" ":"")+" "+rowData.lastname;
            this.setState({refreshing: false, rowData: rowData, doctorName: doctorName});
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
        color: '#616161',
        fontSize: 20,
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

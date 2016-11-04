'use-strict'

import React, {Component} from 'react'
import {StyleSheet, Text, View, ScrollView, Navigator, TouchableOpacity, ListView, DrawerLayoutAndroid, RefreshControl, Dimensions, InteractionManager, ActivityIndicator, TextInput, ToastAndroid, Modal, TouchableNativeFeedback} from 'react-native'
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
const avatar = require('../../assets/images/banner.jpg')

class EditUserSetting extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rowData: [],
            refreshing: true,

            username: '',
            password: '',
            newPassword: '',
            cnewPassword: '',
            initial: '',
            rank: '',
            type: '',
            code: '',
            licenseID: '',
            updated_at: moment().format('YYYY-MM-DD'),

            animationType: 'slide',
            avatar: '',
            modalVisible: false,
            transparent: false,
            renderPlaceholderOnly: true,
            progress: 0,
            statusBarBackgroundColor: '#FFF',
        }
    }
    componentWillMount() {
        this.setState({refreshing: true});
        db.transaction((tx) => {
            tx.executeSql("SELECT `doctors`.`id` as `doctorID`, `doctors`.`userID` as `userID`, `doctors`.`email` as email, `doctors`.`firstname` as `firstname`, `doctors`.`lastname` as `lastname`, `doctors`.`middlename` as `middlename`, `doctors`.`initial` as `initial`, `doctors`.`rank` as `rank`, `doctors`.`type` as `type`, `doctors`.`code` as `code`, `doctors`.`licenseID` as `licenseID`, `users`.`username` as `username`, `users`.`password` as `password` FROM `doctors` LEFT OUTER JOIN `users` ON `users`.`id` = `doctors`.`userID` WHERE `doctors`.`userID`= ? LIMIT 1", [this.props.doctorID], function(tx, rs) {
                alert(JSON.stringify(rs.rows.item(0)));
                db.data = rs.rows.item(0);
            });
        }, (err) => {
            ToastAndroid.show("Error occured while loading!", 3000);
        }, () => {
            var rowData = db.data
            this.setState({
                refreshing: false,
                username: rowData.username,
                initial: rowData.initial,
                rank: rowData.rank,
                type: rowData.type,
                code: rowData.code,
                licenseID: rowData.licenseID,
                rowData: rowData,
            });
        });
    }
    render() {
        return (
            <Navigator
                renderScene={(this.state.renderPlaceholderOnly) ? this.renderPlaceholderView.bind(this) : this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={[Styles.navigationBar,{marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper(this.props.doctorID, this.props.doctorName)} />
                }/>
        )
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({renderPlaceholderOnly: false, progress: 1});
        });
    }
    renderPlaceholderView() {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Edit Setting</Text>
                </View>
                <View style={Styles.loading}>
                    <View style={Styles.horizontal}><ActivityIndicator color="#212121" size={23}/></View>
                </View>
            </View>
        );
    }
    renderScene(route, navigator) {
        return (
            <View style={{flex: 1}}>
                <View style={Styles.containerStyle}>
                    {this.props.children}
                    <View style={[Styles.subTolbar, {marginTop: 24}]}>
                        <Text style={Styles.subTitle}>Edit Setting</Text>
                    </View>
                    <Modal
                        animationType={"slide"}
                        transparent={false}
                        visible={this.state.modalVisible}
                        onRequestClose={() => {alert("Modal has been closed.")}}
                    >
                        <View style={{flex: 1, alignItems: 'stretch'}}>
                            <View style={{flex: 1, backgroundColor: '#FFF'}}>
                                <View style={{padding: 16, paddingRight: 0, paddingBottom: 16, paddingTop: 16, backgroundColor: '#2962FF', elevation: 2}}>
                                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                                        <Text style={{color: '#FFF', fontSize: 26, textAlignVertical: 'center'}}>Change Password</Text>
                                        <TouchableOpacity
                                            style={{padding: 16, paddingTop: 0, paddingBottom: 0,}}
                                            onPress={() => this.setState({modalVisible: false})}>
                                            <Icon name={'close'} size={30} color={'#FFF'} style={{textAlignVertical: 'center'}}/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{flex: 1}}>
                                    <View style={{backgroundColor: '#FFFFFF', padding: 16}}>
                                        <Text style={styles.label} >Current Password</Text>
                                        <TextInput
                                            secureTextEntry={true}
                                            placeholder={'Text Here...'}
                                            placeholderTextColor={'#E0E0E0'}
                                            onChangeText={(text) => this.setState({password: text})} />
                                        <Text style={styles.label} >New Password</Text>
                                        <TextInput
                                            secureTextEntry={true}
                                            placeholder={'Text Here...'}
                                            placeholderTextColor={'#E0E0E0'}
                                            onChangeText={(text) => this.setState({newPassword: text})} />
                                        <Text style={styles.label} >Confirm New Password</Text>
                                        <TextInput
                                            secureTextEntry={true}
                                            placeholder={'Text Here...'}
                                            placeholderTextColor={'#E0E0E0'}
                                            onChangeText={(text) => this.setState({cnewPassword: text})} />
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', alignItems: 'stretch'}}>
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        style={{flex: 1, alignItems: 'stretch'}}
                                        onPress={() => {
                                            this.setState({refreshing: true})
                                            if (this.state.password !== '' && this.state.newPassword !== '' && this.state.cnewPassword !== '') {
                                                if(bcrypt.compareSync(this.state.password, this.state.rowData.password)) {
                                                    if(this.state.newPassword == this.state.cnewPassword) {
                                                        var newPassword = bcrypt.hashSync(this.state.newPassword);
                                                        newPassword = newPassword.replace('$2a$', '$2y$');
                                                        db.transaction((tx) => {
                                                            tx.executeSql("UPDATE `users` SET `password` = ?, `updated_at` = ? WHERE `id` = ?"
                                                            , [newPassword, this.state.updated_at, this.props.doctorID]
                                                            , (tx, rs) => {
                                                                console.log("updated doctors: " + rs.rowsAffected);
                                                            })
                                                        }, (err) => {
                                                            // alert(err.message);
                                                            ToastAndroid.show("Error occured while saving!", 3000)
                                                        }, () => {
                                                            this.setState({refreshing: false, modalVisible: false})
                                                            this.props.navigator.replacePreviousAndPop({
                                                                id: 'UserSettingPage',
                                                                passProps: { doctorID: this.props.doctorID }
                                                            });
                                                            ToastAndroid.show("Successfully changed password!", 3000)
                                                        })
                                                    } else {
                                                        ToastAndroid.show("New password not matched!", 3000)
                                                    }
                                                } else {
                                                    ToastAndroid.show("Wrong current password!", 3000)
                                                }
                                            } else { // Required Fields
                                                if (this.state.password == '') {
                                                    ToastAndroid.show("Invalid Password!", 3000)
                                                } else if (this.state.newPassword == '') {
                                                    ToastAndroid.show("Invalid New Password!", 3000)
                                                } else if (this.state.cnewPassword == '') {
                                                    ToastAndroid.show("Invalid Confirm New Password!", 3000)
                                                } else {
                                                    ToastAndroid.show("An error occured!", 3000)
                                                }
                                            }
                                            this.setState({refreshing: false})
                                        }}>
                                        <View style={{backgroundColor: '#4CAF50'}}>
                                            <Text style={{textAlign: 'center', color: '#FFF', padding: 16, paddingTop: 20, paddingBottom: 20}}>SAVE</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <ScrollView
                        keyboardShouldPersistTaps={true}>
                        <View style={{backgroundColor: '#FFFFFF', padding: 16}}>
                            <Text style={styles.label} >Username</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.username)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({username: text})} />
                            <Text style={styles.label} >Initial</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.initial)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({initial: text})} />
                            <Text style={styles.label} >Rank</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.rank)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({rank: text})} />
                            <Text style={styles.label} >Specialization</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.type)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({type: text})} />
                            <Text style={styles.label} >Code</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.code)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({code: text})} />
                            <Text style={styles.label} >LicenseID</Text>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={styles.textInput}
                                autoCapitalize={'words'}
                                value={_.toString(this.state.licenseID)}
                                placeholderTextColor={'#E0E0E0'}
                                onChangeText={(text) => this.setState({licenseID: text})} />
                            <View style={{paddingTop: 10, paddingBottom: -5}}>
                                <TouchableNativeFeedback onPress={() => { this.setState({modalVisible: true});}}>
                                    <View style={{backgroundColor: '#E91E63', flex: 1, alignItems: 'stretch',  padding: 10}}>
                                        <Text style={{textAlign: 'center', fontSize: 19, color: '#FFFFFF'}}><Icon name={'lock'} size={18} /> Change Password</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        </View>
                    </ScrollView>
                    <TouchableOpacity
                        style={[Styles.buttonFab, {backgroundColor: '#4CAF50'}]}
                        onPress={this.onSubmit.bind(this)}>
                        <Icon name={'save'} color={'#FFFFFF'} size={30}/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    onSubmit() {
        this.setState({refreshing: true})
        if (_.trim(this.state.username) !== '' && _.trim(this.state.licenseID) !== '') {
            db.transaction((tx) => {
                tx.executeSql("UPDATE `users` SET `username` = ?, `updated_at` = ? WHERE `id` = ?"
                , [this.state.username, this.state.updated_at, this.props.doctorID]
                , (tx, rs) => {
                    console.log("updated users: " + rs.rowsAffected);
                })

                tx.executeSql("UPDATE `doctors` SET `initial` = ?, `rank` = ?, `type` = ?, `code` = ?, `licenseID` = ?, `updated_at` = ? WHERE `userID` = ?"
                , [this.state.initial, this.state.rank, this.state.type, this.state.code, this.state.licenseID, this.state.updated_at, this.props.doctorID]
                , (tx, rs) => {
                    console.log("updated doctors: " + rs.rowsAffected);
                })
            }, (err) => {
                this.setState({refreshing: false})
                ToastAndroid.show("Error occured while saving!", 3000)
            }, () => {
                this.setState({refreshing: false})
                this.props.navigator.replacePreviousAndPop({
                    id: 'UserSettingPage',
                    passProps: { doctorID: this.props.doctorID }
                });
                ToastAndroid.show("Successfully saved!", 3000)
            })
        } else { // Required Fields
            if (_.trim(this.state.username) == '') {
                ToastAndroid.show("Invalid Username!", 3000)
            } else if (_.trim(this.state.licenseID) == '') {
                ToastAndroid.show("Invalid License ID!", 3000)
            } else {
                ToastAndroid.show("An error occured!", 3000)
            }
        }
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
    textWrapper: {
        backgroundColor: '#FFFFFF',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 2,
        elevation: 1,
    },
    text: {
        color: '#424242',
        fontSize: 20,
    },
})

var NavigationBarRouteMapper = (doctorID, doctorName) => ({
    LeftButton(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
                onPress={() => {
                    navigator.parentNavigator.replacePreviousAndPop({
                        id: 'UserSettingPage',
                        passProps: {
                            doctorID: doctorID
                        }
                    })
                }}>
                <Text style={{color: 'white', margin: 10,}}>
                    <Icon name="keyboard-arrow-left" size={30} color="#FFF" />
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
                <Text style={Styles.titleText}>{doctorName}</Text>
            </TouchableOpacity>
        )
    }
}
)
module.exports = EditUserSetting

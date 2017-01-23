'use-strict'

import React, {Component} from 'react'
import {StyleSheet, Text, View, ScrollView, Navigator, TouchableOpacity, ListView, DrawerLayoutAndroid, RefreshControl, Dimensions, InteractionManager, ActivityIndicator, TextInput, ToastAndroid, Modal, TouchableNativeFeedback, AsyncStorage} from 'react-native'
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
            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),

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
            tx.executeSql("SELECT `doctors`.`id` as `doctorID`, `doctors`.`userID` as `userID`, `doctors`.`email` as email, `doctors`.`firstname` as `firstname`, `doctors`.`lastname` as `lastname`, `doctors`.`middlename` as `middlename`, `doctors`.`initial` as `initial`, `doctors`.`rank` as `rank`, `doctors`.`type` as `type`, `doctors`.`code` as `code`, `doctors`.`licenseID` as `licenseID`, `users`.`username` as `username`, `users`.`password` as `password` FROM `doctors` LEFT OUTER JOIN `users` ON `users`.`id` = `doctors`.`userID` WHERE `doctors`.`userID`= ? LIMIT 1", [this.props.userID], function(tx, rs) {
                // alert(JSON.stringify(rs.rows.item(0)));
                db.data = rs.rows.item(0);
            });
        }, (err) => {
            ToastAndroid.show("Error Occured!", 3000);
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
                cVisibility: false,
                nVisibility: false,
                cnVisibility: false,
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
                        routeMapper={NavigationBarRouteMapper(this.props.doctorName)} />
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
                        animationType={"fade"}
                        transparent={true}
                        visible={this.state.modalVisible}
                        onRequestClose={() => this.setState({modalVisible: false})}>
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'stretch', backgroundColor: 'rgba(0,0,0,0.4)'}}>
                            <View style={{backgroundColor: '#FFF', marginLeft: 20, marginRight: 20, elevation: 5, borderRadius: 2}}>
                                <View style={{padding: 16, paddingRight: 0, paddingBottom: 16, paddingTop: 16}}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                        <Text style={{color: '#212121', fontSize: 26, textAlignVertical: 'center'}}>Change Password</Text>
                                    </View>
                                </View>
                                <View style={{marginBottom: -10, marginTop: -10}}>
                                    <View style={{backgroundColor: '#FFFFFF', padding: 16}}>
                                        <Text style={styles.label} >Current Password</Text>
                                        <View>
                                            <TextInput
                                                style={styles.textInput}
                                                secureTextEntry={!this.state.cVisibility}
                                                placeholder={'Text Here...'}
                                                placeholderTextColor={'#E0E0E0'}
                                                onChangeText={(text) => this.setState({password: text})}
                                                returnKeyType={'next'}/>
                                            {(this.state.cVisibility) ? (
                                                <TouchableOpacity
                                                    style={{position: 'absolute', top: 0, height: 50, right: 0, flex: 1, justifyContent: 'center'}}
                                                    onPress={() => this.setState({cVisibility: false})}>
                                                    <Icon size={25} name={'visibility-off'} color={'#616161'} style={{padding: 10}}/>
                                                </TouchableOpacity>
                                                ) : (
                                                <TouchableOpacity
                                                    style={{position: 'absolute', top: 0, height: 50, right: 0, flex: 1, justifyContent: 'center'}}
                                                    onPress={() => this.setState({cVisibility: true})}>
                                                    <Icon size={25} name={'visibility'} color={'#616161'} style={{padding: 10}}/>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <Text style={styles.label} >New Password</Text>
                                        <View>
                                            <TextInput
                                                style={styles.textInput}
                                                secureTextEntry={!this.state.nVisibility}
                                                placeholder={'Text Here...'}
                                                placeholderTextColor={'#E0E0E0'}
                                                onChangeText={(text) => this.setState({newPassword: text})}
                                                returnKeyType={'next'}/>
                                            {(this.state.nVisibility) ? (
                                                <TouchableOpacity
                                                    style={{position: 'absolute', top: 0, height: 50, right: 0, flex: 1, justifyContent: 'center'}}
                                                    onPress={() => this.setState({nVisibility: false})}>
                                                    <Icon size={25} name={'visibility-off'} color={'#616161'} style={{padding: 10}}/>
                                                </TouchableOpacity>
                                                ) : (
                                                <TouchableOpacity
                                                    style={{position: 'absolute', top: 0, height: 50, right: 0, flex: 1, justifyContent: 'center'}}
                                                    onPress={() => this.setState({nVisibility: true})}>
                                                    <Icon size={25} name={'visibility'} color={'#616161'} style={{padding: 10}}/>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <Text style={styles.label} >Confirm New Password</Text>
                                        <View>
                                            <TextInput
                                                style={styles.textInput}
                                                secureTextEntry={!this.state.cnVisibility}
                                                placeholder={'Text Here...'}
                                                placeholderTextColor={'#E0E0E0'}
                                                onChangeText={(text) => this.setState({cnewPassword: text})}
                                                returnKeyType={'next'}/>
                                            {(this.state.cnVisibility) ? (
                                                <TouchableOpacity
                                                    style={{position: 'absolute', top: 0, height: 50, right: 0, flex: 1, justifyContent: 'center'}}
                                                    onPress={() => this.setState({cnVisibility: false})}>
                                                    <Icon size={25} name={'visibility-off'} color={'#616161'} style={{padding: 10}}/>
                                                </TouchableOpacity>
                                                ) : (
                                                <TouchableOpacity
                                                    style={{position: 'absolute', top: 0, height: 50, right: 0, flex: 1, justifyContent: 'center'}}
                                                    onPress={() => this.setState({cnVisibility: true})}>
                                                    <Icon size={25} name={'visibility'} color={'#616161'} style={{padding: 10}}/>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <View style={{margin: 5, flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <TouchableNativeFeedback
                                        onPress={() => this.setState({modalVisible: false})}>
                                        <View style={{padding: 15, justifyContent: 'center', width: 100}}>
                                            <Text style={{textAlign: 'center'}}>CANCEL</Text>
                                        </View>
                                    </TouchableNativeFeedback>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            this.setState({refreshing: true})
                                            if (this.state.password !== '' && this.state.newPassword !== '' && this.state.cnewPassword !== '') {
                                                if(bcrypt.compareSync(this.state.password, this.state.rowData.password)) {
                                                    if(this.state.newPassword == this.state.cnewPassword) {
                                                        var newPassword = bcrypt.hashSync(this.state.newPassword);
                                                        newPassword = newPassword.replace('$2a$', '$2y$');
                                                        db.transaction((tx) => {
                                                            tx.executeSql("UPDATE `users` SET `password` = ?, `updated_at` = ? WHERE `id` = ?"
                                                            , [newPassword, this.state.updated_at, this.props.userID]
                                                            , (tx, rs) => {
                                                                console.log("updated doctors: " + rs.rowsAffected);
                                                            })
                                                        }, (err) => {
                                                            // alert(err.message);
                                                            ToastAndroid.show("Error Occured!", 3000)
                                                        }, () => {
                                                            this.setState({refreshing: false, modalVisible: false})
                                                            this.props.navigator.replacePreviousAndPop({
                                                                id: 'UserSettingPage'
                                                            });
                                                            ToastAndroid.show("Successfully Password Changed!", 3000)
                                                        })
                                                    } else {
                                                        ToastAndroid.show("New Password Not Matched!", 3000)
                                                    }
                                                } else {
                                                    ToastAndroid.show("Wrong Current Password!", 3000)
                                                }
                                            } else { // Required Fields
                                                if (this.state.password == '') {
                                                    ToastAndroid.show("Invalid Password!", 3000)
                                                } else if (this.state.newPassword == '') {
                                                    ToastAndroid.show("Invalid New Password!", 3000)
                                                } else if (this.state.cnewPassword == '') {
                                                    ToastAndroid.show("Invalid Confirm New Password!", 3000)
                                                } else {
                                                    ToastAndroid.show("Error Occured!", 3000)
                                                }
                                            }
                                            this.setState({refreshing: false})
                                        }}>
                                        <View style={{padding: 15, justifyContent: 'center', width: 100}}>
                                            <Text style={{textAlign: 'center', color: '#4CAF50'}}>SAVE</Text>
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <ScrollView
                        keyboardShouldPersistTaps={true}>
                        <View style={{backgroundColor: '#FFFFFF'}}>
                            <View style={[{padding: 12, paddingRight: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 0.5, borderBottomColor: '#EEE'}]}>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={[styles.label, {fontSize: 25, color:'#424242'}]}>User Settings</Text>
                                </View>
                                <Text style={styles.label} >Username</Text>
                                <TextInput
                                    placeholder={'Text Here...'}
                                    style={styles.textInput}
                                    autoCapitalize={'words'}
                                    value={_.toString(this.state.username)}
                                    placeholderTextColor={'#E0E0E0'}
                                    onChangeText={(text) => this.setState({username: text})} />
                                <TouchableNativeFeedback
                                    onPress={() => { this.setState({modalVisible: true});}}>
                                    <View style={{flex: 1, alignItems: 'center', padding: 15, backgroundColor: '#F5F5F5'}}>
                                        <View style={{flexDirection: 'row' }}>
                                            <Icon name={'lock'} size={20} color={'#424242'}/>
                                            <Text style={{paddingLeft: 5, textAlignVertical: 'center', color: '#424242'}}>Change Password</Text>
                                        </View>
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                            <View style={[{padding: 12, paddingRight: 16, backgroundColor: '#FFFFFF', marginBottom: 80}]}>
                                <View style={[styles.rows, {flexDirection: 'column', marginTop: 5}]}>
                                    <Text style={[styles.label, {fontSize: 25, color:'#424242'}]}>Account Settings</Text>
                                </View>
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
                tx.executeSql("UPDATE `users` SET `username` = ?, `updated_at` = ? WHERE `id` = ?", [this.state.username,this.state.updated_at, this.props.userID], (tx, rs) => {
                    console.log("updated users: " + rs.rowsAffected);
                })

                tx.executeSql("UPDATE `doctors` SET `initial` = ?, `rank` = ?, `type` = ?, `code` = ?, `licenseID` = ?, `updated_at` = ? WHERE `id` = ?", [this.state.initial, this.state.rank, this.state.type, this.state.code, this.state.licenseID, this.state.updated_at, this.props.doctorID], (tx, rs) => {
                    console.log("updated doctors: " + rs.rowsAffected);
                })
            }, (err) => {
                this.setState({refreshing: false})
                ToastAndroid.show("Error Occured!", 3000)
            }, () => {
                this.setState({refreshing: false})
                var doctor = {};
                doctor['type'] = this.state.type;
                doctor['initial'] = this.state.initial;
                this.updateCredentials(doctor).done()
                this.props.navigator.pop()
                ToastAndroid.show("Successfully Updated!", 3000)
            })
        } else { // Required Fields
            if (_.trim(this.state.username) == '') {
                ToastAndroid.show("Invalid Username!", 3000)
            } else if (_.trim(this.state.licenseID) == '') {
                ToastAndroid.show("Invalid License ID!", 3000)
            } else {
                ToastAndroid.show("Error Occured!", 3000)
            }
        }
    }
    async updateCredentials(doctor) {
        try {
            await AsyncStorage.mergeItem('doctor', JSON.stringify(doctor));
        } catch (error) {
            alert('AsyncStorage error: ' + error.message);
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
        color: '#212121',
        fontSize: 17,
    },
    label: {
        color: '#616161',
        textAlign: 'left',
        marginLeft: 4,
        marginRight: 4,
    },
    textInput: {
        fontSize: 16,
        paddingTop: 5,
        marginBottom: 5,
    },
})

var NavigationBarRouteMapper = (doctorName, props) => ({
    LeftButton(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
                onPress={() => {
                    navigator.parentNavigator.pop()
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

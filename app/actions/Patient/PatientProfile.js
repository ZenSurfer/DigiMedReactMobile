'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, Dimensions, View, ActivityIndicator, Navigator, TouchableOpacity, TouchableNativeFeedback, ScrollView, RefreshControl, InteractionManager, ToolbarAndroid, Alert, ToastAndroid} from 'react-native'
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import moment from 'moment'
import _ from 'lodash'
import Env from '../../env'

import Styles from '../../assets/Styles'

const EnvInstance = new Env()
const db = EnvInstance.db()
const {height, width} = Dimensions.get('window')
const avatar = require('../../assets/images/banner.jpg')

class PatientProfile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            rowData: [],
            renderPlaceholderOnly: true,
            progress: 0,
            fullProfile: false,
            fullContact: false,
            fullOther: false,
        }
    }
    componentWillMount() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM patients WHERE id=? LIMIT 1", [this.props.patientID], function(tx, rs) {
                db.data = rs.rows
            }, function(error) {
                console.log('SELECT SQL statement ERROR: ' + error.message);
            });
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            this.setState({refreshing: false})
            this.setState({rowData: db.data.item(0)})
            if (db.data.item(0).imagePath != '')
                RNFS.exists(db.data.item(0).imagePath).then((exist) => {
                    if (exist)
                        RNFS.readFile( db.data.item(0).imagePath, 'base64').then((rs) => {
                            this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')});
                        })
                })
        })
    }
    render() {
        return (
            <Navigator
                renderScene={(this.state.renderPlaceholderOnly) ? this.renderPlaceholderView.bind(this) : this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={[Styles.navigationBar,{marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper(this.props.patientID)} />
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
                    <Text style={Styles.subTitle}>Patient Information</Text>
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
                <View style={[Styles.containerStyle, {backgroundColor: '#FFF'}]}>
                    {this.props.children}
                    <View style={[Styles.subTolbar, {marginTop: 24}]}>
                        <Text style={Styles.subTitle}>Patient Information</Text>
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
                        <View style={[styles.person]}>
                            <View style={[styles.personInformation, {height: 250, justifyContent: 'center'}]}>
                                {(this.state.avatar) ? (
                                    <Image
                                        style={[styles.avatarImage, {marginTop: 5}]}
                                        source={{uri: this.state.avatar}} />
                                ) : (
                                    <View>
                                        <Icon name={'account-circle'} size={200} color={'#EEEEEE'}/>
                                    </View>
                                )}
                            </View>
                            <View style={{marginBottom: 10, marginTop: -10}}>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={[styles.label, {fontSize: 34, color:'#424242'}]}>Patient Profile</Text>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Patient Code</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.code) ? this.state.rowData.code : '-'}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Nickname</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.nickname) ? this.state.rowData.nickname : '-'}</Text></View>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>First Name</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{this.state.rowData.firstname}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Middle Name</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{this.state.rowData.middlename}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Last Name</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{this.state.rowData.lastname}</Text></View>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Civil Status</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.status) ? this.state.rowData.status : '-'}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Age</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{moment().diff(this.state.rowData.birthdate, 'years')} yo</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Sex</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.sex) ? 'Male' : 'Female'}</Text></View>
                                    </View>
                                </View>
                                {(this.state.fullProfile) ? (
                                    <View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>Birth Date</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{moment(this.state.rowData.birthdate).format('MMMM DD, YYYY')}</Text></View>
                                        </View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>Birth Place</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.birthPlace) ? this.state.rowData.birthPlace : '-'}</Text></View>
                                        </View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                                <Text style={styles.label}>Race</Text>
                                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.race) ? _.upperFirst(this.state.rowData.race) : '-'}</Text></View>
                                            </View>
                                            <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                                <Text style={styles.label}>Nationality</Text>
                                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.nationality) ? this.state.rowData.nationality : '-'}</Text></View>
                                            </View>
                                        </View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                                <Text style={styles.label}>Religion</Text>
                                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.religion) ? this.state.rowData.religion : '-'}</Text></View>
                                            </View>
                                            <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                                <Text style={styles.label}>Occupation</Text>
                                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.occupation) ? _.upperFirst(this.state.rowData.occupation) : '-'}</Text></View>
                                            </View>
                                        </View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>Category</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.category) ? _.upperFirst(this.state.rowData.category) : '-'}</Text></View>
                                        </View>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={{flex: 1, flexDirection: 'row', justifyContent: 'center', marginBottom: 20}}
                                        onPress={() =>  this.setState({fullProfile: true}) }>
                                        <View style={{backgroundColor: '#29B6F6', borderRadius: 50}}>
                                            <Text style={{color: '#FFFFFF',  textAlign: 'center', padding: 10, paddingLeft: 20, paddingRight: 20}}>Full Patient Profile</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}

                            </View>
                            <View style={{marginBottom: 20, marginTop: -10}} collapsable={true}>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={[styles.label, {fontSize: 34, color:'#424242'}]}>Contact Information</Text>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Address</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.address) ? this.state.rowData.address : '-'}</Text></View>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.email) ? this.state.rowData.email : '-'}</Text></View>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Mobile Number</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.telMobile) ? this.state.rowData.telMobile : '-'}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Telephone Number</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.telHome) ? this.state.rowData.telHome : '-'}</Text></View>
                                    </View>
                                </View>
                                {(this.state.fullContact) ? (
                                    <View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                                <Text style={styles.label}>Person to Notify</Text>
                                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.personNotify) ? this.state.rowData.personNotify : '-'}</Text></View>
                                            </View>
                                            <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                                <Text style={styles.label}>Relation to Patient</Text>
                                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.personRelation) ? this.state.rowData.personRelation : '-'}</Text></View>
                                            </View>
                                        </View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>Mobile of Person to Notify</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.	personMobile) ? this.state.rowData.	personMobile : '-'}</Text></View>
                                        </View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>Address of Person to Notify</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.personAddress) ? this.state.rowData.personAddress : '-'}</Text></View>
                                        </View>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={{flex: 1, flexDirection: 'row', justifyContent: 'center', marginBottom: 20}}
                                        onPress={() =>  this.setState({fullContact: true}) }>
                                        <View style={{backgroundColor: '#29B6F6', borderRadius: 50}}>
                                            <Text style={{color: '#FFFFFF',  textAlign: 'center', padding: 10, paddingLeft: 20, paddingRight: 20}}>Full Contact Information</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={{marginBottom: 40, marginTop: -10}} collapsable={true}>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={[styles.label, {fontSize: 34, color:'#424242'}]}>Other Information</Text>
                                </View>
                                {(this.state.fullOther) ? (
                                    <View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>Company Name</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.company) ? this.state.rowData.company : '-'}</Text></View>
                                        </View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                                <Text style={styles.label}>Company ID</Text>
                                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.companyID) ? this.state.rowData.companyID : '-'}</Text></View>
                                            </View>
                                            <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                                <Text style={styles.label}>Company Telephone Number</Text>
                                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.companyContact) ? this.state.rowData.companyContact : '-'}</Text></View>
                                            </View>
                                        </View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>Company Address</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.companyAddress) ? this.state.rowData.companyAddress : '-'}</Text></View>
                                        </View>
                                    </View>
                                ) : (<View/>)}
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>HMO</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.hmo) ? this.state.rowData.hmo : '-'}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>HMO ID</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.hmoID) ? this.state.rowData.hmoID : '-'}</Text></View>
                                    </View>
                                </View>
                                {(this.state.fullOther) ? (
                                    <View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>HMO Code</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.hmoCode) ? this.state.rowData.hmoCode : '-'}</Text></View>
                                        </View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                                <Text style={styles.label}>Insurance Provider</Text>
                                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.insuranceProvider) ? this.state.rowData.insuranceProvider : '-'}</Text></View>
                                            </View>
                                            <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                                <Text style={styles.label}>Policy #</Text>
                                                <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.policyNumber) ? this.state.rowData.policyNumber : '-'}</Text></View>
                                            </View>
                                        </View>
                                    </View>
                                ) : (<View/>)}
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Is infant?</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.isPedia) ? 'Yes' : 'No'}</Text></View>
                                </View>
                                {(this.state.fullOther) ? (
                                    <View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>Father's Name</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.fatherName) ? this.state.rowData.fatherName : '-'}</Text></View>
                                        </View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>Mother's Name</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.motherName) ? this.state.rowData.motherName : '-'}</Text></View>
                                        </View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>Guardian's Name</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.guardianName) ? this.state.rowData.guardianName : '-'}</Text></View>
                                        </View>
                                        <View style={[styles.rows, {flexDirection: 'column'}]}>
                                            <Text style={styles.label}>Spouse's Name</Text>
                                            <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.spouseName) ? this.state.rowData.spouseName : '-'}</Text></View>
                                        </View>
                                    </View>
                                ) : (<View/>)}
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Primary Physician</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.hmo) ? '-' : '-'}</Text></View>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Secondary Physician</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.hmo) ? '-' : '-'}</Text></View>
                                </View>
                                {(this.state.fullOther) ? (<View/>) : (
                                    <TouchableOpacity
                                        style={{flex: 1, flexDirection: 'row', justifyContent: 'center', marginBottom: 20}}
                                        onPress={() =>  this.setState({fullOther: true}) }>
                                        <View style={{backgroundColor: '#29B6F6', borderRadius: 50}}>
                                            <Text style={{color: '#FFFFFF',  textAlign: 'center', padding: 10, paddingLeft: 20, paddingRight: 20}}>Full Other Information</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                    <TouchableOpacity
                        style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 25}]}
                        onPress={() =>  this.props.navigator.push({
                            id: 'EditPatient',
                            passProps: {
                                patientID: this.state.rowData.id,
                                patientName: this.state.rowData.firstname+' '+this.state.rowData.middlename+' '+this.state.rowData.lastname
                            }
                        })}>
                        <Icon name={'edit'} color={'#FFFFFF'} size={30}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.buttonFab, {backgroundColor: 'rgba(0,0,0,0.1)', bottom: 80, elevation: 0}]}
                        onPress={() => this.props.navigator.push({
                            id: 'AddAppointment',
                            passProps: {
                                patientID: this.state.rowData.id,
                                patientAvatar: this.state.rowData.imagePath,
                                patientName: this.state.rowData.firstname+' '+this.state.rowData.middlename+' '+this.state.rowData.lastname
                            }
                        })}>
                        <Icon name={'playlist-add'} color={'#616161'} size={30}/>
                    </TouchableOpacity>
                </View>
                <View style={{position: 'absolute', bottom: 0, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    <TouchableNativeFeedback
                        onPress={() => this.props.navigator.push({
                            id: 'HPEDPage',
                            passProps: {
                                patientID: this.state.rowData.id,
                                patientAvatar: this.state.rowData.imagePath,
                                patientName: this.state.rowData.firstname+' '+this.state.rowData.middlename+' '+this.state.rowData.lastname
                            }
                        })}>
                        <View style={{backgroundColor: '#E91E63', flex: 1, alignItems: 'stretch',  padding: 10, borderColor: '#EC407A', borderStyle: 'solid', borderRightWidth: 1}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'local-hospital'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>HPED</Text>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback
                        onPress={() => this.props.navigator.push({
                            id: 'AppointmentPatientPage',
                            passProps: {
                                patientID: this.state.rowData.id,
                                patientAvatar: this.state.rowData.imagePath,
                                patientName: this.state.rowData.firstname+' '+this.state.rowData.middlename+' '+this.state.rowData.lastname
                            }
                        })}>
                        <View style={{backgroundColor: '#E91E63', flex: 1, alignItems: 'stretch',  padding: 10}}>
                            <Text style={{textAlign: 'center'}}><Icon name={'schedule'} color={'#FFFFFF'} size={34} /></Text>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#FFFFFF'}}>Appointments</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        )
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM patients WHERE id=? LIMIT 1", [this.props.patientID], function(tx, rs) {
                db.data = rs.rows
            }, function(error) {
                console.log('SELECT SQL statement ERROR: ' + error.message);
            });
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            this.setState({refreshing: false})
            this.setState({rowData: db.data.item(0)})
        })
    }
}

var styles = StyleSheet.create({
    avatarImage: {
        height:  250,
        width: width,
        // borderRadius: 100,
        marginLeft: 16,
        marginRight: 16,
        marginBottom: 6,
    },
    person: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        paddingLeft: 16,
        paddingRight: 16,
    },
    personInformation: {
        flex: 1,
        // flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        marginLeft: -20,
        marginRight: -20,
        marginBottom: 20,
        marginTop: 0,
    },
    personDetails: {
        flex: 1,
        alignItems: 'stretch',
        flexDirection: 'column',
        marginLeft: 10,
    },
    personName: {
        fontSize: 34,
        color: '#FFFFFF',
    },
    personEmail: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    rows: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    textWrapper: {
        backgroundColor: '#FFFFFF',
        paddingTop: 5,
        paddingBottom: 5,
    },
    text: {
        color: '#424242',
        fontSize: 20,
    },
})

var NavigationBarRouteMapper = (patientID) => ({

    LeftButton(route, navigator, index, nextState) {
        return (
            <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
                onPress={() => { navigator.parentNavigator.pop() }}>
                <Text style={{color: 'white', margin: 10,}}>
                    <Icon name={"keyboard-arrow-left"} size={30} color={"#FFF"} />
                </Text>
            </TouchableOpacity>
        )
    },
    RightButton(route, navigator, index, nextState) {
        return (
            <ToolbarAndroid
            actions={toolbarActions}
            onActionSelected={(position) => {
                if (toolbarActions[position].title === 'Delete')
                    Alert.alert(
                        'Delete Confirmation',
                        'Are you sure you want to delete?',
                        [
                            {text: 'CANCEL'},
                            {text: 'OK', onPress: () => {
                                db.transaction((tx) => {
                                    tx.executeSql("UPDATE patients SET deleted_at = ?, updated_at = ? where id = ?", [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'), patientID], (tx, rs) => {
                                        console.log("deleted: " + rs.rowsAffected);
                                    }, (err) => {
                                        alert(err.message)
                                    });
                                }, (err) => {
                                    ToastAndroid.show("Error occured while deleting!", 3000)
                                }, () => {
                                    navigator.parentNavigator.replacePreviousAndPop({
                                        id: 'PatientPage'
                                    })
                                    ToastAndroid.show("Successfully deleted!", 3000)
                                })
                            }},
                        ]
                    )
            }}>
                <Text style={{color: '#FFFFFF', margin: 10, marginRight: 16, backgroundColor: '#FFFFFF'}}>
                    <Icon name={"more-vert"} size={30} color={'#FFFFFF'} />
                </Text>
            </ToolbarAndroid>
        )
    },
    Title(route, navigator, index, nextState) {
        return (
            <TouchableOpacity style={Styles.title}>
                <Text style={Styles.titleText}>Patient</Text>
            </TouchableOpacity>
        )
    }
})
var toolbarActions = [
  {title: 'Delete'},
];

module.exports = PatientProfile

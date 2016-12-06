'use-strict'

import React, {Component} from 'react'
import {Text, View, StyleSheet, Navigator, Image, DrawerLayoutAndroid, ListView, TouchableOpacity, InteractionManager, ScrollView, RefreshControl, Dimensions, ActivityIndicator} from 'react-native'
import RNFS from 'react-native-fs'
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
const {height, width} = Dimensions.get('window')
const avatar = require('../../assets/images/banner.jpg')

class UserProfilePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rowData: [],

            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            refreshing: false,
            renderPlaceholderOnly: true,
        }
    }
    componentWillMount() {
        this.setState({refreshing: true});
        db.transaction((tx) => {
            tx.executeSql("SELECT `id`, `groupID`, `patientID`, `userID`, `firstname`, `middlename`, `lastname`, `nameSuffix`, `birthdate`, `sex`, `status`, `address`, `phone1`, `phone2`, `email`, `imagePath`, `imageMime`, `allowAsPatient`, `deleted_at`, `created_at`, `updated_at` FROM doctors WHERE `doctors`.`id`= ?", [this.props.doctorID], function(tx, rs) {
                db.data = rs.rows.item(0);
            });
        }, (err) => {
            alert(err.message);
        }, () => {
            if (db.data.imagePath)
                RNFS.exists(db.data.imagePath).then((exist) => {
                    if (exist)
                        RNFS.readFile(db.data.imagePath, 'base64').then((rs) => {
                            this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')});
                        })
                })
            this.setState({refreshing: false, rowData: db.data});
        });
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator}></DrawerPage>)
                }}
                statusBarBackgroundColor={'#2962FF'}
                ref={this.drawerInstance} >
                <Navigator
                    renderScene={(this.state.renderPlaceholderOnly) ? this.renderPlaceholderView.bind(this) : this.renderScene.bind(this)}
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
            setTimeout(() => { this.setState({renderPlaceholderOnly: false, progress: 1}) }, 500)

        });
    }
    componentWillReceiveProps(nextProps) {
        if (_.size(nextProps.navigator.getCurrentRoutes(0)) > 1) {
            this.setState({lastRoute: nextProps.navigator.getCurrentRoutes(0)[1].id})
        } else {
            if (this.state.lastRoute == 'EditUserProfile') {
                this.setState({lastRoute: ''});
                this.onRefresh();
            }
        }
    }
    renderPlaceholderView() {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={[Styles.subTolbar]}>
                    <Text style={Styles.subTitle}>{this.props.doctorName}</Text>
                </View>
                <View style={[Styles.loading, {marginTop: -10}]}>
                    <View style={Styles.horizontal}><ActivityIndicator color="#212121" size={23}/></View>
                </View>
            </View>
        );
    }
    renderScene(route, navigator) {
        return (
            <View style={{flex: 1}}>
                {this.props.children}
                <View style={Styles.containerStyle}>
                    <View style={Styles.subTolbar}>
                        <Text style={Styles.subTitle}>{(this.state.doctorName) ? this.state.doctorName : this.props.doctorName}</Text>
                    </View>
                    <ScrollView
                        style={{marginTop: 0}}
                        refreshControl={
                            <RefreshControl
                                style={{marginTop: 20}}
                                refreshing={this.state.refreshing}
                                progressViewOffset={0}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }>
                        <View style={[styles.person, {backgroundColor: '#FFFFFF'}]}>
                            <View style={[styles.personInformation, {height: 300, justifyContent: 'center'}]}>
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
                            <View style={{backgroundColor: '#FFFFFF', marginBottom: 10, marginTop: -10}}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Firstname</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.firstname) ? this.state.rowData.firstname : '-'}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Middlename</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.middlename ? this.state.rowData.middlename : '-')}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Lastname</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{this.state.rowData.lastname}</Text></View>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Age</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{moment().diff(this.state.rowData.birthdate, 'years')} yo</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Birth Date</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{moment(this.state.rowData.birthdate).format('MMMM DD, YYYY')}</Text></View>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Name Suffix</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.nameSuffix ? this.state.rowData.nameSuffix : '-')}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Gender</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.sex) ? 'Male' : 'Female'}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Civil Status</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.status) ? this.state.rowData.status : '-'}</Text></View>
                                    </View>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Address</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.address) ? this.state.rowData.address : '-'}</Text></View>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Mobile Number</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.phone1 ? this.state.rowData.phone1 : '-')}</Text></View>
                                    </View>
                                    <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column'}]}>
                                        <Text style={styles.label}>Home Number</Text>
                                        <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.phone2 ? this.state.rowData.phone2 : '-')}</Text></View>
                                    </View>
                                </View>
                                <View style={[styles.rows, {flexDirection: 'column'}]}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{this.state.rowData.email}</Text></View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    <TouchableOpacity
                        style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 5}]}
                        onPress={() =>  this.props.navigator.push({
                            id: 'EditUserProfile',
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
            tx.executeSql("SELECT `id`, `groupID`, `patientID`, `userID`, `firstname`, `middlename`, `lastname`, `nameSuffix`, `birthdate`, `sex`, `status`, `address`, `phone1`, `phone2`, `email`, `imagePath`, `imageMime`, `allowAsPatient`, `deleted_at`, `created_at`, `updated_at` FROM doctors WHERE `doctors`.`id`= ?", [this.props.doctorID], function(tx, rs) {
                db.data = rs.rows.item(0);
            });
        }, (err) => {
            alert(err.message);
        }, () => {
            var doctorName = 'Dr. '+db.data.firstname+' '+db.data.middlename+' '+db.data.lastname;
            if (db.data.imagePath)
                RNFS.exists(db.data.imagePath).then((exist) => {
                    if (exist)
                        RNFS.readFile(db.data.imagePath, 'base64').then((rs) => {
                            this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')});
                        })
                })
            this.setState({refreshing: false, rowData: db.data, doctorName: doctorName});
        });
    }
    drawerInstance(instance) {
        drawerRef = instance
    }
}

var styles = StyleSheet.create({
    avatarImage: {
        height:  300,
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
                <Text style={Styles.titleText}>User Profile</Text>
            </TouchableOpacity>
        )
    }
}

module.exports = UserProfilePage

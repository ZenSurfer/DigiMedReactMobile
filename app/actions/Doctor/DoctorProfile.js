'use-strict'

import React, {Component} from 'react'
import {Text, PixelRatio, Platform, View, StyleSheet, Navigator, Image, DrawerLayoutAndroid, ListView, TouchableOpacity, InteractionManager, ScrollView, RefreshControl, Dimensions, ActivityIndicator} from 'react-native'
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import moment from 'moment'
import Env from '../../env'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()
const {height, width} = Dimensions.get('window')
const avatar = require('../../assets/images/banner.jpg')
const windowSize = Dimensions.get('window');

class DoctorProfile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rowData: [],

            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            refreshing: false,
            renderPlaceholderOnly: true,
        }
        this.drawerRef = {}
        this.pixelDensity = PixelRatio.get();
        this.width = windowSize.width;
        this.height = windowSize.height;
        this.adjustedWidth = this.width * this.pixelDensity;
        this.adjustedHeight = this.height * this.pixelDensity;
        this.isTablet();
    }
    isTablet() {
        if(this.pixelDensity < 2 && (this.adjustedWidth >= 1000 || this.adjustedHeight >= 1000)) {
            this.isTablet = true;
            this.isPhone = false;
        } else if(this.pixelDensity === 2 && (this.adjustedWidth >= 1920 || this.adjustedHeight >= 1920)) {
            this.isTablet = true;
            this.isPhone = false;
        } else {
            this.isTablet = false;
            this.isPhone = true;
        }
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
                ref={ref => this.drawerRef = ref} >
                <Navigator
                    renderScene={(this.state.renderPlaceholderOnly) ? this.renderPlaceholderView.bind(this) : this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar
                            style={[Styles.navigationBar,{}]}
                            routeMapper={NavigationBarRouteMapper(this.drawerRef)} />
                    }
                    />
            </DrawerLayoutAndroid>
        )
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            setTimeout(() => { this.setState({renderPlaceholderOnly: false, progress: 1}) }, 500)
        });
        this.onRefresh()
    }
    renderPlaceholderView() {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={[Styles.subTolbar, {}]}>
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
                        <View style={[styles.personInformation, {height: (this.isTablet) ? 600 : 300, justifyContent: 'center'}]}>
                            {(this.state.avatar) ? (
                                <Image
                                    style={[styles.avatarImage, {height: (this.isTablet) ? 600 : 300, marginTop: 5}]}
                                    source={{uri: this.state.avatar}} />
                                ) : (
                                <View>
                                    <Icon name={'account-circle'} size={200} color={'#EEEEEE'}/>
                                </View>
                            )}
                        </View>
                        <View style={{backgroundColor: '#FFFFFF', marginBottom: 10, marginTop: -10}}>
                            <Text style={styles.heading}>Doctor Profile</Text>
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
                            <Text style={[styles.heading]}>Doctor Information</Text>
                            <View style={{flexDirection: 'row'}}>
                                <View style={[styles.rows, {flex: 1, alignItems: 'stretch', flexDirection: 'column', paddingTop: 5}]}>
                                    <Text style={styles.label}>License ID</Text>
                                    <View style={styles.textWrapper}><Text style={styles.text}>{(this.state.rowData.licenseID) ? this.state.rowData.licenseID : '-'}</Text></View>
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
                        </View>
                    </View>
                </ScrollView>
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {}]}
                    onPress={() =>  this.props.navigator.push({
                        id: 'EditDoctor',
                        passProps: {
                            doctorID: this.props.doctorID,
                            doctorName: this.props.doctorName,
                        }
                    })}>
                    <Icon name={'edit'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        )
    }
    onRefresh() {
        this.setState({refreshing: true});
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM doctors WHERE `doctors`.`id`= ?", [this.props.doctorID], function(tx, rs) {
                db.data = rs.rows.item(0);
            });
        }, (err) => {
            alert(err.message);
        }, () => {
            var doctorName = 'Dr. '+db.data.firstname+' '+db.data.middlename+' '+db.data.lastname;
            if (db.data.imagePath)
                RNFS.exists(RNFS.DocumentDirectoryPath +'/'+ db.data.imagePath).then((exist) => {
                    if (exist)
                        RNFS.readFile(RNFS.DocumentDirectoryPath +'/'+ db.data.imagePath, 'base64').then((rs) => {
                            this.setState({avatar: (rs.toString().indexOf('dataimage/jpegbase64') !== -1) ? _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,') : 'data:image/jpeg;base64,'+rs.toString()});
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
    heading: {
        fontSize: 34,
        color: '#424242',
        marginBottom: 10,
        marginLeft: 4,
        marginRight: 4,
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
        backgroundColor: '#EEE',
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

var NavigationBarRouteMapper = (drawerRef) => ({
    LeftButton(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={Styles.leftButton}
                onPress={() => {
                    navigator.parentNavigator.pop()
                }}>
                <Text style={Styles.leftButtonText}>
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
                <Text style={Styles.titleText}>Doctor</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = DoctorProfile

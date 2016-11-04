'use-strict'

import React, {Component} from 'react'
import {Text, View, StyleSheet, Navigator, DrawerLayoutAndroid, ListView, TouchableOpacity, InteractionManager, ScrollView, RefreshControl} from 'react-native'
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
const avatar = require('../../assets/images/banner.jpg')

class UserProfilePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            doctorID: EnvInstance.getDoctor().id,
            rowData: [],
            updated_at: moment().format('YYYY-MM-DD'),

            refreshing: true,
        }
    }
    componentWillMount() {
        this.setState({refreshing: true});
        db.transaction((tx) => {
            tx.executeSql("SELECT `id`, `groupID`, `patientID`, `userID`, `firstname`, `middlename`, `lastname`, `nameSuffix`, `birthdate`, `sex`, `status`, `address`, `initial`, `type`, `code`, `phone1`, `phone2`, `rank`, `email`, `licenseID`, `imagePath`, `imageMime`, `allowAsPatient`, `schedule`, `deleted_at`, `created_at`, `updated_at` FROM doctors WHERE `doctors`.`id`= "+ this.state.doctorID +" ", [], function(tx, rs) {
                alert(JSON.stringify(rs.rows.item(0)));
                db.data = rs.rows;
            });
        }, (err) => {
            alert(err.message);
        }, () => {
            var rowData = db.data.item(0);
            if (rowData.imagePath != '')
                RNFS.exists(RNFS.ExternalDirectoryPath+'/avatar/'+rowData.imagePath).then((exist) => {
                    if (exist)
                        RNFS.readFile(RNFS.ExternalDirectoryPath+'/avatar/'+rowData.imagePath, 'base64').then((rs) => {
                            this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')});
                        })
                })
            this.setState({rowData: rowData});
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
                    </ScrollView>
                </View>
            </View>
        )
    }
    onRefresh() {
        this.setState({refreshing: true});
        db.transaction((tx) => {
            tx.executeSql("SELECT `id`, `groupID`, `patientID`, `userID`, `firstname`, `middlename`, `lastname`, `nameSuffix`, `birthdate`, `sex`, `status`, `address`, `initial`, `type`, `code`, `phone1`, `phone2`, `rank`, `email`, `licenseID`, `imagePath`, `imageMime`, `allowAsPatient`, `schedule`, `deleted_at`, `created_at`, `updated_at` FROM doctors WHERE `doctors`.`id`= "+ this.state.doctorID +" ", [], function(tx, rs) {
                alert(JSON.stringify(rs.rows.item(0)));
                db.data = rs.rows;
            });
        }, (err) => {
            alert(err.message);
        }, () => {
            var rowData = db.data.item(0);
            if (rowData.imagePath != '')
                RNFS.exists(RNFS.ExternalDirectoryPath+'/avatar/'+rowData.imagePath).then((exist) => {
                    if (exist)
                        RNFS.readFile(RNFS.ExternalDirectoryPath+'/avatar/'+rowData.imagePath, 'base64').then((rs) => {
                            this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')});
                        })
                })
            this.setState({rowData: rowData});
        });
    }
    drawerInstance(instance) {
        drawerRef = instance
    }
}

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

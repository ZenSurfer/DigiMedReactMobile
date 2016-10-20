'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, AsyncStorage, Navigator, StatusBar, ProgressBarAndroid, DrawerLayoutAndroid, InteractionManager, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'
import moment from 'moment'
import _ from 'lodash'
import Env from '../../env'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const EnvInstance = new Env()
const db = EnvInstance.db()
const drawerRef = {}
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

class PatientPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            search: 'ORDER BY firstname ASC',
            rowData: [],
        }
    }
    componentWillMount() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM patients WHERE (deleted_at in (null, 'NULL', '') OR deleted_at is null) "+((this.props.query) ? this.props.query : this.state.search), [], function(tx, rs) {
                db.data = rs.rows
            }, function(error) {
                console.log('SELECT SQL statement ERROR: ' + error.message);
            });
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            var rowData = []; var self = this;
            _.forEach(db.data, function(v, i) {
                rowData.push(db.data.item(i))
                if (db.data.item(i).imagePath != '')
                    RNFS.exists(db.data.item(i).imagePath).then((exist) => {
                        if (exist)
                            RNFS.readFile(db.data.item(i).imagePath, 'base64').then((rs) => {
                                var obj = {};
                                obj['patient'+db.data.item(i).id] = _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,');
                                self.setState(obj);
                            })
                    })
            })
            this.setState({refreshing: false, rowData: rowData})
        })
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
    renderScene(route, navigator) {
        return (
            <View style={Styles.containerStyle}>
                <View style={Styles.subTolbar}>
                    <Text style={Styles.subTitle}>Patient</Text>
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
                    style={[Styles.buttonFab, Styles.subTolbarButton]}
                    onPress={() => this.props.navigator.replace({
                        id: 'AddPatient',
                        sceneConfig: Navigator.SceneConfigs.FadeAndroid,
                    })}>
                    <Icon name={'person-add'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        )
    }
    renderListView(rowData, rowID) {
        return (
            <TouchableNativeFeedback
                onPress={() => this.gotoPatientProfile(rowData)}>
                <View style={styles.listView}>
                    {(rowData.imagePath) ? ((this.state['patient'+rowData.id]) ? (<Image source={{uri: this.state['patient'+rowData.id]}} style={styles.avatarImage}/>) : ((<Icon name={'account-circle'} color={'grey'} size={80}  style={styles.avatarIcon}/>))) : (<Icon name={'account-circle'} color={'grey'} size={80}  style={styles.avatarIcon}/>)}
                    <View style={styles.listText}>
                        <Text style={styles.listItemHead}>{rowData.firstname+' '+rowData.middlename+' '+rowData.lastname}</Text>
                        <Text style={styles.listItem}>{moment().diff(rowData.birthdate, 'years')} yo / {rowData.sex ? 'Male' : 'Female'}</Text>
                        <Text style={styles.listItem}>{moment(rowData.birthdate).format('MMMM DD, YYYY')} / AAA</Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        )
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM patients WHERE (deleted_at in (null, 'NULL', '') OR deleted_at is null) "+((this.props.query) ? this.props.query : this.state.search), [], function(tx, rs) {
                db.data = rs.rows
            }, function(error) {
                console.log('SELECT SQL statement ERROR: ' + error.message);
            });
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            var rowData = []; var self = this;
            _.forEach(db.data, function(v, i) {
                rowData.push(db.data.item(i))
                if (db.data.item(i).imagePath != '')
                    RNFS.readFile(db.data.item(i).imagePath, 'base64').then((rs) => {
                        var obj = {};
                        obj['patient'+db.data.item(i).id] = _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,');
                        self.setState(obj);
                    })
            })
            this.setState({refreshing: false, rowData: rowData})
        })
    }
    gotoPatientProfile(rowData) {
        this.props.navigator.push({
            id: 'PatientProfile',
            passProps: { patientID: rowData.id },
        })
    }
    drawerInstance(instance) {
        drawerRef = instance
    }
}

var styles = StyleSheet.create({
    avatarImage: {
        height: 60,
        borderRadius: 30,
        width: 60,
        marginLeft: 16,
        marginRight: 16,
        marginTop: 6,
        marginBottom: 6,
    },
    avatarIcon: {
        marginLeft: 16,
        marginRight: 8,
        marginTop: 2,
        marginBottom: 2,
    },
    textResult: {
        margin: 6,
        marginLeft: 16,
        flexDirection: 'row',
    },
    listView: {
        flex: 1,
        flexDirection: 'row',
        borderStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
        elevation: 10,
        paddingTop: 4,
        paddingBottom: 4,
    },
    listIcon: {
        marginLeft: 16,
        marginRight: 16,
        marginTop: 5,
        marginBottom: 5,
    },
    listText: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        marginTop: 10,
        marginBottom: 10,
    },
    listItemHead: {
        fontSize: 20,
        color: '#424242'
    },
    listItem: {
        fontSize: 14,
    },
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
        return (
            <TouchableOpacity style={Styles.rightButton}
                onPress={() => navigator.parentNavigator.push({
                        id: 'SearchPage',
                        sceneConfig: Navigator.SceneConfigs.FloatFromBottomAndroid,
                })} >
                <Text style={Styles.rightButtonText}>
                    <Icon name="search" size={30} color="#FFF" />
                </Text>
            </TouchableOpacity>
        )
    },
    Title(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={Styles.title}>
                <Text style={Styles.titleText}>Menu</Text>
            </TouchableOpacity>
        )
    }
}

module.exports = PatientPage

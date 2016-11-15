'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Alert, DatePickerAndroid, Navigator, DrawerLayoutAndroid, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import IconAwesome from 'react-native-vector-icons/FontAwesome'
import RNFS from 'react-native-fs'
import _ from 'lodash'
import moment from 'moment'
import Env from '../../env'
import Parser from 'react-native-html-parser'

import Styles from '../../assets/Styles'
import DrawerPage from '../../components/DrawerPage'

const drawerRef = {}
const DomParser = Parser.DOMParser
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()

class DoctorPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            doctors: [],
        }
    }
    componentDidMount() {
        this.onRefresh()
    }
    componentWillReceiveProps(nextProps) {
        if (_.size(nextProps.navigator.getCurrentRoutes(0)) > 1) {
            this.setState({lastRoute: nextProps.navigator.getCurrentRoutes(0)[1].id})
        } else {
            if (this.state.lastRoute == 'AddDoctor' || this.state.lastRoute == 'EditDoctor') {
                this.setState({lastRoute: ''});
                this.onRefresh();
            }
        }
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM doctors WHERE id!=? AND (deleted_at in (null, 'NULL', '') OR deleted_at is null) ORDER BY firstname ASC, middlename ASC, lastname ASC", [this.props.doctorID], (tx, rs) => {
                db.data = rs.rows
            })
        }, (err) => alert(err.message), () => {
            var doctors = []; var self = this;
            _.forEach(db.data, (v, i) => {
                doctors.push(db.data.item(i))
                if (db.data.item(i).imagePath != '')
                    RNFS.exists(db.data.item(i).imagePath).then((exist) => {
                        if (exist)
                            RNFS.readFile(db.data.item(i).imagePath, 'base64').then((rs) => {
                                var obj = {};
                                obj['doctor'+db.data.item(i).id] = _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,');
                                self.setState(obj);
                            })
                    })
            })
            this.setState({doctors: doctors, refreshing: false})
        })
    }
    render() {
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                statusBarBackgroundColor={'#2962FF'}
                renderNavigationView={() => {
                    return (<DrawerPage navigator={this.props.navigator}  routeName={'doctors'}></DrawerPage>)
                }}
                ref={this.drawerInstance}
            >
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar style={Styles.navigationBar}
                            routeMapper={NavigationBarRouteMapper} />
                    } />
            </DrawerLayoutAndroid>
        )
    }
    renderScene(route, navigator) {
        return (
            <View style={Styles.containerStyle}>
                {this.props.children}
                <View style={Styles.subTolbar}>
                    <Text style={Styles.subTitle}>Doctor</Text>
                </View>
                <ListView
                    dataSource={ds.cloneWithRows(this.state.doctors)}
                    renderRow={(rowData, sectionID, rowID) => this.renderListView(rowData, rowID)}
                    enableEmptySections={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh.bind(this)}
                        />
                    }/>
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton]}
                    onPress={() => this.props.navigator.push({
                        id: 'AddDoctor',
                    })}>
                    <Icon name={'person-add'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        )
    }
    renderListView(rowData, rowID) {
        return (
            <TouchableNativeFeedback
                onPress={() => this.props.navigator.push({
                    id: 'DoctorProfile',
                    passProps: {
                        doctorID: rowData.id,
                        doctorName: 'Dr. '+rowData.firstname+' '+((rowData.middlename) ? rowData.middlename+' ' : '')+rowData.lastname,
                    }
                })}>
                <View style={{backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderBottomWidth: 0.5}}>
                    <View style={{flex: 1, flexDirection: 'row', padding: 16, justifyContent: 'center'}}>
                        <View style={{flex: 1, justifyContent: 'center', marginRight: -100}}>
                            {(rowData.imagePath) ? ((this.state['doctor'+rowData.id]) ? (
                                <Image
                                    resizeMode={'cover'}
                                    style={{width: 100, height: 100, borderRadius: 100}}
                                    source={{uri: this.state['doctor'+rowData.id]}}/>
                                ) : ((<Icon name={'account-circle'} color={'#E0E0E0'} size={140}  style={{margin: -10}}/>))) : (<Icon name={'account-circle'} color={'#E0E0E0'} size={140}  style={{margin: -10}}/>)}
                        </View>
                        <View style={{flex: 1, alignItems: 'stretch', flexDirection: 'column', justifyContent: 'center'}}>
                            <Text style={styles.listItemHead}>Dr. {rowData.firstname} {(rowData.middlename) ? rowData.middlename+' ' : ''}{rowData.lastname}</Text>
                            <Text style={[styles.listItem,(rowData.type) ? {color: '#424242'} : {}]}>{(rowData.type) ? rowData.type : '-'}</Text>
                            <Text style={[styles.listItem, {paddingTop: 5}]}>{(rowData.address) ? rowData.address : '-'}</Text>
                            <Text style={styles.listItem}>{(rowData.phone1) ? rowData.phone1 : ''} {(rowData.phone2) ? '/ '+rowData.phone2 : ''}</Text>
                        </View>
                    </View>
                </View>
            </TouchableNativeFeedback>
        )
    }
    drawerInstance(instance) {
        drawerRef = instance
    }
}

const styles = StyleSheet.create({
    time: {
        color: '#616161',
        fontSize: 20,
        textAlignVertical: 'center',
        height: 30,
        marginLeft: 16,
        marginRight: 16,
    },
    textResult: {
        margin: 6,
        marginLeft: 16,
        flexDirection: 'row',
    },
    listView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
        paddingTop: 4,
        paddingBottom: 4,
        paddingRight: 16,
        paddingLeft: 16,
    },
    listItemHead: {
        fontSize: 18,
        color: '#424242'
    },
    listItem: {
        fontSize: 14,
        paddingTop: 1,
        paddingBottom: 1,
    },
})

var NavigationBarRouteMapper = {
    LeftButton(route, navigator, index, navState) {
        return (
            <TouchableOpacity
                style={{flex: 1, justifyContent: 'center'}}
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
                <Text style={Styles.titleText}>Menu</Text>
            </TouchableOpacity>
        )
    }
}

module.exports = DoctorPage

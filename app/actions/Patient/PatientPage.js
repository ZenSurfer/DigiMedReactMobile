'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, AsyncStorage, Navigator, StatusBar, ProgressBarAndroid, DrawerLayoutAndroid, InteractionManager, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl, Modal, TouchableHighlight, TextInput} from 'react-native'
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
            query: '',
            queryText: '',
            search: 'ORDER BY firstname ASC',
            searchType: 'firstname',
            modalVisible: false,
            rowData: [],
        }
    }
    componentWillMount() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM patients WHERE (deleted_at in (null, 'NULL', '') OR deleted_at is null) "+this.state.query+" "+this.state.search, [], function(tx, rs) {
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
    componentWillReceiveProps(nextProps) {
        if (_.size(nextProps.navigator.getCurrentRoutes(0)) > 1) {
            this.setState({lastRoute: nextProps.navigator.getCurrentRoutes(0)[1].id})
        } else {
            if (this.state.lastRoute == 'PatientProfile' || this.state.lastRoute == 'AddPatient') {
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
                    return (<DrawerPage navigator={this.props.navigator} routeName={'patients'}></DrawerPage>)
                }}
                statusBarBackgroundColor={'#2962FF'}
                ref={this.drawerInstance} >
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar style={Styles.navigationBar}
                            routeMapper={NavigationBarRouteMapper(this)} />
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
                <Modal
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => this.setState({modalVisible: false})}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}}
                        onPress={() => this.setState({modalVisible: false})}>
                        <View style={{backgroundColor: '#FFF', elevation: 5}}>
                            <TextInput
                                placeholder={'Text Here...'}
                                style={[styles.textInput, {fontSize: 18, padding: 8, margin: 0}]}
                                autoCapitalize={'words'}
                                value={this.state.queryText}
                                autoFocus={true}
                                placeholderTextColor={'#E0E0E0'}
                                underlineColorAndroid={'#FFF'}
                                returnKeyType={'search'}
                                selectTextOnFocus={true}
                                onChangeText={(text) => this.setState({queryText: text})}
                                onSubmitEditing={() => {
                                    this.setState({modalVisible: false, refreshing: true, query: 'AND (firstname like "'+this.state.queryText+'%" OR lastname like "'+this.state.queryText+'%" OR middlename like "'+this.state.queryText+'%") '})
                                    this.onRefresh();
                                }}/>

                        </View>
                    </TouchableOpacity>
                </Modal>
                <ListView
                    style={{marginBottom: 42}}
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
                    onPress={() => this.props.navigator.push({
                        id: 'AddPatient',
                    })}>
                    <Icon name={'person-add'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
                <View style={{position: 'absolute', bottom: 0, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    <TouchableNativeFeedback
                        onPress={() => {
                            this.setState({refreshing: true, searchType: 'firstname'})
                            if (this.state.search == 'ORDER BY firstname ASC')
                                this.setState({search: 'ORDER BY firstname DESC'})
                            else
                                this.setState({search: 'ORDER BY firstname ASC'})
                            this.onRefresh()
                        }}>
                        <View style={{flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#EEEEEE', borderRightWidth: 0.5, backgroundColor: (this.state.searchType=='firstname') ? '#EEEEEE' : '#FAFAFA'}}>
                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <Text style={{color: (this.state.searchType=='firstname') ? '#424242' : '#9E9E9E', textAlign: 'center', textAlignVertical: 'center', paddingRight: 5}}>FNAME</Text>
                                <Text style={{color: (this.state.searchType=='firstname') ? '#424242' : '#9E9E9E', textAlign: 'center'}}><Icon name={'sort-by-alpha'} size={25} /></Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback
                        onPress={() => {
                            this.setState({refreshing: true, searchType: 'middlename'})
                            if (this.state.search == 'ORDER BY middlename ASC')
                                this.setState({search: 'ORDER BY middlename DESC'})
                            else
                                this.setState({search: 'ORDER BY middlename ASC'})
                            this.onRefresh()
                        }}>
                        <View style={{flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#EEEEEE', borderRightWidth: 0.5, backgroundColor: (this.state.searchType=='middlename') ? '#EEEEEE' : '#FAFAFA'}}>
                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <Text style={{color: (this.state.searchType=='middlename') ? '#424242' : '#9E9E9E', textAlign: 'center', textAlignVertical: 'center', paddingRight: 5}}>MNAME</Text>
                                <Text style={{color: (this.state.searchType=='middlename') ? '#424242' : '#9E9E9E', textAlign: 'center'}}><Icon name={'sort-by-alpha'} size={25} /></Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback
                        onPress={() => {
                            this.setState({refreshing: true, searchType: 'lastname'})
                            if (this.state.search == 'ORDER BY lastname ASC')
                                this.setState({search: 'ORDER BY lastname DESC'})
                            else
                                this.setState({search: 'ORDER BY lastname ASC'})
                            this.onRefresh()
                        }}>
                        <View style={{flex: 1, alignItems: 'stretch', padding: 10, backgroundColor: (this.state.searchType=='lastname') ? '#EEEEEE' : '#FAFAFA'}}>
                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <Text style={{color: (this.state.searchType=='lastname') ? '#424242' : '#9E9E9E', textAlign: 'center', textAlignVertical: 'center', paddingRight: 5}}>LNAME</Text>
                                <Text style={{color: (this.state.searchType=='lastname') ? '#424242' : '#9E9E9E', textAlign: 'center'}}><Icon name={'sort-by-alpha'} size={25} /></Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        )
    }
    renderListView(rowData, rowID) {
        return (
            <TouchableNativeFeedback
                onPress={() => this.gotoPatientProfile(rowData)}>
                <View style={[styles.listView, {paddingTop: 0, paddingBottom: 0}]}>
                    <View style={{height: 70, justifyContent: 'center'}}>
                        {(rowData.imagePath) ? ((this.state['patient'+rowData.id]) ? (<Image source={{uri: this.state['patient'+rowData.id]}} style={[styles.avatarImage, {marginLeft: 20, marginRight: 12}]}/>) : ((<Icon name={'account-circle'} color={'grey'} size={80}  style={styles.avatarIcon}/>))) : (<Icon name={'account-circle'} color={'grey'} size={80}  style={styles.avatarIcon}/>)}
                    </View>
                    <View style={[styles.listText, {justifyContent: 'center'}]}>
                        <Text style={styles.listItemHead}>{rowData.firstname+' '+rowData.middlename+' '+rowData.lastname}</Text>
                        <Text style={styles.listItem}>{moment().diff(rowData.birthdate, 'years')} yo / {rowData.sex ? 'Male' : 'Female'}</Text>
                        {/* <Text style={styles.listItem}>{moment(rowData.birthdate).format('MMMM DD, YYYY')} / AAA</Text> */}
                    </View>
                </View>
            </TouchableNativeFeedback>
        )
    }
    onRefresh() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM patients WHERE (deleted_at in (null, 'NULL', '') OR deleted_at is null) "+this.state.query+" "+this.state.search, [], function(tx, rs) {
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
    },
    avatarIcon: {
        marginLeft: 16,
        marginRight: 8,
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
        fontSize: 22,
        color: '#424242'
    },
    listItem: {
        fontSize: 14,
    },
})

var NavigationBarRouteMapper = (state) => ({
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
                onPress={() => state.setState({modalVisible: true})} >
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
})

module.exports = PatientPage

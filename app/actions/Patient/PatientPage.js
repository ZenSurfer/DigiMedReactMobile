'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, AsyncStorage, Navigator, StatusBar, ProgressBarAndroid, DrawerLayoutAndroid, InteractionManager, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl, Modal, TouchableHighlight, TextInput, NetInfo, ActivityIndicator} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import IconFont from 'react-native-vector-icons/FontAwesome'
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

            syncing: false,
            syncingTitle: 'Syncing Patients...',
        }
    }
    componentDidMount() {
        this.updateCredentials().done();
    }
    async updateCredentials() {
        try {
            var doctor = await AsyncStorage.getItem('doctor');
            this.setState({doctorID: JSON.parse(doctor).id})
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        } finally {
            this.onRefresh();
        }
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
                {this.props.children}
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
                {(this.state.syncing) ? (
                    <View style={{position: 'absolute', top: 50, zIndex: 1, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'center'}}>
                            <View style={{ backgroundColor: '#FF5722', flexDirection: 'row', padding: 15, paddingTop: 5, paddingBottom: 5, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}>
                                <ActivityIndicator color="#FFF" size={15}/>
                                <Text style={{textAlignVertical: 'center', paddingLeft: 10, color: '#FFF', fontSize: 11}}>{this.state.syncingTitle}</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View />
                )}
                <ListView
                    style={{marginBottom: 36}}
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
                        <View style={{flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#FFF', borderRightWidth: 0.5, backgroundColor: '#F5F5F5'}}>
                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <Text style={{color: (this.state.searchType=='firstname') ? '#424242' : '#BDBDBD', textAlign: 'center', textAlignVertical: 'center', paddingRight: 5}}>First Name</Text>
                                <Text style={{color: (this.state.searchType=='firstname') ? '#424242' : '#BDBDBD', textAlign: 'center', textAlignVertical: 'center'}}><IconFont name={(this.state.search == 'ORDER BY firstname ASC') ? 'sort-alpha-desc' : 'sort-alpha-asc'} size={16} /></Text>
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
                        <View style={{flex: 1, alignItems: 'stretch', padding: 10, borderColor: '#FFF', borderRightWidth: 0.5, backgroundColor: '#F5F5F5'}}>
                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <Text style={{color: (this.state.searchType=='middlename') ? '#424242' : '#BDBDBD', textAlign: 'center', textAlignVertical: 'center', paddingRight: 5}}>Middle Name</Text>
                                <Text style={{color: (this.state.searchType=='middlename') ? '#424242' : '#BDBDBD', textAlign: 'center', textAlignVertical: 'center'}}><IconFont name={(this.state.search == 'ORDER BY middlename ASC') ? 'sort-alpha-desc' : 'sort-alpha-asc'} size={16} /></Text>
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
                        <View style={{flex: 1, alignItems: 'stretch', padding: 10, backgroundColor: '#F5F5F5'}}>
                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <Text style={{color: (this.state.searchType=='lastname') ? '#424242' : '#BDBDBD', textAlign: 'center', textAlignVertical: 'center', paddingRight: 5}}>Last Name</Text>
                                <Text style={{color: (this.state.searchType=='lastname') ? '#424242' : '#BDBDBD', textAlign: 'center', textAlignVertical: 'center'}}><IconFont name={(this.state.search == 'ORDER BY lastname ASC') ? 'sort-alpha-desc' : 'sort-alpha-asc'} size={16} /></Text>
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
                        {(rowData.imagePath) ? ((this.state['patient'+rowData.id]) ? (<Image source={{uri: this.state['patient'+rowData.id]}} style={[styles.avatarImage, {marginLeft: 20, marginRight: 12}]}/>) : ((<Icon name={'account-circle'} color={'#E0E0E0'} size={80}  style={styles.avatarIcon}/>))) : (<Icon name={'account-circle'} color={'#E0E0E0'} size={80}  style={styles.avatarIcon}/>)}
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
                    RNFS.readFile(RNFS.ExternalDirectoryPath +'/'+ db.data.item(i).imagePath, 'base64').then((rs) => {
                        var obj = {};
                        if (rs.toString().indexOf('dataimage/jpegbase64') !== -1) {
                            obj['patient'+db.data.item(i).id] = _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,');
                        } else {
                            obj['patient'+db.data.item(i).id] = 'data:image/jpeg;base64,'+rs.toString();
                        }
                        self.setState(obj);
                    })
            })
            this.setState({refreshing: false, rowData: rowData})
            this.updateData(['patients']);
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
    updateData(tables) {
        NetInfo.isConnected.fetch().then(isConnected => {
            if (isConnected) {
                _.forEach(tables, (table, ii) => {
                    this.exportDate(table).then(exportDate => {
                        if (exportDate === null) {
                            exportDate = moment().year(2000).format('YYYY-MM-DD HH:mm:ss')
                        }
                        db.transaction(tx => {
                            tx.executeSql("SELECT * FROM "+table+" WHERE (created_at>='"+exportDate+"' OR updated_at>='"+exportDate+"')", [], (tx, rs) => {
                                db.data = rs.rows;
                            })
                        }, (err) => console.log(err.message), () => {
                            var rows = [];
                            _.forEach(db.data, (v, i) => {
                                rows.push(i+ '='+ encodeURIComponent('{') + this.jsonToQueryString(db.data.item(i)) + encodeURIComponent('}'))
                            })
                            this.exportData(table, rows).then(data => {
                                if(!_.isUndefined(data) && data.success) {
                                    this.updateExportDate(table, data.exportdate).then(msg => console.log(data.table+' export', msg)).done()
                                    this.importDate(table).then(importDate => {
                                        if (importDate === null) {
                                            importDate = moment().year(2000).format('YYYY-MM-DD HH:mm:ss')
                                        }
                                        if (moment().diff(moment(importDate), 'minutes') >= EnvInstance.interval) {
                                            this.setState({syncing: true, syncingTitle: 'Syncing Patients...'})
                                            this.importData(table, importDate).then((data) => {
                                                var currentImportDate = importDate;
                                                if (data.total > 0) {
                                                    db.sqlBatch(_.transform(data.data, (result, n, i) => {
                                                        result.push(["INSERT OR REPLACE INTO "+table+" VALUES ("+_.join(_.fill(Array(_.size(n)), '?'), ',')+")", _.values(n)])
                                                        if (!_.isUndefined(n.imagePath)) {
                                                            var param = {id: n.id, type: data.table};
                                                            this.importImage(Object.keys(param).map((key) => {
                                                                return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
                                                            }).join('&')).then((data) => {
                                                                if (!_.isUndefined(data)) {
                                                                    if (data.success) {
                                                                        RNFS.writeFile(RNFS.ExternalDirectoryPath+'/'+n.imagePath, decodeURIComponent(data.avatar), 'base64').then((success) => {
                                                                            console.log("Successfully created!")
                                                                        }).catch((err) => {
                                                                            console.log("Error occured while creating image!")
                                                                        });
                                                                    }
                                                                }
                                                            }).done();
                                                        }
                                                        return true
                                                    }, []), () => {
                                                        if(_.last(tables) === table)
                                                            this.setState({syncing: false})
                                                        currentImportDate = data.importdate;
                                                        this.updateImportDate(table, currentImportDate).then(msg => {
                                                            console.log(data.table+' import', msg)
                                                            if(_.last(tables) === table)
                                                                this.onRefresh()
                                                            // ToastAndroid.show('Appointments updated!', 1000)
                                                        }).done()
                                                    }, (err) => {
                                                        if(_.last(tables) === table)
                                                            this.setState({syncing: false})
                                                        table// ToastAndroid.show(err.message+'!', 1000)
                                                    });
                                                } else {
                                                    currentImportDate = data.importdate;
                                                    if(_.last(tables) === table)
                                                        this.setState({syncing: false})
                                                    this.updateImportDate(table, currentImportDate  ).then(msg => {
                                                        console.log(data.table+' import', msg)
                                                        // ToastAndroid.show('Appointments up to date!', 1000)
                                                    }).done()
                                                }
                                            }).done()
                                        }
                                    }).done()
                                }
                            }).done();
                        })
                    }).done()
                })
            }
        })
    }
    async importImage(param) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/image?'+param).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(err.message)
        }
    }
    async importDate(table) {
        try {
            var importDate = JSON.parse(await AsyncStorage.getItem('importDate'));
            return (_.isUndefined(importDate[table])) ? null : importDate[table];
        } catch (err) {
            return null;
        }
    }
    async importData(table, date) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/import?table='+table+'&date='+encodeURIComponent(date)).then((res) => {
                return res.json()
            });
        } catch (err) {
            return err.message;
        }
    }
    async updateImportDate(table, date) {
        try {
            var importDate = JSON.parse(await AsyncStorage.getItem('importDate'));
            importDate[table] = date;
            AsyncStorage.setItem('importDate', JSON.stringify(importDate));
            return 'updated '+date;
        } catch (err) {
            return err.message;
        }
    }
    async exportDate(table) {
        try {
            var exportDate = JSON.parse(await AsyncStorage.getItem('exportDate'));
            return (_.isUndefined(exportDate[table])) ? null : exportDate[table];
        } catch (err) {
            return null;
        }
    }
    async updateExportDate(table, date) {
        try {
            var exportDate = JSON.parse(await AsyncStorage.getItem('exportDate'));
            exportDate[table] = date;
            AsyncStorage.setItem('exportDate', JSON.stringify(exportDate));
            return 'updated '+date;
        } catch (err) {
            return err.message;
        }
    }
    async exportData(table, rows) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/export?table='+table, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: _.join(rows, '&')
            }).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(table+':', e.message)
        }
    }
    jsonToQueryString(json) {
        return Object.keys(json).map((key) => {
            return encodeURIComponent('"') + encodeURIComponent(key) + encodeURIComponent('"') + encodeURIComponent(":") + encodeURIComponent('"') + encodeURIComponent(json[key])+ encodeURIComponent('"');
        }).join(encodeURIComponent(','));
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

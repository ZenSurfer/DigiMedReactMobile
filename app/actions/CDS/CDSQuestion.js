'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Keyboard, Image, View, AsyncStorage, Navigator, StatusBar, ProgressBar, DrawerLayoutAndroid, InteractionManager, TouchableNativeFeedback, TouchableOpacity, ListView, RefreshControl, Modal, TouchableHighlight, TextInput, NetInfo, ActivityIndicator} from 'react-native'
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
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

class CDSQuestion extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: true,
            query: '',
            queryText: '',
            search: 'ORDER BY firstname ASC',
            searchType: 'firstname',
            modalVisible: false,
            rowData: [],
            avatar: false,
            syncing: false,
            syncingTitle: 'Syncing Patients...',
        }
        this.sampleData = [
            {
                id: 1,
                title: "How bad is your cough?",
                data: [
                    {
                        id: 1,
                        value: 'mild',
                        selected: false,
                    },
                    {
                        id: 2,
                        value: 'moderate',
                        selected: false,
                    },
                    {
                        id: 3,
                        value: 'severe',
                        selected: false,
                    },
                ],
            },
            {
                id: 2,
                title: "Do you have chest pain?",
                selected: null,
            },
            {
                id: 3,
                title: "How many cigarettes do you smoke each day?",
                data: [
                    {
                        id: 1,
                        value: 'none',
                        selected: false,
                    },
                    {
                        id: 2,
                        value: 'less than 8',
                        selected: false,
                    },
                    {
                        id: 3,
                        value: 'extreme',
                        selected: false,
                    },
                ],
            },
        ]
    }
    componentWillMount() {
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
                RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                    this.setState({avatar: (rs.toString().indexOf('dataimage/jpegbase64') !== -1) ? _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,') : 'data:image/jpeg;base64,'+rs.toString()})
                })
        })
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
            setTimeout(() => {
                this.onRefresh();
            }, 1000)
        }
    }
    render() {
        return (
            <Navigator
                renderScene={this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={[Styles.navigationBar, {marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper(this.props.patientID, this.props.patientName, this.state.avatar, this)} />
                }/>
        )
    }
    renderScene(route, navigator) {
        return (
            <View style={[Styles.containerStyle]}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Test Questions</Text>
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
                    style={[Styles.buttonFab, {backgroundColor: '#4CAF50'}]}
                    onPress={() => this.gotoCDSResult()}>
                    <Icon name={'check'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        )
    }
    renderListView(rowData, rowID) {
        return (
            <View style={{flex: 1, backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderBottomWidth: 0.5}}>
                <View style={{flex: 1, flexDirection: 'row', paddingLeft: 16, paddingRight: 16, minHeight: 80, justifyContent: 'center'}}>
                {(_.isArray(rowData.data)) ?  (
                    <View style={[styles.listText, {flex: 1, alignItems: 'center', justifyContent: 'center'}]}>
                        <Text style={styles.listItemHead}>{rowData.title}</Text>
                        <View style={{flex: 1, flexDirection: 'column', marginTop: 10, marginBottom: 12, alignSelf: 'stretch'}}>{_.map(rowData.data, (v, i) => {
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[Styles.coloredButton, {borderWidth: 0.5, borderRadius: 0, marginTop: 0, marginBottom: 0}, ((v.selected) ? {borderColor: '#FFD54F', backgroundColor: '#FFCA28'}: {backgroundColor: '#EEEEEE', borderColor: '#E0E0E0'})]}
                                        onPress={() => this.updateRowData(rowID, i)}
                                        activeOpacity={0.6}
                                    >
                                        <Text style={{color: '#212121'}}>{_.upperCase(v.value)}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>) : (
                    <View style={[styles.listText, {flex: 1, alignItems: 'center', justifyContent: 'center'}]}>
                        <Text style={styles.listItemHead}>{rowData.title}</Text>
                        <View style={[{flexDirection: 'row', marginBottom: 15}]}>
                            <TouchableOpacity
                                style={[Styles.coloredButton, {borderWidth: 0.5, borderRadius: 0, marginTop: 0, marginBottom: 0}, ((rowData.data) ? {borderColor: '#FFD54F', backgroundColor: '#FFCA28'}: {backgroundColor: '#EEEEEE', borderColor: '#E0E0E0'})]}
                                onPress={() => this.updateRowData(rowID, true)}
                                activeOpacity={0.6}>
                                <Text style={{color: '#212121'}}>YES</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.coloredButton, {borderColor: '#EEEEEE', borderWidth: 0.5, borderRadius: 0, marginTop: 0, marginBottom: 0}, ((!rowData.data && rowData.data != null) ? {borderColor: '#FFD54F', backgroundColor: '#FFCA28'}: {backgroundColor: '#EEEEEE', borderColor: '#E0E0E0'})]}
                                onPress={() => this.updateRowData(rowID, false)}
                                activeOpacity={0.6}>
                                <Text style={{color: '#212121'}}>NO</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                </View>
            </View>
        )
    }
    updateRowData(rowID, value) {
        var rowData = this.state.rowData;
        if (_.isArray(rowData[rowID]['data'])) {
            _.map(rowData[rowID]['data'], (v, i) => {
                v['selected'] = false;
                return v;
            });
            rowData[rowID]['data'][value]['selected'] = true;
        } else {
            rowData[rowID]['data'] = '';
            rowData[rowID]['data'] = value;
        }
        this.setState({rowData: rowData});
    }
    onRefresh() {
        this.setState({refreshing: false, rowData: _.remove(this.sampleData, (n) => {
            if (this.state.queryText !== '')
                return !_.includes(n['name'], this.state.queryText);
            else
                return true;
        })})
    }
    gotoCDSResult(rowData) {
        this.props.navigator.push({
            id: 'CDSResult',
            passProps: {
                patientID: this.props.patientID,
                patientAvatar: this.props.patientAvatar,
                patientName: this.props.patientName,
                rowData: this.state.rowData
            }
        })
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
                                if (table == 'patients' || table == 'staff' || table == 'nurses' || table == 'doctors') {
                                    RNFS.exists(RNFS.DocumentDirectoryPath+'/'+db.data.item(i).imagePath).then((exist) => {
                                        if (exist)
                                            RNFS.readFile(RNFS.DocumentDirectoryPath+'/'+db.data.item(i).imagePath, 'base64').then((image) => {
                                                this.exportImage({
                                                    imagePath: db.data.item(i).imagePath,
                                                    image: (image.toString().indexOf('dataimage/jpegbase64') !== -1) ? encodeURIComponent(_.replace(image.toString(), 'dataimage/jpegbase64','')) :  encodeURIComponent(image.toString())
                                                }, table).done();
                                            })
                                    })
                                }
                                if (table == 'patientImages') {
                                    RNFS.exists(RNFS.DocumentDirectoryPath+'/patient/'+db.data.item(i).image).then((exist) => {
                                        if (exist)
                                            RNFS.readFile(RNFS.DocumentDirectoryPath+'/patient/'+db.data.item(i).image, 'base64').then((image) => {
                                                this.exportImage({
                                                    imagePath: 'patient/'+db.data.item(i).image,
                                                    image: (image.toString().indexOf('dataimage/jpegbase64') !== -1) ? encodeURIComponent(_.replace(image.toString(), 'dataimage/jpegbase64','')) :  encodeURIComponent(image.toString())
                                                }, table).done();
                                            })
                                    })
                                }
                            })
                            this.exportData(table, rows).then(data => {
                                if(!_.isUndefined(data) && data.success) {
                                    this.updateExportDate(table, data.exportdate).then(msg => console.log(data.table+' export', msg)).done()
                                    this.importDate(table).then(importDate => {
                                        if (importDate === null) {
                                            importDate = moment().year(2000).format('YYYY-MM-DD HH:mm:ss')
                                        }
                                        if (moment().diff(moment(importDate), 'minutes') >= EnvInstance.interval) {
                                            // this.setState({syncing: true, syncingTitle: 'Syncing Patients...'})
                                            this.setState({syncing: true})
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
                                                                        // console.log(RNFS.DocumentDirectoryPath+'/'+n.imagePath, decodeURIComponent(data.avatar))
                                                                        RNFS.writeFile(RNFS.DocumentDirectoryPath+'/'+n.imagePath, decodeURIComponent(data.avatar), 'base64').then((success) => {
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
                                                        // ToastAndroid.show(err.message+'!', 1000)
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
                                        } else {
                                            if(_.last(tables) === table)
                                                this.setState({syncing: false})
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
    async exportImage(rows, table) {
        try {
            return await fetch(EnvInstance.cloudUrl+'/api/v2/storeimage?type='+table, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rows)
            }).then((response) => {
                return response.json()
            });
        } catch (err) {
            console.log(table+':', err.message)
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
            console.log(table+':', err.message)
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
        height: 48,
        width: 48,
        borderRadius: 30,
        margin: 5,
        marginRight: 10,
    },
    avatarIcon: {
        margin: 0,
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
        borderBottomColor: '#EEE',
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
        fontSize: 24,
        color: '#424242',
        textAlign: 'center',
        paddingTop: 20,
        paddingBottom: 16,
    },
    listItem: {
        fontSize: 14,
    },
})

var NavigationBarRouteMapper = (patientID, patientName, avatar, state) => ({
    LeftButton(route, navigator, index, nextState) {
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                    onPress={() => {
                        navigator.parentNavigator.pop()
                    }}>
                    <Text style={{color: 'white', margin: 10, marginTop: 15}}>
                        <Icon name="keyboard-arrow-left" size={30} color="#FFF" />
                    </Text>
                </TouchableOpacity>
                {(avatar) ? (<Image source={{uri: avatar}} style={styles.avatarImage}/>) : (<Image source={require('./../../assets/images/patient.png')} style={styles.avatarImage}/>)}
            </View>
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
    Title(route, navigator, index, nextState) {
        return (
            <TouchableOpacity
                style={[Styles.title, {marginLeft: 50}]}
                onPress={() => {
                    navigator.parentNavigator.push({
                        id: 'PatientProfile',
                        passProps: { patientID: patientID},
                    })
                }}>
                <Text style={[Styles.titleText]}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = CDSQuestion

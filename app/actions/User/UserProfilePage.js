'use-strict'

import React, {Component} from 'react'
import {Text, View, StyleSheet, Navigator, Image, DrawerLayoutAndroid, ListView, TouchableOpacity, InteractionManager, ScrollView, RefreshControl, Dimensions, ActivityIndicator, NetInfo, AsyncStorage} from 'react-native'
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
            syncing: false,
            syncingTitle: 'Syncing Doctors...',
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
                RNFS.exists(RNFS.ExternalDirectoryPath +'/'+ db.data.imagePath).then((exist) => {
                    if (exist)
                        RNFS.readFile(RNFS.ExternalDirectoryPath +'/'+ db.data.imagePath, 'base64').then((rs) => {
                            this.setState({avatar: (rs.toString().indexOf('dataimage/jpegbase64') !== -1) ? _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,') : 'data:image/jpeg;base64,'+rs.toString()});
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
                        <Navigator.NavigationBar
                            style={[Styles.navigationBar,{}]}
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
                <View style={[Styles.subTolbar, {}]}>
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
                    style={[Styles.buttonFab, Styles.subTolbarButton, {}]}
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
        )
    }
    onRefresh() {
        this.setState({refreshing: true});
        db.transaction((tx) => {
            tx.executeSql("SELECT `id`, `groupID`, `patientID`, `userID`, `firstname`, `middlename`, `lastname`, `nameSuffix`, `birthdate`, `initial`, `type`, `sex`, `status`, `address`, `phone1`, `phone2`, `email`, `imagePath`, `imageMime`, `allowAsPatient`, `deleted_at`, `created_at`, `updated_at` FROM doctors WHERE `doctors`.`id`= ?", [this.props.doctorID], function(tx, rs) {
                db.data = rs.rows.item(0);
            });
        }, (err) => {
            alert(err.message);
        }, () => {
            var doctorName = 'Dr. '+db.data.firstname+' '+db.data.middlename+' '+db.data.lastname;
            if (db.data.imagePath)
                RNFS.exists(RNFS.ExternalDirectoryPath +'/'+ db.data.imagePath).then((exist) => {
                    if (exist)
                        RNFS.readFile(RNFS.ExternalDirectoryPath +'/'+ db.data.imagePath, 'base64').then((rs) => {
                            this.setState({avatar: (rs.toString().indexOf('dataimage/jpegbase64') !== -1) ? _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,') : 'data:image/jpeg;base64,'+rs.toString()});
                        })
                })
            this.updateCredentials({
                userID: db.data.userID,
                id: db.data.id,
                name: doctorName,
                type: db.data.type,
                initial: db.data.initial,
                imagePath: db.data.imagePath
            }).done();
            this.setState({refreshing: false, rowData: db.data, doctorName: doctorName});
            this.updateData(['doctors']);
        });
    }
    async updateCredentials(data) {
        try {
            await AsyncStorage.setItem('doctor', JSON.stringify(data))
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        }
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
                                if (table == 'patients' || table == 'staff' || table == 'nurses' || table == 'doctors') {
                                    RNFS.exists(RNFS.ExternalDirectoryPath+'/'+db.data.item(i).imagePath).then((exist) => {
                                        if (exist)
                                            RNFS.readFile(RNFS.ExternalDirectoryPath+'/'+db.data.item(i).imagePath, 'base64').then((image) => {
                                                this.exportImage({
                                                    imagePath: db.data.item(i).imagePath,
                                                    image: (image.toString().indexOf('dataimage/jpegbase64') !== -1) ? encodeURIComponent(_.replace(image.toString(), 'dataimage/jpegbase64','')) :  encodeURIComponent(image.toString())
                                                }, table).done();
                                            })
                                    })
                                }
                                if (table == 'patientImages') {
                                    RNFS.exists(RNFS.ExternalDirectoryPath+'/patient/'+db.data.item(i).image).then((exist) => {
                                        if (exist)
                                            RNFS.readFile(RNFS.ExternalDirectoryPath+'/patient/'+db.data.item(i).image, 'base64').then((image) => {
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
                                            this.setState({syncing: true, syncingTitle: 'Syncing Doctors...'})
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

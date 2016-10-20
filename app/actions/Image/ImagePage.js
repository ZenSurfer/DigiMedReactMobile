'use strict';

import React, {Component} from 'react'
import {StyleSheet, Text, View, ListView, RefreshControl, Navigator, Dimensions, ToastAndroid, TouchableOpacity, TouchableNativeFeedback, Image, Alert, ScrollView, InteractionManager, ActivityIndicator} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'
import _ from 'lodash'
import Styles from '../../assets/Styles'
import Env from '../../env'
import moment from 'moment'

const {height, width} = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()

class ImagePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            imaging: [],
            avatar: false,
            renderPlaceholderOnly: true,
        }
    }
    componentWillMount() {
        this.setState({refreshing: true})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM patientImages WHERE patientID=? AND (deleted_at in (null, 'NULL', '') OR deleted_at is null) ORDER BY created_at DESC", [this.props.patientID], (tx, rs) => {
                db.data = rs.rows
            })
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            var imaging = [];
            _.forEach(db.data, (v, i) => {
                if (db.data.item(i).image != '')
                    RNFS.exists(RNFS.ExternalDirectoryPath+'/patient/'+db.data.item(i).image).then((exist) => {
                        if (exist)
                            RNFS.readFile(RNFS.ExternalDirectoryPath+'/patient/'+db.data.item(i).image, 'base64').then((rs) => {
                                var obj = {};
                                obj[db.data.item(i).image] = _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,');
                                this.setState(obj);
                            })
                    })
                imaging.push(db.data.item(i))
            })
            this.setState({refreshing: false, imaging: imaging})
        })
        RNFS.exists(this.props.patientAvatar).then((exist) => {
            if (exist)
                RNFS.readFile(this.props.patientAvatar, 'base64').then((rs) => {
                    this.setState({avatar: _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,')})
                })
        })
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({renderPlaceholderOnly: false});
        });
    }
    renderPlaceholderView() {
        return (
            <View style={[Styles.containerStyle, {backgroundColor: '#E0E0E0'}]}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Imaging</Text>
                </View>
                <View style={Styles.loading}>
                    <View style={Styles.horizontal}><ActivityIndicator color="#212121" size={23}/></View>
                </View>
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 24}]}
                    onPress={() => this.props.navigator.push({
                        id: 'AddImage',
                        passProps: {
                            diagnosisID: this.props.diagnosisID,
                            patientID: this.props.patientID,
                            patientAvatar: this.props.patientAvatar,
                            patientName: this.props.patientName
                        }
                    })}>
                    <Icon name={'add'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        );
    }
    render() {
        return (
            <Navigator
                renderScene={(this.state.renderPlaceholderOnly) ? this.renderPlaceholderView.bind(this) : this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={[Styles.navigationBar,{marginTop: 24}]}
                        routeMapper={NavigationBarRouteMapper(this.props.patientID, this.props.patientName, this.state.avatar)} />
                }/>
        );
    }
    renderScene(route, navigator) {
        return (
            <View style={[Styles.containerStyle, {backgroundColor: '#E0E0E0'}]}>
                {this.props.children}
                <View style={[Styles.subTolbar, {marginTop: 24}]}>
                    <Text style={Styles.subTitle}>Imaging</Text>
                </View>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh.bind(this)}
                        />
                    }>
                    {_.map(this.state.imaging, (v, i) => {
                        if ((i % 2) == 0)
                        return (
                            <View key={i} style={{flexDirection: 'row'}}>
                                <View style={{flex: 1, alignItems: 'stretch', margin: 1, marginRight: 0.5}}>
                                    <View style={{height: 180, backgroundColor: '#FFFFFF'}}>
                                        <Image
                                            resizeMode={'cover'}
                                            style={{height: 180, alignItems: 'stretch'}}
                                            source={{uri: (this.state.imaging[i].image) ? this.state[this.state.imaging[i].image] : '' }}/>
                                        <View style={{position: 'absolute', top: 0, flex: 1, flexDirection: 'row',}}>
                                            <View style={{flex: 1, height: 180, justifyContent: 'center', alignItems: 'center'}}>
                                                <TouchableOpacity
                                                    style={{padding: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 100}}
                                                    onPress={() => this.props.navigator.push({
                                                        id: 'ViewImage',
                                                        passProps: {
                                                            diagnosisID: this.props.diagnosisID,
                                                            patientImageID: this.state.imaging[i].id,
                                                            patientID: this.props.patientID,
                                                            patientAvatar: this.props.patientAvatar,
                                                            patientName: this.props.patientName
                                                        },
                                                        sceneConfig:  Navigator.SceneConfigs.FloatFromBottomAndroid
                                                    })}>
                                                    <Icon name={'launch'} color={'#FFF'} size={25}/>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{flexDirection: 'row', backgroundColor: '#FFEB3B'}}>
                                        <TouchableOpacity
                                            style={{flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 10}}
                                            onPress={() => {
                                                Alert.alert(
                                                'Annotation',
                                                ((this.state.imaging[i].imageAnnotation) ? this.state.imaging[i].imageAnnotation : '-')+'\n\n'+moment(this.state.imaging[i].created_at).format('MMMM DD, YYYY'),
                                                [
                                                {text: 'DELETE', onPress: () => {
                                                    Alert.alert(
                                                    'Delete Confirmation',
                                                    'Are you sure you want to delete?',
                                                    [
                                                    {text: 'CANCEL'},
                                                    {text: 'OK', onPress: () => {
                                                        db.transaction((tx) => {
                                                            tx.executeSql("UPDATE patientImages SET deleted_at = ?, updated_at = ? where id = ?", [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'), this.state.imaging[i].id], (tx, rs) => {
                                                                console.log("deleted: " + rs.rowsAffected);
                                                            }, (tx, err) => {
                                                                console.log('DELETE error: ' + err.message);
                                                            });
                                                        }, (err) => {
                                                            ToastAndroid.show("Error occured while deleting!", 3000)
                                                        }, () => {
                                                            this.onRefresh();
                                                            ToastAndroid.show("Successfully deleted!", 3000)
                                                        })
                                                    }},
                                                    ]
                                                    )
                                                }},
                                                {text: 'EDIT', onPress: () => {
                                                    this.props.navigator.push({
                                                        id: 'EditImage',
                                                        passProps: {
                                                            diagnosisID: this.props.diagnosisID,
                                                            patientImageID: this.state.imaging[i].id,
                                                            patientID: this.props.patientID,
                                                            patientAvatar: this.props.patientAvatar,
                                                            patientName: this.props.patientName
                                                        }
                                                    })
                                                }},
                                                {text: 'CLOSE'},
                                                ]
                                                )
                                            }}>
                                            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 2}}>
                                                <Icon name={'info'} size={25} style={{color: '#212121', textAlignVertical: 'center'}}/>
                                                <Text style={{color: '#212121', paddingLeft: 10, textAlignVertical: 'center'}}>Annotation</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {(_.isEmpty(this.state.imaging[i+1])) ? (<View style={{flex: 1, alignItems: 'stretch', margin: 1, marginLeft: 0.5}}/>) : (
                                    <View style={{flex: 1, alignItems: 'stretch', margin: 1, marginLeft: 0.5}}>
                                        <View style={{height: 180, backgroundColor: '#FFFFFF'}}>
                                            <Image
                                                resizeMode={'cover'}
                                                style={{height: 180, alignItems: 'stretch'}}
                                                source={{uri: (this.state.imaging[i+1].image) ? this.state[this.state.imaging[i+1].image] : '' }}/>
                                            <View style={{position: 'absolute', top: 0, flex: 1, flexDirection: 'row',}}>
                                                <View style={{flex: 1, height: 180, justifyContent: 'center', alignItems: 'center'}}>
                                                    <TouchableOpacity
                                                        style={{padding: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 100}}
                                                        onPress={() => this.props.navigator.push({
                                                            id: 'ViewImage',
                                                            passProps: {
                                                                diagnosisID: this.props.diagnosisID,
                                                                patientImageID: this.state.imaging[i+1].id,
                                                                patientID: this.props.patientID,
                                                                patientAvatar: this.props.patientAvatar,
                                                                patientName: this.props.patientName
                                                            },
                                                            sceneConfig:  Navigator.SceneConfigs.FloatFromBottomAndroid
                                                        })}>
                                                        <Icon name={'launch'} color={'#FFF'} size={25}/>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{flexDirection: 'row', backgroundColor: '#FFEB3B'}}>
                                            <TouchableOpacity
                                                style={{flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 10}}
                                                onPress={() => {
                                                    Alert.alert(
                                                        'Annotation',
                                                        ((this.state.imaging[i+1].imageAnnotation) ? this.state.imaging[i+1].imageAnnotation : '-')+'\n\n'+moment(this.state.imaging[i+1].created_at).format('MMMM DD, YYYY'),
                                                        [
                                                            {text: 'DELETE', onPress: () => {
                                                                Alert.alert(
                                                                    'Delete Confirmation',
                                                                    'Are you sure you want to delete?',
                                                                    [
                                                                        {text: 'CANCEL'},
                                                                        {text: 'OK', onPress: () => {
                                                                            db.transaction((tx) => {
                                                                                tx.executeSql("UPDATE patientImages SET deleted_at = ?, updated_at = ? where id = ?", [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'), this.state.imaging[i+1].id], (tx, rs) => {
                                                                                    console.log("deleted: " + rs.rowsAffected);
                                                                                }, (tx, err) => {
                                                                                    console.log('DELETE error: ' + err.message);
                                                                                });
                                                                            }, (err) => {
                                                                                ToastAndroid.show("Error occured while deleting!", 3000)
                                                                            }, () => {
                                                                                this.onRefresh();
                                                                                ToastAndroid.show("Successfully deleted!", 3000)
                                                                            })
                                                                        }},
                                                                    ]
                                                                )
                                                            }},
                                                            {text: 'EDIT', onPress: () => {
                                                                this.props.navigator.push({
                                                                    id: 'EditImage',
                                                                    passProps: {
                                                                        diagnosisID: this.props.diagnosisID,
                                                                        patientImageID: this.state.imaging[i+1].id,
                                                                        patientID: this.props.patientID,
                                                                        patientAvatar: this.props.patientAvatar,
                                                                        patientName: this.props.patientName
                                                                    }
                                                                })
                                                            }},
                                                            {text: 'CLOSE', onPress: () => console.log('OK Pressed')},
                                                        ]
                                                    )
                                                }}>
                                                <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 2}}>
                                                    <Icon name={'info'} size={25} style={{color: '#212121', textAlignVertical: 'center'}}/>
                                                    <Text style={{color: '#212121', paddingLeft: 10, textAlignVertical: 'center'}}>Annotation</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )
                    })}
                </ScrollView>
                <TouchableOpacity
                    style={[Styles.buttonFab, Styles.subTolbarButton, {marginTop: 24}]}
                    onPress={() => this.props.navigator.push({
                        id: 'AddImage',
                        passProps: {
                            diagnosisID: this.props.diagnosisID,
                            patientID: this.props.patientID,
                            patientAvatar: this.props.patientAvatar,
                            patientName: this.props.patientName
                        }
                    })}>
                    <Icon name={'add'} color={'#FFFFFF'} size={30}/>
                </TouchableOpacity>
            </View>
        );
    }
    onRefresh() {
        this.setState({refreshing: true, imaging: []})
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM patientImages WHERE patientID=? AND (deleted_at in (null, 'NULL', '') OR deleted_at is null) ORDER BY created_at DESC", [this.props.patientID], (tx, rs) => {
                db.data = rs.rows
            })
        }, (error) => {
            console.log('transaction error: ' + error.message);
        }, () => {
            var imaging = [];
            _.forEach(db.data, (v, i) => {
                if (db.data.item(i).image != '')
                    RNFS.readFile(RNFS.ExternalDirectoryPath+'/patient/'+db.data.item(i).image, 'base64').then((rs) => {
                        var obj = {};
                        obj[db.data.item(i).image] = _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,');
                        this.setState(obj);
                    })
                imaging.push(db.data.item(i))
            })
            this.setState({refreshing: false, imaging: imaging})
        })
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
    listView: {
        borderStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
        elevation: 10,
    },
    listText: {
        alignItems: 'stretch',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 16,
        marginRight: 16,
    },
    listItemHead: {
        fontSize: 22,
        paddingTop: 0,
        paddingBottom: 2,
        color: '#424242'
    },
    listItem: {
        fontSize: 14,
    },
})
var NavigationBarRouteMapper = (patientID, patientName, avatar) => ({
    LeftButton(route, navigator, index, nextState) {
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                    onPress={() => navigator.parentNavigator.pop()}>
                    <Text style={{color: 'white', margin: 10, marginTop: 15}}>
                        <Icon name="keyboard-arrow-left" size={30} color="#FFF" />
                    </Text>
                </TouchableOpacity>
                {(avatar) ? (<Image source={{uri: avatar}} style={styles.avatarImage}/>) : (<Icon name={'account-circle'} color={'#FFFFFF'} size={65}  style={styles.avatarIcon}/>)}
            </View>
        )
    },
    RightButton(route, navigator, index, nextState) {
        return null
    },
    Title(route, navigator, index, nextState) {
        return (
            <TouchableOpacity style={[Styles.title, {marginLeft: 50}]}>
                <Text style={[Styles.titleText]}>{patientName}</Text>
            </TouchableOpacity>
        )
    }
})

module.exports = ImagePage;

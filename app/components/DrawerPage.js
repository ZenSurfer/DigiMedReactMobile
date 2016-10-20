'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, View, TouchableNativeFeedback, TouchableHighlight, Image, StatusBar, ScrollView, Navigator} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Styles from '../assets/Styles'

class DrawerPage extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <ScrollView>
                <View style={styles.drawerView}>
                    <Image
                        style={{height: 200, width: 300}}
                        source={require('../assets/images/banner.jpg')}
                        resizeMode={Image.resizeMode.cover}>
                        <View style={styles.drawerImageContainer}>
                            <Image style={styles.drawerImageAvatar} source={{uri: 'https://avatars.io/facebook/donald/large'}}></Image>
                            <Text style={styles.drawerImageName}>Donald P Benas</Text>
                            <Text style={styles.drawerImageEmail}>donaldbenas@gmail.com</Text>
                        </View>
                    </Image>
                    <View style={styles.drawerContainer}>
                        <TouchableNativeFeedback
                                onPress={() => this.props.navigator.replace({
                                    id: 'MainPage',
                                })
                            }>
                            <View style={styles.drawerViewWrapper}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='home' style={styles.icon} />
                                </View>
                                <Text style={styles.drawerViewText}>Dashboard</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <View style={{borderStyle: 'solid', borderBottomWidth: 1, borderBottomColor: '#EEEEEE'}}></View>
                        <Text style={styles.drawerLabel}>Patient</Text>
                        <TouchableNativeFeedback
                                onPress={() => this.props.navigator.replace({
                                    id: 'PatientPage',
                                })
                            }>
                            <View style={styles.drawerViewWrapper}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='group' style={styles.icon} />
                                </View>
                                <Text style={styles.drawerViewText}>Patient's List</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback
                                onPress={() => this.props.navigator.replace({
                                    id: 'AddPatient',
                                })
                            }>
                            <View style={styles.drawerViewWrapper}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='person-add' style={styles.icon} />
                                </View>
                                <Text style={styles.drawerViewText}>Add Patient</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <View style={{borderStyle: 'solid', borderBottomWidth: 1, borderBottomColor: '#EEEEEE'}}></View>
                        <TouchableNativeFeedback
                                onPress={() => this.props.navigator.replace({
                                    id: 'FrontPage',
                                })
                            }>
                            <View style={styles.drawerViewWrapper}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='assignment' style={styles.icon} />
                                </View>
                                <Text style={styles.drawerViewText}>Frontdesk</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <View style={{borderStyle: 'solid', borderBottomWidth: 1, borderBottomColor: '#EEEEEE'}}></View>
                        <Text style={styles.drawerLabel}>Syncing</Text>
                        <TouchableNativeFeedback>
                            <View style={styles.drawerViewWrapper}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='import-export' style={styles.icon} />
                                </View>
                                <Text style={styles.drawerViewText}>Import to Cloud</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback>
                            <View style={styles.drawerViewWrapper}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='sync' style={styles.icon} />
                                </View>
                                <Text style={styles.drawerViewText}>Export to Cloud</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <View style={{borderStyle: 'solid', borderBottomWidth: 1, borderBottomColor: '#EEEEEE'}}></View>
                        <Text style={styles.drawerLabel}>User</Text>
                        <TouchableNativeFeedback>
                            <View style={styles.drawerViewWrapper}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='settings' style={styles.icon} />
                                </View>
                                <Text style={styles.drawerViewText}>Settings</Text>
                            </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback
                            onPress={() => this.props.navigator.replace({
                                id: 'LoginPage',
                                sceneConfig: Navigator.SceneConfigs.FadeAndroid
                            })
                        }>
                            <View style={styles.drawerViewWrapper}>
                                <View style={styles.iconWrapper}>
                                    <Icon name='exit-to-app' style={styles.icon} />
                                </View>
                                <Text style={styles.drawerViewText}>Logout</Text>
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            </ScrollView>
        )
    }

}

module.exports = DrawerPage

const styles = StyleSheet.create({
    drawerImageContainer: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 25,
        marginLeft: 16,
        marginRight: 16,
    },
    drawerImageAvatar: {
        height: 80,
        width: 80,
        borderRadius: 40,
        marginTop: 6,
        marginBottom: 10,
    },
    drawerImageName: {
        color: '#FFF',
        fontSize: 18,
    },
    drawerImageEmail: {
        color: '#FFF',
    },
    drawerView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#FFF',
        marginBottom: 0,
    },
    drawerContainer: {
        marginTop: 0,
        flex: 1,
    },
    drawerLabel: {
        marginTop: 5,
        marginLeft: 16,
        color: '#424242',
        fontWeight: 'bold'
    },
    drawerViewWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
        height: 45,
    },
    drawerViewText: {
        fontSize: 15,
        textAlign: 'left',
        textAlignVertical: 'center'
    },
    iconWrapper: {
        borderRadius: 2,
        backgroundColor: '#FFF',
        marginRight: 30
    },
    icon: {
        textAlignVertical: 'center',
        textAlign: 'center',
        width: 30,
        height: 28,
        color: '#616161',
        fontSize: 25
    },
})

module.exports = DrawerPage

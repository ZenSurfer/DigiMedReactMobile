'use strict'

import React, {Component} from 'react'
import {StyleSheet, Text, Image, View, Navigator, TouchableOpacity, DrawerLayoutAndroid, ScrollView} from 'react-native'
import {MKButton} from 'react-native-material-kit'
import Icon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'

import Styles from '../assets/Styles'

const ColoredButton = MKButton.coloredButton()
.withBackgroundColor('#FF3D00')
.withStyle({
    marginBottom: 10,
})
.build()

class PersonPage extends Component {
    render() {
        var navigationView = (
            <View style={Styles.drawerView}>
                <Text style={Styles.drawerViewText}>I'm in the Drawer!</Text>
            </View>
        )
        return (
            <DrawerLayoutAndroid
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => navigationView}
                ref={this.drawerInstance}
                >
                <Text style={{height: 24, backgroundColor: '#2979FF'}}></Text>
                <Navigator
                    renderScene={this.renderScene.bind(this)}
                    navigator={this.props.navigator}
                    navigationBar={
                        <Navigator.NavigationBar style={Styles.navigationBar}
                            routeMapper={NavigationBarRouteMapper} />
                    }
                    configureScene = {this.configureScene}
                    />
            </DrawerLayoutAndroid>
        )
    }
    renderScene(route, navigator) {
        var rates = [1,2,3,4,5]
        return (
            <ScrollView>
                <View style={Styles.containerStyle}>
                    {this.props.children}
                    <View style={styles.person}>
                        <View style={styles.personInformation}>
                            <Image source={{uri: 'https://avatars.io/facebook/'+_.toLower(_.replace(this.props.rowData.firstname, ' ', ''))+'/large'}} style={styles.avatarImage}/>
                            <View style={styles.personDetails}>
                                <Text style={styles.personName}>{this.props.rowData.firstname} {this.props.rowData.lastname} {this.props.rowData.middlename}</Text>
                                <Text style={{textAlign: 'center'}}>{_.join(this.props.rowData.position, ', ')}</Text>
                                <View style={styles.personRate}>
                                    <Text style={{textAlign: 'center'}}>
                                        {rates.map((i, index) => {
                                            if ((this.props.rowData.rate/2) >= i) {
                                                return(<Icon name='star' size={20} color={'#FBC02D'} key={index} />)
                                            } else {
                                                if (((this.props.rowData.rate/2) + 0.5) == i ) {
                                                    return(<Icon name='star-half' size={20} color={'#FBC02D'} key={index} />)
                                                } else {
                                                    return(<Icon name='star-border' size={20} color={'#FBC02D'} key={index} />)
                                                }
                                            }
                                        })}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <ColoredButton>
                            <Text style={{color: '#FFF', margin: 4}}>VIEW FULL DESCRIPTION</Text>
                        </ColoredButton>
                        <Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text>
                        <Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text>
                        <Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text>
                        <Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text>
                        <Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text>
                    </View>
                </View>
            </ScrollView>
        )
    }
    gotoNext() {
        this.props.navigator.push({
            id: 'NoNavigatorPage',
            sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
        })
    }
}

var styles = StyleSheet.create({
    avatarImage: {
        height:  160,
        borderRadius: 100,
        width: 160,
        marginLeft: 16,
        marginRight: 16,
        marginTop: 6,
        marginBottom: 6,
    },
    person: {
        backgroundColor: '#FFF',
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
        margin: 6,
        marginBottom: 20,
        marginTop: 20,
    },
    personDetails: {
        flex: 1,
        alignItems: 'stretch',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        margin: 6,
        marginLeft: 10,
    },
    personName: {
        textAlign: 'center',
        fontSize: 32,
        color: '#424242',
    },
    personRate: {
        marginTop: 6,
    }
})

var NavigationBarRouteMapper = {
    LeftButton(route, navigator, index, nextState) {
        return (
            <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
                onPress={() => navigator.parentNavigator.pop()}>
                <Text style={{color: 'white', margin: 10,}}>
                    <Icon name="keyboard-arrow-left" size={30} color="#FFF" />
                </Text>
            </TouchableOpacity>
        )
    },
    RightButton(route, navigator, index, nextState) {
        return (
            <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
                onPress={() => navigator.parentNavigator.push({id: 'unknown', name: 'Unknown'})}>
                <Text style={{color: 'white', margin: 10,}}>
                    R
                </Text>
            </TouchableOpacity>
        )
    },
    Title(route, navigator, index, nextState) {
        return (
            <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}>
                <Text style={{color: 'white', fontSize: 16}}>
                    Patient Personal Information
                </Text>
            </TouchableOpacity>
        )
    }
}

module.exports = PersonPage

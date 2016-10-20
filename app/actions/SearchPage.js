'use strict';

import React, { Component } from 'react'
import { StyleSheet, Text, View, Navigator, ScrollView, DrawerLayoutAndroid, TextInput, TouchableOpacity, Dimensions, Picker} from 'react-native'
import {MKButton, MKTextField, MKColor} from 'react-native-material-kit'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Styles from '../assets/Styles'

class SearchPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            firstname: '',
            lastname: '',
            middlename: '',
            cptCode: '',
            icdCode: '',
            sort: '',
        }
    }
    render() {
        return (
            <Navigator
                renderScene={this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar style={Styles.navigationBar}
                        routeMapper={NavigationBarRouteMapper} />
                }
                configureScene = {this.configureScene}
                style={{marginTop: 24}}
                />
        )
    }
    renderScene() {
        return (
            <View style={[Styles.containerStyle, {backgroundColor: '#FFFFFF'}]}>
                {this.props.children}
                <ScrollView
                    keyboardShouldPersistTaps={true}>
                    <View style={{backgroundColor: '#FFFFFF', paddingLeft: 16, paddingRight: 16, paddingTop: 16}}>
                        <Text style={styles.label} >First Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.firstname}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({firstname: text})} />
                        <Text style={styles.label} >Last Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.lastname}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({lastname: text})} />
                        <Text style={styles.label} >Middle Name</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.middlename}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({middlename: text})} />
                        <Text style={styles.label} >CPT Code</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.cptCode}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({cptCode: text})} />
                        <Text style={styles.label} >ICD Code</Text>
                        <TextInput
                            placeholder={'Text Here...'}
                            style={styles.textInput}
                            value={this.state.icdCode}
                            placeholderTextColor={'#E0E0E0'}
                            autoCapitalize={'words'}
                            onChangeText={(text) => this.setState({icdCode: text})} />
                        <View style={styles.select}>
                            <Picker
                                style={{color: '#212121', marginLeft: -4, marginRight: -4}}
                                selectedValue={this.state.sort}
                                onValueChange={(select) => {
                                    this.setState({sort: select})
                                }}
                                mode='dialog'>
                                <Picker.Item label="First Name Ascending" value="ORDER BY firstname ASC" />
                                <Picker.Item label="First Name Descending" value="ORDER BY firstname DESC" />
                                <Picker.Item label="Last Name Ascending" value="ORDER BY lastname ASC" />
                                <Picker.Item label="Last Name Descending" value="ORDER BY lastname DESC" />
                                <Picker.Item label="Middle Name Ascending" value="ORDER BY middlename ASC" />
                                <Picker.Item label="Middle Name Descending" value="ORDER BY middlename DESC" />
                            </Picker>
                        </View>
                        <TouchableOpacity
                            style={[Styles.coloredButton, {backgroundColor: '#FF3D00'}]}
                            onPress={this.gotoPatientPage.bind(this)}>
                            <Text style={{color: '#FFFFFF', margin: 4}}>FILTER</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }
    gotoPatientPage() {
        var query = 'AND (firstname like "'+this.state.firstname+'%" AND lastname like "'+this.state.lastname+'%" AND middlename like "'+this.state.middlename+'%") '+this.state.sort;
        this.props.navigator.push({
            id:'PatientPage',
            passProps: { query: query },
            sceneConfig: Navigator.SceneConfigs.FadeAndroid,
        })
    }
}

const styles = StyleSheet.create({
    heading: {
        fontSize: 30,
        color: '#616161',
        marginBottom: 10,
        marginLeft: 4,
        marginRight: 4,
    },
    label: {
        color: '#616161',
        textAlign: 'left',
        marginLeft: 4,
        marginRight: 4,
    },
    select: {
        borderBottomWidth: 1,
        borderBottomColor: '#757575',
        borderStyle: 'solid',
        marginLeft: 4,
        marginRight: 4,
        marginBottom: 10,
        paddingLeft: -5,
    },
    textInput: {
        fontSize: 16,
        paddingTop: 5   ,
        marginBottom: 5,
    },
    switch: {
        height: 25,
        textAlignVertical: 'center',
        color: '#9E9E9E'
    },
})

var NavigationBarRouteMapper = {
    LeftButton(route, navigator, index, navState) {
        return (<TouchableOpacity style={Styles.title}>
            <Text style={{color: '#FFF', marginLeft: 14}}>
                <Icon name="search" size={30} color="#FFF" />
            </Text>
        </TouchableOpacity>)
    },
    RightButton(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={Styles.rightButton}
                onPress={() => navigator.parentNavigator.pop()} >
                <Text style={Styles.rightButtonText}>
                    <Icon name="close" size={30} color="#FFF" />
                </Text>
            </TouchableOpacity>
        )
    },
    Title(route, navigator, index, navState) {
        return (
            <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}>
                <Text style={{color: 'white', fontSize: 16}}>
                    Search Page
                </Text>
            </TouchableOpacity>
        )
    }
}

module.exports = SearchPage;

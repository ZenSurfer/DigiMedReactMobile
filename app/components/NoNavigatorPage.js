'use strict';

import React, { Component } from 'react'
import { StyleSheet, Text, View, Navigator, TouchableOpacity, Dimensions, Picker} from 'react-native'
import {MKButton, MKTextField, MKColor} from 'react-native-material-kit'
// import Picker from 'react-native-picker';

const ColoredButton = MKButton.coloredButton()
.withBackgroundColor('#FF3D00')
.withStyle({
    alignSelf: 'stretch',
    marginBottom: 10,
})
.build()

const Textfield = MKTextField.textfieldWithFloatingLabel()
.withHighlightColor('#2979FF')
.withPlaceholderTextColor('#9E9E9E')
.withUnderlineSize(2)
.withFloatingLabelFont({
    color: '#9E9E9E',
})
.withTextInputStyle({
    paddingBottom: 6,
    color: '#212121'
})
.withStyle({
    marginBottom: 10,
})
.build()


class NoNavigatorPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            search: '',
            sort: '',
        }
    }
    render() {
        var navigator = this.props.navigator;
        return (
            <View style={styles.container}>
                {this.props.children}
                <Textfield placeholder={'Search'} onChangeText={(text) => this.setState({search: 'q='+text})} />
                <Text style={styles.label}>Sort By</Text>
                <View style={styles.select}>
                    <Picker
                        style={{color: '#212121', marginLeft: -6}}
                        selectedValue={this.state.sort}
                        onValueChange={(select) => {
                            this.setState({sort: select})
                        }}
                        mode='dialog'>
                        <Picker.Item label="Name from A to Z" value="_sort=name&_order=ASC" />
                        <Picker.Item label="Name from Z to A" value="_sort=name&_order=DESC" />
                        <Picker.Item label="Position from A to Z" value="_sort=position&_order=ASC" />
                        <Picker.Item label="Position from Z to A" value="_sort=position&_order=DESC" />
                        <Picker.Item label="Location from A to Z" value="_sort=location&_order=ASC" />
                        <Picker.Item label="Location from Z to A" value="_sort=location&_order=DESC" />
                        <Picker.Item label="Rate from Highest to Lowest" value="_sort=rate&_order=DESC" />
                        <Picker.Item label="Rate from Lowest to Highest" value="_sort=rate&_order=ASC" />
                    </Picker>
                </View>
                <ColoredButton
                    onPress={() => this.gotoPersonPage()}>
                    <Text style={{color: '#FFFFFF', margin: 4}}>FILTER</Text>
                </ColoredButton>
            </View>
        );
    }
    gotoPersonPage() {
        this.props.navigator.push({
            id:'MainPage',
            passProps: {
                query: this.state
            },
            sceneConfig: Navigator.SceneConfigs.FadeAndroid,
        })
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
        paddingLeft: 16,
        paddingRight: 16,
    },
    label: {
        color: '#9E9E9E',
        textAlign: 'left'
    },
    select: {
        borderBottomWidth: 2,
        borderBottomColor: '#EEE',
        borderStyle: 'solid',
        marginBottom: 10,
    },
})

module.exports = NoNavigatorPage;

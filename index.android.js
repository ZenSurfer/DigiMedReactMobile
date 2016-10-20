'use strict'

import React, {Component} from 'react'
import {AppRegistry, Navigator, BackAndroid} from 'react-native'

import routes from './app/routes'

class AwesomeProject extends Component {
    render() {
        return (
            <Navigator
                initialRoute={{id: 'PatientPage'}}
                renderScene={this.renderScene.bind(this)}
                configureScene={(route) => {
                    if (route.sceneConfig) {
                        return route.sceneConfig
                    }
                    return Navigator.SceneConfigs.PushFromRight
                }} />
        )
    }
    renderScene(route, navigator) {
        BackAndroid.addEventListener('hardwareBackPress', function() {
            if (route.id !== 'PatientPage') {
                navigator.pop();
                return true;
            }
            return false
        });
        return routes(route, navigator, this)
    }
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject)

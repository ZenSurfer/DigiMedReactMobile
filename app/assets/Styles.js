'use strict'

import React from 'react'
import { StyleSheet, Dimensions } from 'react-native'

const {height, width} = Dimensions.get('window')

module.exports = StyleSheet.create({

    // navigation
    navigationBar: {
        backgroundColor: '#2979FF'
    },
    leftButton: {
        flex: 1,
        justifyContent: 'center'
    },
    rightButton: {
        flex: 1,
        justifyContent: 'center'
    },
    title: {
        flex: 1,
        justifyContent: 'center'
    },
    subTolbar: {
        backgroundColor: '#2979FF',
        paddingLeft: 16,
        paddingRight: 16
    },
    subTolbarButton: {
        top: 18,
        backgroundColor: '#E91E63'
    },
    subTitle: {
        color: '#FFFFFF',
        fontSize: 25,
        textAlignVertical: 'top',
        height: 50,
    },
    leftButtonText: {
        color: '#FFF',
        margin: 10,
    },
    rightButtonText: {
        color: '#FFF',
        margin: 10
    },
    titleText: {
        color: '#FFF',
        margin: 0,
        fontSize: 15,
    },

    // loading
    loading: {
        flex: 1,
        alignItems: 'center',
        width: width,
        paddingTop: 0,
        position: 'absolute',
        top: 67,
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 50,
        elevation: 5,
        marginTop: 25,
    },
    progress: {
        width: width,
    },

    // container
    containerStyle: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        marginTop: 56,
        backgroundColor: '#EEE'
    },

    // button styles
    buttonFab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2979FF',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    buttonFabCam: {
        position: 'absolute',
        top: 80,
        left: (width/ 2 - 30),
        backgroundColor: 'rgba(0,0,0,0.5)',
        elevation: 0
    },
    coloredButton: {
        backgroundColor: '#2979FF',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
        borderRadius: 2,
        marginTop: 10,
        marginBottom: 12,
        elevation: 1,
    },
})

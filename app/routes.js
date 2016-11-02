'use strict'

import React from 'react'
import {StatusBar, View, Text, TouchableOpacity, BackAndroid} from 'react-native'

import SplashPage from './actions/SplashPage'
import LoginPage from './actions/LoginPage'
import PersonPage from './actions/PersonPage'
import SearchPage from './actions/SearchPage'

import MainPage from './actions/MainPage'
import FrontPage from './actions/FrontPage'

import AddPatient from './actions/Patient/AddPatient'
import PatientPage from './actions/Patient/PatientPage'
import PatientProfile from './actions/Patient/PatientProfile'
import EditPatient from './actions/Patient/EditPatient'

import AddHPED from './actions/HPED/AddHPED'
import HPEDPage from './actions/HPED/HPEDPage'
import HPEDInfo from './actions/HPED/HPEDInfo'
import EditHPED from './actions/HPED/EditHPED'

import OrderItem from './actions/Labwork/OrderItem'

import PrescriptionPage from './actions/Prescription/PrescriptionPage'
import AddPrescription from './actions/Prescription/AddPrescription'
import EditPrescription from './actions/Prescription/EditPrescription'

import ImagePage from './actions/Image/ImagePage'
import ViewImage from './actions/Image/ViewImage'
import AddImage from './actions/Image/AddImage'
import EditImage from './actions/Image/EditImage'

import AppointmentPage from './actions/Appointment/AppointmentPage'
import AddAppointment from './actions/Appointment/AddAppointment'

import FollowupPage from './actions/Followup/FollowupPage'
import AddFollowup from './actions/Followup/AddFollowup'

import Styles from './assets/Styles'

module.exports = (route, navigator, state) => {

    var routeId = route.id

    if (routeId === 'SplashPage') {
        return (
            <SplashPage navigator={navigator}>
                <StatusBar backgroundColor='#2962FF' style={Styles.statusBar}/>
            </SplashPage>
        )
    }
    if (routeId === 'LoginPage') {
        return (
            <LoginPage navigator={navigator}>
                <StatusBar backgroundColor='#2962FF'/>
            </LoginPage>
        )
    }
    if (routeId === 'SearchPage') {
        return (
            <SearchPage navigator={navigator}>
                <StatusBar backgroundColor='#2962FF'/>
            </SearchPage>
        )
    }
    // main page
    if (routeId === 'MainPage') {
        return (
            <MainPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF' translucent={true}/>
            </MainPage>
        )
    }
    // patient page
    if (routeId === 'PatientPage') {
        return (
            <PatientPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF' translucent={true}/>
            </PatientPage>
        )
    }
    if (routeId === 'AddPatient') {
        return (
            <AddPatient navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF' translucent={true}/>
            </AddPatient>
        )
    }
    if (routeId === 'PatientProfile') {
        return (
            <PatientProfile navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </PatientProfile>
        )
    }
    if (routeId === 'EditPatient') {
        return (
            <EditPatient navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </EditPatient>
        )
    }

    //hped page
    if (routeId === 'AddHPED') {
        return (
            <AddHPED navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </AddHPED>
        )
    }
    if (routeId === 'HPEDPage') {
        return (
            <HPEDPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </HPEDPage>
        )
    }
    if (routeId === 'HPEDInfo') {
        return (
            <HPEDInfo navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </HPEDInfo>
        )
    }
    if (routeId === 'EditHPED') {
        return (
            <EditHPED navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </EditHPED>
        )
    }
    //labwork
    if (routeId === 'OrderItem') {
        return (
            <OrderItem navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </OrderItem>
        )
    }
    //prescription
    if (routeId === 'PrescriptionPage') {
        return (
            <PrescriptionPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </PrescriptionPage>
        )
    }
    if (routeId === 'AddPrescription') {
        return (
            <AddPrescription navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </AddPrescription>
        )
    }
    if (routeId === 'EditPrescription') {
        return (
            <EditPrescription navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </EditPrescription>
        )
    }
    //image
    if (routeId === 'ImagePage') {
        return (
            <ImagePage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </ImagePage>
        )
    }
    if (routeId === 'ViewImage') {
        return (
            <ViewImage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </ViewImage>
        )
    }
    if (routeId === 'AddImage') {
        return (
            <AddImage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </AddImage>
        )
    }
    if (routeId === 'EditImage') {
        return (
            <EditImage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </EditImage>
        )
    }
    //appointment page
    if (routeId === 'AppointmentPage') {
        return (
            <AppointmentPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF' translucent={true}/>
            </AppointmentPage>
        )
    }
    if (routeId === 'AddAppointment') {
        return (
            <AddAppointment navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </AddAppointment>
        )
    }
    //followup page
    if (routeId === 'FollowupPage') {
        return (
            <FollowupPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </FollowupPage>
        )
    }
    if (routeId === 'AddFollowup') {
        return (
            <AddFollowup navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </AddFollowup>
        )
    }


    // frontdesk page
    if (routeId === 'FrontPage') {
        return (
            <FrontPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF' translucent={true}/>
            </FrontPage>
        )
    }


    return (
        <View style={{flex: 1, alignItems: 'stretch', justifyContent: 'center'}}>
            <TouchableOpacity style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
                onPress={() => navigator.pop()}>
                <Text style={{color: 'red', fontWeight: 'bold'}}>No index.js found</Text>
            </TouchableOpacity>
        </View>
    )
}

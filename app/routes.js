'use strict'

import React from 'react'
import {StatusBar, View, Text, TouchableOpacity} from 'react-native'
import SQLite from 'react-native-sqlite-storage'

import SplashPage from './actions/SplashPage'
import VerifyPage from './actions/VerifyPage'
import LoginPage from './actions/LoginPage'
import PersonPage from './actions/PersonPage'
import SearchPage from './actions/SearchPage'

import StepOne from './actions/Splash/StepOne'
import StepTwo from './actions/Splash/StepTwo'
import StepThree from './actions/Splash/StepThree'

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
import PendingOrder from './actions/Labwork/PendingOrder'
import CompletedOrder from './actions/Labwork/CompletedOrder'

import PrescriptionPage from './actions/Prescription/PrescriptionPage'
import AddPrescription from './actions/Prescription/AddPrescription'
import EditPrescription from './actions/Prescription/EditPrescription'

import ImagePage from './actions/Image/ImagePage'
import ViewImage from './actions/Image/ViewImage'
import AddImage from './actions/Image/AddImage'
import EditImage from './actions/Image/EditImage'

import AppointmentPage from './actions/Appointment/AppointmentPage'
import AppointmentPatientPage from './actions/Appointment/AppointmentPatientPage'
import AddAppointment from './actions/Appointment/AddAppointment'
import EditAppointment from './actions/Appointment/EditAppointment'

import FollowupPage from './actions/Followup/FollowupPage'
import AddFollowup from './actions/Followup/AddFollowup'
import EditFollowup from './actions/Followup/EditFollowup'

import UserSettingPage from './actions/User/UserSettingPage'
import EditUserSetting from './actions/User/EditUserSetting'
import UserProfilePage from './actions/User/UserProfilePage'
import EditUserProfile from './actions/User/EditUserProfile'

import DoctorPage from './actions/Doctor/DoctorPage'
import DoctorSharePage from './actions/Doctor/DoctorSharePage'
import AddDoctor from './actions/Doctor/AddDoctor'
import EditDoctor from './actions/Doctor/EditDoctor'
import DoctorProfile from './actions/Doctor/DoctorProfile'

import ReferralPage from './actions/Referral/ReferralPage'

import ExportPage from './actions/Syncing/ExportPage'
import ImportPage from './actions/Syncing/ImportPage'

import Styles from './assets/Styles'

module.exports = (route, navigator, self) => {

    var routeId = route.id

    if (routeId === 'SplashPage') {
        return (
            <SplashPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0,0,0,0)' translucent={true}/>
            </SplashPage>
        )
    }
    if (routeId === 'StepOne') {
        return (
            <StepOne navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0,0,0,0)' translucent={true}/>
            </StepOne>
        )
    }
    if (routeId === 'StepTwo') {
        return (
            <StepTwo navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0,0,0,0)' translucent={true}/>
            </StepTwo>
        )
    }
    if (routeId === 'StepThree') {
        return (
            <StepThree navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0,0,0,0)' translucent={true}/>
            </StepThree>
        )
    }
    if (routeId === 'VerifyPage') {
        return (
            <VerifyPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </VerifyPage>
        )
    }
    if (routeId === 'LoginPage') {
        return (
            <LoginPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0,0,0,0)' translucent={true}/>
            </LoginPage>
        )
    }
    if (routeId === 'SearchPage') {
        return (
            <SearchPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </SearchPage>
        )
    }
    // main page
    if (routeId === 'MainPage') {
        return (
            <MainPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </MainPage>
        )
    }
    // patient page
    if (routeId === 'PatientPage') {
        return (
            <PatientPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0, 0, 0, 0.01)' translucent={true}/>
            </PatientPage>
        )
    }
    if (routeId === 'AddPatient') {
        return (
            <AddPatient navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </AddPatient>
        )
    }
    if (routeId === 'PatientProfile') {
        return (
            <PatientProfile navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0, 0, 0, 0.01)' translucent={true}/>
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
                {/* <StatusBar backgroundColor='#2962FF'/> */}
                <StatusBar backgroundColor='rgba(0, 0, 0, 0.01)' translucent={true}/>
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
    if (routeId === 'PendingOrder') {
        return (
            <PendingOrder navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0, 0, 0, 0.01)' translucent={true}/>
            </PendingOrder>
        )
    }
    if (routeId === 'CompletedOrder') {
        return (
            <CompletedOrder navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0, 0, 0, 0.01)' translucent={true}/>
            </CompletedOrder>
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
                <StatusBar backgroundColor='rgba(0, 0, 0, 0.01)' translucent={true}/>
            </AppointmentPage>
        )
    }
    if (routeId === 'AppointmentPatientPage') {
        return (
            <AppointmentPatientPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0, 0, 0, 0.01)' translucent={true}/>
            </AppointmentPatientPage>
        )
    }
    if (routeId === 'AddAppointment') {
        return (
            <AddAppointment navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </AddAppointment>
        )
    }
    if (routeId === 'EditAppointment') {
        return (
            <EditAppointment navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </EditAppointment>
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
    if (routeId === 'EditFollowup') {
        return (
            <EditFollowup navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </EditFollowup>
        )
    }
   //user profile/setting page
   if (routeId === 'UserSettingPage') {
       return (
           <UserSettingPage navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='rgba(0, 0, 0, 0.01)' translucent={true}/>
           </UserSettingPage>
       )
   }
   if (routeId === 'EditUserSetting') {
       return (
           <EditUserSetting navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='#2962FF'/>
           </EditUserSetting>
       )
   }
   if (routeId === 'UserProfilePage') {
       return (
           <UserProfilePage navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='rgba(0, 0, 0, 0.01)' translucent={true}/>
           </UserProfilePage>
       )
   }
   if (routeId === 'EditUserProfile') {
       return (
           <EditUserProfile navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='#2962FF'/>
           </EditUserProfile>
       )
   }
   // doctors page
   if (routeId === 'DoctorPage') {
       return (
           <DoctorPage navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='rgba(0, 0, 0, 0.01)' translucent={true}/>
           </DoctorPage>
       )
   }
   if (routeId === 'DoctorSharePage') {
       return (
           <DoctorSharePage navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='#2962FF'/>
           </DoctorSharePage>
       )
   }
   if (routeId === 'AddDoctor') {
       return (
           <AddDoctor navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='#2962FF'/>
           </AddDoctor>
       )
   }
   if (routeId === 'EditDoctor') {
       return (
           <EditDoctor navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='#2962FF'/>
           </EditDoctor>
       )
   }
   if (routeId === 'DoctorProfile') {
       return (
           <DoctorProfile navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='#2962FF'/>
           </DoctorProfile>
       )
   }
    // export page
    if (routeId === 'ExportPage') {
        return (
            <ExportPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0, 0, 0, 0)' translucent={true} />
            </ExportPage>
        )
    }
    if (routeId === 'ImportPage') {
        return (
            <ImportPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0, 0, 0, 0)' translucent={true} />
            </ImportPage>
        )
    }
    // frontdesk page
    if (routeId === 'FrontPage') {
        return (
            <FrontPage navigator={navigator} {...route.passProps}>
            </FrontPage>
        )
    }
    // referral page
    if (routeId === 'ReferralPage') {
        return (
            <ReferralPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='rgba(0, 0, 0, 0.01)' translucent={true}/>
            </ReferralPage>
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

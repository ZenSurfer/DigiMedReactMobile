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
import AddDoctor from './actions/Doctor/AddDoctor'
import EditDoctor from './actions/Doctor/EditDoctor'
import DoctorProfile from './actions/Doctor/DoctorProfile'

import ExportPage from './actions/Syncing/ExportPage'

import Styles from './assets/Styles'

module.exports = (route, navigator, self) => {

    var routeId = route.id

    if (routeId === 'SplashPage') {
        return (
            <SplashPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </SplashPage>
        )
    }
    if (routeId === 'LoginPage') {
        return (
            <LoginPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </LoginPage>
        )
    }
    if (routeId === 'SearchPage') {
        return (
            <SearchPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </SearchPage>
        )
    }
    // main page
    if (routeId === 'MainPage') {
        return (
            <MainPage navigator={navigator} {...route.passProps}>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </MainPage>
        )
    }
    // patient page
    if (routeId === 'PatientPage') {
        return (
            <PatientPage navigator={navigator} {...route.passProps}>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </PatientPage>
        )
    }
    if (routeId === 'AddPatient') {
        return (
            <AddPatient navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF' translucent={true}/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </AddPatient>
        )
    }
    if (routeId === 'PatientProfile') {
        return (
            <PatientProfile navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </PatientProfile>
        )
    }
    if (routeId === 'EditPatient') {
        return (
            <EditPatient navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </EditPatient>
        )
    }

    //hped page
    if (routeId === 'AddHPED') {
        return (
            <AddHPED navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </AddHPED>
        )
    }
    if (routeId === 'HPEDPage') {
        return (
            <HPEDPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </HPEDPage>
        )
    }
    if (routeId === 'HPEDInfo') {
        return (
            <HPEDInfo navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </HPEDInfo>
        )
    }
    if (routeId === 'EditHPED') {
        return (
            <EditHPED navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </EditHPED>
        )
    }
    //labwork
    if (routeId === 'OrderItem') {
        return (
            <OrderItem navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </OrderItem>
        )
    }
    if (routeId === 'PendingOrder') {
        return (
            <PendingOrder navigator={navigator} {...route.passProps}>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </PendingOrder>
        )
    }
    if (routeId === 'CompletedOrder') {
        return (
            <CompletedOrder navigator={navigator} {...route.passProps}>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </CompletedOrder>
        )
    }
    //prescription
    if (routeId === 'PrescriptionPage') {
        return (
            <PrescriptionPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </PrescriptionPage>
        )
    }
    if (routeId === 'AddPrescription') {
        return (
            <AddPrescription navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </AddPrescription>
        )
    }
    if (routeId === 'EditPrescription') {
        return (
            <EditPrescription navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </EditPrescription>
        )
    }
    //image
    if (routeId === 'ImagePage') {
        return (
            <ImagePage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </ImagePage>
        )
    }
    if (routeId === 'ViewImage') {
        return (
            <ViewImage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </ViewImage>
        )
    }
    if (routeId === 'AddImage') {
        return (
            <AddImage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </AddImage>
        )
    }
    if (routeId === 'EditImage') {
        return (
            <EditImage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </EditImage>
        )
    }
    //appointment page
    if (routeId === 'AppointmentPage') {
        return (
            <AppointmentPage navigator={navigator} {...route.passProps}>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </AppointmentPage>
        )
    }
    if (routeId === 'AppointmentPatientPage') {
        return (
            <AppointmentPatientPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF' translucent={true}/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </AppointmentPatientPage>
        )
    }
    if (routeId === 'AddAppointment') {
        return (
            <AddAppointment navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </AddAppointment>
        )
    }
    if (routeId === 'EditAppointment') {
        return (
            <EditAppointment navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </EditAppointment>
        )
    }
    //followup page
    if (routeId === 'FollowupPage') {
        return (
            <FollowupPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </FollowupPage>
        )
    }
    if (routeId === 'AddFollowup') {
        return (
            <AddFollowup navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </AddFollowup>
        )
    }
    if (routeId === 'EditFollowup') {
        return (
            <EditFollowup navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
                {(self.state.completed) ? (
                    <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                            <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                        </View>
                    </View>
                    ) : (<View/>)}
            </EditFollowup>
        )
    }
   //user profile/setting page
   if (routeId === 'UserSettingPage') {
       return (
           <UserSettingPage navigator={navigator} {...route.passProps}>
               {(self.state.completed) ? (
                   <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                       <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                           <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                       </View>
                   </View>
                   ) : (<View/>)}
           </UserSettingPage>
       )
   }
   if (routeId === 'EditUserSetting') {
       return (
           <EditUserSetting navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='#2962FF'/>
               {(self.state.completed) ? (
                   <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                       <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                           <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                       </View>
                   </View>
                   ) : (<View/>)}
           </EditUserSetting>
       )
   }
   if (routeId === 'UserProfilePage') {
       return (
           <UserProfilePage navigator={navigator} {...route.passProps}>
               {(self.state.completed) ? (
                   <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                       <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                           <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                       </View>
                   </View>
                   ) : (<View/>)}
           </UserProfilePage>
       )
   }
   if (routeId === 'EditUserProfile') {
       return (
           <EditUserProfile navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='#2962FF'/>
               {(self.state.completed) ? (
                   <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                       <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                           <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                       </View>
                   </View>
                   ) : (<View/>)}
           </EditUserProfile>
       )
   }
   // doctors page
   if (routeId === 'DoctorPage') {
       return (
           <DoctorPage navigator={navigator} {...route.passProps}>
               {(self.state.completed) ? (
                   <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                       <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                           <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                       </View>
                   </View>
                   ) : (<View/>)}
           </DoctorPage>
       )
   }
   if (routeId === 'AddDoctor') {
       return (
           <AddDoctor navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='#2962FF'/>
               {(self.state.completed) ? (
                   <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                       <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                           <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                       </View>
                   </View>
                   ) : (<View/>)}
           </AddDoctor>
       )
   }
   if (routeId === 'EditDoctor') {
       return (
           <EditDoctor navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='#2962FF'/>
               {(self.state.completed) ? (
                   <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                       <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                           <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                       </View>
                   </View>
                   ) : (<View/>)}
           </EditDoctor>
       )
   }
   if (routeId === 'DoctorProfile') {
       return (
           <DoctorProfile navigator={navigator} {...route.passProps}>
               <StatusBar backgroundColor='#2962FF'/>
               {(self.state.completed) ? (
                   <View style={{position: 'absolute', top: 50, flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                       <View style={{backgroundColor: '#FFEB3B',  flex: 1, alignItems: 'stretch', padding: 10}}>
                           <Text style={{textAlign: 'center', fontSize: 10, color: '#424242'}}>New Labwork Order Completed!</Text>
                       </View>
                   </View>
                   ) : (<View/>)}
           </DoctorProfile>
       )
   }
    // export page
    if (routeId === 'ExportPage') {
        return (
            <ExportPage navigator={navigator} {...route.passProps}>
                <StatusBar backgroundColor='#2962FF'/>
            </ExportPage>
        )
    }
    // frontdesk page
    if (routeId === 'FrontPage') {
        return (
            <FrontPage navigator={navigator} {...route.passProps}>
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

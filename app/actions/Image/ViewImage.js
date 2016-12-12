'use strict';

import React, {Component} from 'react'
import {StyleSheet, Text, View, ListView, RefreshControl, Navigator, Dimensions, ToastAndroid, TouchableOpacity, TouchableNativeFeedback, Image, Alert, InteractionManager, ActivityIndicator} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import PhotoView from 'react-native-photo-view'
import RNFS from 'react-native-fs'
import _ from 'lodash'
import Styles from '../../assets/Styles'
import Env from '../../env'
import moment from 'moment'

const {height, width} = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
const EnvInstance = new Env()
const db = EnvInstance.db()

class ViewImage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            imaging: [],
            renderPlaceholderOnly: true,
        }
    }
    componentWillMount() {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM patientImages WHERE id=? AND (deleted_at in (null, 'NULL', '') OR deleted_at is null) ORDER BY created_at DESC LIMIT 1", [this.props.patientImageID], (tx, rs) => {
                db.data = rs.rows
            })
        }, (err) => {
            alert(err.message);
        }, () => {
            var imaging = db.data.item(0);
            if (imaging.image != '')
                RNFS.exists(RNFS.ExternalDirectoryPath+'/patient/'+imaging.image).then((exist) => {
                    if (exist)
                        RNFS.readFile(RNFS.ExternalDirectoryPath+'/patient/'+imaging.image, 'base64').then((rs) => {
                            imaging['image'] =  (rs.toString().indexOf('dataimage/'+imaging.image.split('.').pop()+'base64') !== -1) ? _.replace(rs.toString(), 'dataimage/jpegbase64','data:image/jpeg;base64,') : 'data:image/'+imaging.image.split('.').pop()+';base64,'+rs.toString();
                        })
                })
            this.setState({imaging: imaging})
        })
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({renderPlaceholderOnly: false});
        });
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#212121'}}>
                {(this.state.renderPlaceholderOnly) ? (
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <View style={[Styles.horizontal, {backgroundColor: 'rgba(0,0,0,0.5)'}]}><ActivityIndicator color="#FFFFFF" size={23}/></View>
                    </View>
                ) : (
                    <PhotoView
                        source={{uri: this.state.imaging.image}}
                        minimumZoomScale={1}
                        maximumZoomScale={3}
                        androidScaleType={"fitCenter"}
                        onLoad={() => console.log("Image loaded!")}
                        style={{flex: 1, alignItems: 'stretch', backgroundColor: '#212121'}}/>
                )}
                <View style={{position: 'absolute', bottom: 0, flex: 1, flexDirection: 'row'}}>
                    <View style={{flex: 1, alignItems: 'center', marginBottom: 10}}>
                        <TouchableOpacity
                            style={{padding: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 100}}
                            onPress={() => { this.props.navigator.pop() }}>
                            <Icon name={'close'} color={'#FFF'} size={25}/>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    loading: {
        alignItems: 'center',
        width: width,
    },
    progress: {
        width: width,
    },
})

module.exports = ViewImage;

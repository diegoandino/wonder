import React, { useState, useEffect } from 'react';
import { useInterval } from '../custom_hooks/useInterval';
import MapView from 'react-native-maps';
import { StyleSheet, View, Dimensions, Image } from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Marker } from 'react-native-maps';
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserModal from './UserModal';

const getUser = () => fetch('http://10.100.1.141:3000/get_me').then(res => res.json());
const getUsersInArea = () => fetch('http://10.100.1.141:8080/get_logged_in_users').then(res => res.json());

export default function Map() {
  const[mapRef, setMapRef] = useState(null);
  const[latitude, setLatitude] = useState(0);
  const[longitude, setLongitude] = useState(0);
  const[latitudeDelta, setLatitudeDelta] = useState(0.0922);
  const[longitudeDelta, setLongitudeDelta] = useState(0.0421);
  const[hasLocationPermissions, setHasLocationPermissions] = useState(false);
  const[locationResult, setLocationResult] = useState(null);
  const[user, setUser] = useState(null);
  const[usersInArea, setUsersInArea] = useState();
  const[showModal, setShowModal] = useState(false);
  const[selectedUser, setSelectedUser] = useState(null);
  
  useInterval(async () => {
    console.log('Getting users in area');
    await getUsersInArea().then(data => 
      {
        setUsersInArea(data);
        console.log('Users in area: ', data);
      }
    );
  }, 15000);

  useEffect(() => {
    getUser().then(data => setUser(data));
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Permissions.askAsync(Permissions.LOCATION_FOREGROUND);
      if (status !== 'granted') {
        setLocationResult({
          locationResult: 'Permission to access location was denied',
        });
      }
      else { setHasLocationPermissions(true); }
    
      let location = await Location.getCurrentPositionAsync({});
      setLocationResult(location);
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    })()
  }, []);

  useEffect(() => {
    if (user != null) {
      const username = user.uri.replace('spotify:user:', '');
      fetch('http://10.100.1.141:8080/update_user', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        },
                    body: JSON.stringify({
                            username: username,
                            location: {
                                latitude: latitude,
                                longitude: longitude,
                            },
                            logged_in: true,
                            spotifyProfilePicture: user.images[0].url,
                    })
      }).catch(err => console.log('Fetch Error: ', err));
    }
  }, []);

  return (
    <View style={styles.container}>
      {hasLocationPermissions && locationResult != null && user != null && (
        <MapView
          ref={map => setMapRef(map)}
          moveOnMarkerPress={false}
          provider={MapView.PROVIDER_GOOGLE}
          style={styles.map}
          region={{ latitude: latitude, longitude: longitude, latitudeDelta: latitudeDelta, longitudeDelta: longitudeDelta }}
          onPress={() => showModal ? setShowModal(false) : null}>
            <Marker
              coordinate={{ latitude: latitude, longitude: longitude, latitudeDelta: latitudeDelta, longitudeDelta: longitudeDelta }}
              onPress={() => setShowModal(true)}
            >
              <Image
                source={{uri: user.images[0].url}} 
                style={{width: 64, height: 64, borderRadius: 30}}>
              </Image>
            </Marker>
          {usersInArea != null && JSON.stringify(usersInArea) != '{}' && (usersInArea.map(user => 
            <Marker coordinate={{ latitude: user.location.lat, 
                                  longitude: user.location.lng, 
                                  latitudeDelta: latitudeDelta, 
                                  longitudeDelta: longitudeDelta }}
                    onPress={() => setShowModal(true)}
            >
              <Image
                source={{uri: user.spotifyProfilePicture}} 
                style={{width: 64, height: 64, borderRadius: 30}}>
              </Image>
            </Marker> 
          ))}
          {showModal && <UserModal showModal={true} otherUser={selectedUser}/>}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
"use strict";

import React, { useState, useEffect, useRef } from "react";
import { useInterval } from "../custom_hooks/useInterval";
import MapView from "react-native-maps";
import { StyleSheet, View, Dimensions, Image } from "react-native";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import { Marker } from "react-native-maps";
import UserModal from "./UserModal";
import SelectedUserModal from "./SelectedUserModal";

const getUser = () =>
  fetch("http://10.100.1.141:3000/get_me").then((res) => res.json());
const getUsersInArea = () =>
  fetch("http://10.100.1.141:8080/get_logged_in_users").then((res) =>
    res.json()
  );
const getPlayBackState = () =>
  fetch("http://10.100.1.141:3000/get_current_playing").then((res) =>
    res.json()
  );

export default function Map() {
  const [mapRef, setMapRef] = useState(null);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [hasLocationPermissions, setHasLocationPermissions] = useState(false);
  const [locationResult, setLocationResult] = useState(null);
  const [usersInArea, setUsersInArea] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSelectedUserModal, setShowSelectedUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPlaybackState, setCurrentPlaybackState] = useState(null);

  let user = useRef(null);
  let usersInAreaRef = useRef(null);
  const longitudeDelta = 0.0421;
  const latitudeDelta = 0.0922;

  useInterval(() => {
    const controller = new AbortController();
    fetch("http://10.100.1.141:8080/get_logged_in_users", {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setUsersInArea(data);
        usersInAreaRef.current = data;
        console.log("Users in area count: ", data.length);
      });

    getPlayBackState().then((data) => {
      setCurrentPlaybackState(data);
      console.log("Current playback state: ", data.item.artists[0].name);
    });
    return () => controller.abort();
  }, 10000);

  useInterval(() => {
    getPlayBackState().then((data) => {
      setCurrentPlaybackState(data);
      //console.log('Current playback state: ', data.item.artists[0].name);
    });
  }, 10000);

  // ! get user only when user is null
  /*   let COUNTER = 5000;
  useInterval(async () => {
    if (user == null) await getUser().then((data) => setUser(data));
    else COUNTER = 0;
  }, COUNTER); */

  useEffect(() => {
    if (user.current == null) getUser().then((data) => (user.current = data));
  }, []);

  // * useEffect for location permissions and location set
  useEffect(() => {
    (async () => {
      let { status } = await Permissions.askAsync(
        Permissions.LOCATION_FOREGROUND
      );
      if (status !== "granted") {
        setLocationResult({
          locationResult: "Permission to access location was denied",
        });
      } else {
        setHasLocationPermissions(true);
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocationResult(location);
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    })();
  }, []);

  // * POST user data to server
  useEffect(() => {
    const controller = new AbortController();
    if (user.current != null) {
      const username = user.current.uri.replace("spotify:user:", "");
      fetch("http://10.100.1.141:8080/update_user", {
        signal: controller.signal,
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          location: {
            latitude: latitude,
            longitude: longitude,
          },
          logged_in: true,
          spotifyProfilePicture: user.current.images[0].url,
          currentPlaybackState: currentPlaybackState,
        }),
      })
        .then(() => console.log("User data posted to server"))
        .catch((err) => console.log(""));
    }

    return () => controller.abort();
  }, [currentPlaybackState]);

  return (
    <View style={styles.container}>
      {hasLocationPermissions &&
        locationResult != null &&
        user.current != null && (
          <MapView
            ref={(map) => setMapRef(map)}
            moveOnMarkerPress={false}
            provider={MapView.PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: latitudeDelta,
              longitudeDelta: longitudeDelta,
            }}
            onPress={() =>
              showModal || showSelectedUserModal
                ? (setShowModal(false), setShowSelectedUserModal(false))
                : null
            }
          >
            <Marker
              key={user.current.id}
              coordinate={{
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta,
              }}
              onPress={() => {
                setSelectedUser(user);
                setShowModal(true);
              }}
            >
              <Image
                source={{ uri: user.current.images[0].url }}
                style={{ width: 64, height: 64, borderRadius: 30 }}
              ></Image>
            </Marker>
            {usersInAreaRef.current != null &&
              usersInAreaRef.current
                .filter((u) => u.username != user.current.id)
                .map((u) => (
                  <Marker
                    key={u.username}
                    coordinate={{
                      latitude: u.location.lat,
                      longitude: u.location.lng,
                      latitudeDelta: latitudeDelta,
                      longitudeDelta: longitudeDelta,
                    }}
                    onPress={() => {
                      setShowModal(true);
                      setSelectedUser(u);
                    }}
                  >
                    <Image
                      source={{ uri: u.spotifyProfilePicture }}
                      style={{ width: 64, height: 64, borderRadius: 30 }}
                    ></Image>
                  </Marker>
                ))}
            {showModal && (
              <SelectedUserModal showModal={showModal} user={selectedUser} />
            )}
            {/* {showSelectedUserModal &&
              showModal == false &&
              (console.log("Selected user: ", selectedUser.username),
              (
                <SelectedUserModal
                  showModal={showSelectedUserModal}
                  otherUser={selectedUser}
                />
              ))} */}
          </MapView>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191414",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

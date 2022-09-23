import React, { useState, useEffect } from "react";
import { Modal, ImageBackground, StyleSheet, Text, View, Image, Pressable } from "react-native";
import GestureRecognizer from 'react-native-swipe-gestures';

const getUser = () => fetch('http://10.100.1.141:3000/get_me').then(res => res.json());
const getPlayBackState = () => fetch('http://10.100.1.141:3000/get_current_playing').then(res => res.json());
const playTrack = (uri, track_number, progress_ms) => fetch('http://10.100.1.141:3000/play_track', {
  method: 'PUT',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    },
  body: JSON.stringify({ uri: uri, track_number: track_number, progress_ms: progress_ms })
}).then(res => res.json()).catch(err => console.log('Fetch Error: ', err));

export default UserModal = ({showModal}) => {
    const[currentPlaybackState, setCurrentPlaybackState] = useState(null);
    const[user, setUser] = useState({ data: [] });
    const[modalVisible, setModalVisible] = useState(false);
    const[pointerEvents, setPointerEvents] = useState('auto');

    useEffect(() => {
        getUser().then(data => setUser(data));
        getPlayBackState().then(data => setCurrentPlaybackState(data));
        setModalVisible(showModal);
    }, []);
    
    return (
      <GestureRecognizer
        onSwipeDown={ () => { setModalVisible(false); setPointerEvents('none'); } }
      >
        <View style={styles.centeredView} pointerEvents={pointerEvents}>
            <Text style={styles.textStyle}>Inside</Text>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              coverScreen={false}>
              {currentPlaybackState == null || JSON.stringify(currentPlaybackState) == '{}' ? (
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>Nothing is playing at the moment</Text>
                  <Pressable
                      style={[styles.button, styles.buttonClose]}
                      onPress={() => { setModalVisible(!modalVisible); setPointerEvents('none'); }}
                    >
                    <Text style={styles.textStyle}>Hide</Text>
                  </Pressable>
                </View>
              ) :
              currentPlaybackState != null && user != null && (
                  <View style={styles.modalView}>
                      <Text style={styles.modalTextTitle}>{user.display_name}</Text>
                      <Text style={styles.modalText}>Now Playing: {currentPlaybackState.item.name}</Text>
                      <Image 
                          source={{uri: currentPlaybackState.item.album.images[1].url}} 
                          style={{width: currentPlaybackState.item.album.images[1].width / 2, 
                                  height: currentPlaybackState.item.album.images[1].height / 2}}>
                      </Image>
                      <Text style={styles.modalText}>{currentPlaybackState.item.artists[0].name}</Text>
                      <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => { playTrack(
                          currentPlaybackState.item.album.uri, 
                          currentPlaybackState.item.track_number, 
                          currentPlaybackState.progress_ms, 
                        )}}
                      >
                        <Text style={styles.textStyle}>Listen Along</Text>
                    </Pressable>
                  </View>
              )}
            </Modal>
        </View>
      </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    position: 'relative',
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 20,
    padding: 35,
    alignItems: "left",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
    height: "40%",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: "#F194FF",
    width: "40%",
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#1DB954",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  modalText: {
    marginTop: 5,
    marginBottom: 15,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  modalTextTitle: {
    marginTop: 5,
    marginBottom: 15,
    textAlign: "center",
    color: "#1DB954",
    fontWeight: "bold",
    fontSize: 20,
  },
  image: {
    flex: 1,
    justifyContent: "center"
  },
});
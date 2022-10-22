import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Button,
  Text,
  View,
  Image,
  Pressable,
} from "react-native";

export default SelectedUserModal = ({ showModal }, { selectedUser }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [pointerEvents, setPointerEvents] = useState("auto");

  useEffect(() => {
    setModalVisible(showModal);
  }, []);

  return (
    <View style={styles.centeredView} pointerEvents={pointerEvents}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        coverScreen={false}
      >
        {(selectedUser != null && selectedUser.currentPlaybackState == null) ||
        JSON.stringify(selectedUser.currentPlaybackState) == "{}" ? (
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Nothing is playing at the moment
            </Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setModalVisible(!modalVisible);
                setPointerEvents("none");
              }}
            >
              <Text style={styles.textStyle}>Hide</Text>
            </Pressable>
          </View>
        ) : (
          selectedUser != null && (
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                User: {selectedUser.display_name}
              </Text>
              <Text style={styles.modalText}>
                Now Playing: {selectedUser.currentPlaybackState.item.name}
              </Text>
              <Image
                source={{
                  uri: selectedUser.currentPlaybackState.item.album.images[1]
                    .url,
                }}
                style={{
                  width:
                    selectedUser.currentPlaybackState.item.album.images[1]
                      .width / 2,
                  height:
                    selectedUser.currentPlaybackState.item.album.images[1]
                      .height / 2,
                }}
              ></Image>
              <Text style={styles.modalText}>
                {selectedUser.currentPlaybackState.item.artists[0].name}
              </Text>
              <Button
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  setPointerEvents("none");
                }}
                title="Hide Modal"
              ></Button>
            </View>
          )
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "#191414",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
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
    marginBottom: 15,
    textAlign: "center",
    color: "white",
  },
});

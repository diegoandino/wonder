import { useEffect, useState } from "react";
import { StyleSheet, View, Pressable, Text, Image, ActivityIndicator } from "react-native";
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CLIENT_ID, CLIENT_SECRET } from "@env"

const scopes = [
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-read-email',
    'user-read-private',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-modify-playback-state',
];

const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const getUser = () => fetch('http://10.100.1.141:3000/get_me').then(res => res.json());

export default function Login({ navigation }) {
    const[user, setUser] = useState(null);
    const [req, res, promptAsync] = useAuthRequest({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        scopes: scopes,
        usePKCE: false,
        redirectUri: makeRedirectUri({ scheme: 'com.diegoandino.wonder' }),
    }, discovery);
    
    let loggedIn = false;
    useEffect(() => {
        if (res?.type === 'success') {
            loggedIn = true;
            const data = res.params;
            setStoreCode(data['code']);
            // Send code to server to later get access token
            fetch('http://10.100.1.141:3000/code', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    },
                body: JSON.stringify({ code: data['code'] })
            }).catch(err => console.log('Fetch Error: ', err));
            navigation.navigate('Map');
        }
    }, [res]);

    useEffect(() => {
        getUser().then(data => setUser(data));
    }, []);

    useEffect(() => {
        // Make a post request to server to /login to add user to database
        if (user != null) {
            const username = user.uri.replace('spotify:user:', '');
            setStoreUsername(username);
            fetch('http://10.100.1.141:8080/login', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        },
                    body: JSON.stringify({
                            username: username,
                            location: {
                                latitude: 0,
                                longitude: 0,
                            },
                            logged_in: loggedIn,
                            spotifyProfilePicture: user.images[0].url,
                        })
            }).catch(err => console.log('Fetch Error: ', err));
        }
    });
    
    const setStoreCode = async (code) => {
        try {
          await AsyncStorage.setItem('@code', code)
        } catch (e) {
          console.log('Error: ', e)
        }
    }

    const setStoreUsername = async (username) => {
        try {
            await AsyncStorage.setItem('@username', username)
        } catch (e) {
            console.log('Error: ', e)
        }
    }

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/Wonder.png')}
                style={{width: 350, height: 350, borderRadius: 30}}>
            </Image>
            <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={ () => promptAsync() }>
                <Text style={styles.textStyle}>Login With Spotify</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 16,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        backgroundColor: "#F194FF",
        width: "40%",
    },
    buttonClose: {
        backgroundColor: "#1DB954",
    },
    textStyleTitle: {
        paddingBottom: "5%",
        fontSize: 40,
    },
});
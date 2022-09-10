import { useEffect, useState } from "react";
import { StyleSheet, View, Button } from "react-native";
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserModal from "./UserModal";

const scopes = [
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-read-email',
    'user-read-private',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
];

const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const getUser = () => fetch('http://10.100.1.141:3000/get_me').then(res => res.json());

export default function Login({ navigation }) {
    const[user, setUser] = useState(null);
    const [req, res, promptAsync] = useAuthRequest({
        clientId: 'ebd339cf6bc9490cb2513694d338c0c8',
        clientSecret: 'be387a78301d46f98b4ca6b937db61c0',
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
            <Button title="Login With Spotify" onPress={ () => promptAsync() }></Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    }
});
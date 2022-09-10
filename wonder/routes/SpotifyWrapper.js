import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

export default class SpotifyWrapper {
  constructor() {  }

  // -- API Calls Below --
  getMe = () => {
    try {
      fetch('http://10.100.1.141:3000/get_me').then(res => res.json());
    }
    catch(e) {
      console.log('Error getting me: ', e);
    }
  }

  getCurrentUserPlaylists = async () => {
      return await spotifyApi.getUserPlaylists();
  }

  getCurrentPlayingTrack = async () => {
      return await spotifyApi.getMyCurrentPlayingTrack();
  }
}
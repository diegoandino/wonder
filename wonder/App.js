import React, { Component } from 'react';
import Map from './components/Map';
import Login from './components/Login';
import { View, StyleSheet } from 'react-native';
import Navigator from './routes/HomeStack';

export default function App () {
  return (
    Navigator()
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
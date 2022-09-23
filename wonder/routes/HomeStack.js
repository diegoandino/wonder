import React from 'react';
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from "../components/Login";
import Map from "../components/Map";

const Stack = createNativeStackNavigator();
export default function Navigator() {
    return (
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator>
          <Stack.Screen options={({route}) => (
            {
              headerShadowVisible: false,
              headerShown: false,
            }
          )} name='Login' component={Login} />
          <Stack.Screen name='Map' component={Map} />
        </Stack.Navigator>
      </NavigationContainer>
    );
}

const MyTheme = {
  dark: true,
  colors: {
    primary: 'rgb(29, 185, 84)',
    background: 'rgb(0, 0, 0)',
    card: 'rgb(0, 0, 0)',
    text: 'rgb(29, 185, 84)',
    border: 'rgb(0, 0, 0)',
    notification: 'rgb(25, 20, 20)',
  },
};
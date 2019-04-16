/**
 * All the screens will be registered in this file
 * @format
 * @flow
 */
import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { Router, Scene, Stack } from "react-native-router-flux";
import LoginScreen from '../Components/SignIn';
import ShowMap from "../Components/Map";


export default class ScreenCollection extends Component {
  render() {
    return (
      <Router>
        <Stack key="root">
          <Scene
            key="login"
            component={LoginScreen}
            initial={true}
            hideNavBar={true}
          />
          <Scene 
            key="map"
            component={ShowMap}
            title="Map"
            hideNavBar={true}
          />
        </Stack>
      </Router>
    );
  }
}
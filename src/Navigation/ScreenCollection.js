/**
 * All the screens will be registered in this file
 * @format
 * @flow
 */
import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { Router, Scene, Stack } from "react-native-router-flux";
import LoginScreen from "../Components/SignIn";
import ShowMap from "../Components/Map";
import AsyncStorage from "@react-native-community/async-storage";

export default class ScreenCollection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogin: true,
      isHome: false
    };

    this.checkLoggedIn = this.checkLoggedIn.bind(this);
  }

  async checkLoggedIn() {
    try {
      token = await AsyncStorage.getItem('@userToken')
      console.log("from main scene", token)
      if (token) {
        this.setState({
          isLogin: false,
          isHome: true
        })
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  componentWillMount() {
    this.checkLoggedIn();
  }
  render() {
    return (
      <Router>
        <Stack key="root">
          <Scene
            key="login"
            component={LoginScreen}
            initial={this.state.isLogin}
            hideNavBar={true}
          />
          <Scene key="map" initial={this.state.isHome} component={ShowMap} title="Map" hideNavBar={true} />
        </Stack>
      </Router>
    );
  }
}

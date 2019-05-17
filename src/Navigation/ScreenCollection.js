/**
 * All the screens will be registered in this file
 * @format
 * @flow
 */
import React, { Component } from "react";
import { Router, Scene, Stack, ActionConst } from "react-native-router-flux";
import LoginScreen from "../Components/SignIn";
import ShowMap from "../Components/Map";
import AsyncStorage from "@react-native-community/async-storage";

AsyncStorage.clear();
export default class ScreenCollection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogin: true,
      isHome: false
    };

    this.checkLoggedIn = this.checkLoggedIn.bind(this);
  }

  /* Check if the user is logged in or not by checking the stored token */
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
          <Scene key="map"
            initial={this.state.isHome}
            component={ShowMap}
            title="EasyGo- Your Smart Movement Companion"
            hideNavBar={true}
            back={true}
            type={ActionConst.REPLACE}
          />
        </Stack>
      </Router>
    );
  }
}

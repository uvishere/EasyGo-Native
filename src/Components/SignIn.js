"use strict";


import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Dimensions,
  LayoutAnimation,
  UIManager,
  KeyboardAvoidingView,
  ToastAndroid
} from "react-native";
import { Input, Button, Icon } from "react-native-elements";
import { Actions } from "react-native-router-flux";
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import BG_IMAGE from "../../assets/images/eg-login-bg.jpg"
// Get the device screen Height and Width
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

//API Calls
const SIGNUP_API = "http://easygo.codeshala.com/user";
const LOGIN_API = "http://easygo.codeshala.com/user/login";

// Login Page Background Image
// const BG_IMAGE = require("../../assets/images/eg-login-bg.jpg");

// Default Axios Configs
const config = {
  headers: { 'Content-Type': 'application/json' },
  responseType: 'json'
};


// Enable LayoutAnimation on Android
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);


const TabSelector = ({ selected }) => {
  return (
    <View style={styles.selectorContainer}>
      <View style={selected && styles.selected} />
    </View>
  );
};

TabSelector.propTypes = {
  selected: PropTypes.bool.isRequired
};


export default class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      email: "",
      password: "",
      fontLoaded: false,
      selectedCategory: 0,
      isLoading: false,
      isEmailValid: true,
      isPasswordValid: true,
      isConfirmationValid: true
    };

    this.selectCategory = this.selectCategory.bind(this);
    this.setToken = this.setToken.bind(this);
    this.login = this.login.bind(this);
    this.signUp = this.signUp.bind(this);
    this.ShowMap = this.ShowMap.bind(this);
  }


  async componentDidMount() {
    this.setState({ fontLoaded: true });
  }


  selectCategory(selectedCategory) {
    LayoutAnimation.easeInEaseOut();
    this.setState({
      selectedCategory,
      isLoading: false
    });
  }

  // Email Validation
  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(email);
  }

  // Navigation function to display map
  ShowMap(params) {
    Actions.pop();
    return Actions.replace(map, params);
  }

  //Store the token into AsyncStorage
  async setToken(token) {
    try {
      console.log('you are here')
      await AsyncStorage.setItem('@userToken', token);
      console.log("Key Stored Successfully as UserToken:", token)
    } catch (err) {
      console.log("error in setting AsyncStorage key", err);
    }
  }

  // Login using email and password and redirect to the map page
  async login() {
    const { email, password } = this.state;
    this.setState({ isLoading: true });
    // Simulate an API call

    //Create the Payload
    const userPayload = { email, password };

    try {
      console.log('You are about to call login api');
      const userResponse = await axios.post(LOGIN_API, userPayload, config);
      this.setToken(userResponse.data.token)
      
      this.ShowMap(userResponse.data.verifiedUser);

    } catch (err) {
      ToastAndroid.show("Login Attempt Failed, please try again",ToastAndroid.SHORT)
      console.log(err)
    }
    

    //Use it later
    setTimeout(() => {
      LayoutAnimation.easeInEaseOut();
      this.setState({
        isLoading: false,
        isEmailValid: this.validateEmail(email) || this.emailInput.shake(),
        isPasswordValid: password.length >= 8 || this.passwordInput.shake()
      });
    }, 1000);
  }


  // Signup using name, email and password and redirect to the map page
  async signUp() {
    const { name, email, password, passwordConfirmation } = this.state;
    this.setState({ isLoading: true });

    // Simulate an API call

    //Create the Payload
    const userPayload = { name, email, password };
    try {
      const userResponse = await axios.post(SIGNUP_API, userPayload, config);
      this.setToken(userResponse.data.token)
      
      // Load Map Screen
      this.ShowMap(userResponse.data.verifiedUser);

    } catch (err) {
      console.log(err)
    }

    setTimeout(() => {
      LayoutAnimation.easeInEaseOut();
      this.setState({
        isLoading: false,
        isEmailValid: this.validateEmail(email) || this.emailInput.shake(),
        isPasswordValid: password.length >= 8 || this.passwordInput.shake()
        
      });
    }, 1000);
  }

  // Main Render
  render() {
    const {
      name,
      selectedCategory,
      isLoading,
      isEmailValid,
      isPasswordValid,
      isConfirmationValid,
      email,
      password,
      passwordConfirmation
    } = this.state;
    const isLoginPage = selectedCategory === 0;
    const isSignUpPage = selectedCategory === 1;
    return (
      <View style={styles.container}>
        <ImageBackground source={BG_IMAGE} style={styles.bgImage}>
          {this.state.fontLoaded ? (
            <View>
              <KeyboardAvoidingView
                contentContainerStyle={styles.loginContainer}
                behavior="position"
              >
                <View style={styles.titleContainer}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.titleText}>EasyGo</Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.subtitleText}>For Everyone</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Button
                    disabled={isLoading}
                    type="clear"
                    activeOpacity={0.5}
                    titleStyle={[
                      styles.categoryText,
                      isSignUpPage && styles.selectedCategoryText
                    ]}
                    title={"Launch Map"}
                    onPress={() => this.ShowMap()}
                  />
                  <Button
                    disabled={isLoading}
                    type="clear"
                    activeOpacity={0.5}
                    onPress={() => this.selectCategory(0)}
                    containerStyle={{ flex: 1 }}
                    titleStyle={[
                      styles.categoryText,
                      isLoginPage && styles.selectedCategoryText
                    ]}
                    title={"Login"}
                  />
                  <Button
                    disabled={isLoading}
                    type="clear"
                    activeOpacity={0.7}
                    onPress={() => this.selectCategory(1)}
                    containerStyle={{ flex: 1 }}
                    titleStyle={[
                      styles.categoryText,
                      isSignUpPage && styles.selectedCategoryText
                    ]}
                    title={"Sign up"}
                  />
                </View>
                <View style={styles.rowSelector}>
                  <TabSelector selected={isLoginPage} />
                  <TabSelector selected={isSignUpPage} />
                </View>
                <View style={styles.formContainer}>
                  {isSignUpPage && (
                    <Input
                      leftIcon={
                        <Icon
                          name="user-o"
                          type="font-awesome"
                          color="rgba(0, 0, 0, 0.38)"
                          size={25}
                          style={{ backgroundColor: "transparent" }}
                        />
                      }
                      value={name}
                      keyboardAppearance="light"
                      autoFocus={false}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      inputStyle={{ marginLeft: 10 }}
                      placeholder={"Name"}
                      containerStyle={{
                        borderBottomColor: "rgba(0, 0, 0, 0.38)"
                      }}
                      ref={input => (this.emailInput = input)}
                      onSubmitEditing={() => this.emailInput.focus()}
                      onChangeText={name => this.setState({ name })}
                      errorMessage={
                        isEmailValid
                          ? null
                          : "Please enter a valid email address"
                      }
                    />
                  )}
                  <Input
                    leftIcon={
                      <Icon
                        name="envelope-o"
                        type="font-awesome"
                        color="rgba(0, 0, 0, 0.38)"
                        size={25}
                        style={{ backgroundColor: "transparent" }}
                      />
                    }
                    value={email}
                    keyboardAppearance="light"
                    autoFocus={false}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    inputStyle={{ marginLeft: 10 }}
                    placeholder={"Email"}
                    containerStyle={{
                      borderBottomColor: "rgba(0, 0, 0, 0.38)"
                    }}
                    ref={input => (this.emailInput = input)}
                    onSubmitEditing={() => this.passwordInput.focus()}
                    onChangeText={email => this.setState({ email })}
                    errorMessage={
                      isEmailValid ? null : "Please enter a valid email address"
                    }
                  />
                  <Input
                    leftIcon={
                      <Icon
                        name="lock"
                        type="simple-line-icon"
                        color="rgba(0, 0, 0, 0.38)"
                        size={25}
                        style={{ backgroundColor: "transparent" }}
                      />
                    }
                    value={password}
                    keyboardAppearance="light"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                    returnKeyType={isSignUpPage ? "next" : "done"}
                    blurOnSubmit={true}
                    containerStyle={{
                      marginTop: 16,
                      borderBottomColor: "rgba(0, 0, 0, 0.38)"
                    }}
                    inputStyle={{ marginLeft: 10 }}
                    placeholder={"Password"}
                    ref={input => (this.passwordInput = input)}
                    onSubmitEditing={() =>
                      isSignUpPage
                        ? this.confirmationInput.focus()
                        : this.login()
                    }
                    onChangeText={password => this.setState({ password })}
                    errorMessage={
                      isPasswordValid
                        ? null
                        : "Please enter at least 8 characters"
                    }
                  />
                  <Button
                    buttonStyle={styles.loginButton}
                    containerStyle={{ marginTop: 32, flex: 0 }}
                    activeOpacity={0.8}
                    title={isLoginPage ? "LOGIN" : "SIGN UP"}
                    onPress={isLoginPage ? this.login : this.signUp}
                    titleStyle={styles.loginTextButton}
                    loading={isLoading}
                    disabled={isLoading}
                  />
                </View>
              </KeyboardAvoidingView>
              <View style={styles.helpContainer}>
                <Button
                  title={"Need help ?"}
                  titleStyle={{ color: "white" }}
                  buttonStyle={{ backgroundColor: "transparent" }}
                  underlayColor="transparent"
                  onPress={() => console.log("Account created")}
                />
              </View>
            </View>
          ) : (
              <Text>Loading...</Text>
            )}
        </ImageBackground>
      </View>
    );
  }
}


// Style Definitions
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  rowSelector: {
    height: 20,
    flexDirection: "row",
    alignItems: "center"
  },
  selectorContainer: {
    flex: 1,
    alignItems: "center"
  },
  selected: {
    position: "absolute",
    borderRadius: 50,
    height: 0,
    width: 0,
    top: -5,
    borderRightWidth: 70,
    borderBottomWidth: 70,
    borderColor: "white",
    backgroundColor: "white",
    opacity: 0.8,
  },
  loginContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  loginTextButton: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold"
  },
  loginButton: {
    backgroundColor: "rgba(232, 147, 142, 1)",
    borderRadius: 10,
    height: 50,
    width: 200
  },
  titleContainer: {
    height: 150,
    backgroundColor: "transparent",
    justifyContent: "center"
  },
  formContainer: {
    backgroundColor: "white",
    width: SCREEN_WIDTH - 30,
    borderRadius: 10,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: "center",
    opacity: 0.8
  },
  loginText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white"
  },
  bgImage: {
    flex: 1,
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  categoryText: {
    textAlign: "center",
    color: "white",
    fontSize: 24,
    fontFamily: "light",
    backgroundColor: "transparent",
    opacity: 0.54
  },
  selectedCategoryText: {
    opacity: 1
  },
  titleText: {
    color: "white",
    fontSize: 30,
    fontFamily: "regular"
  },
  subtitleText: {
    color: "white",
    fontSize: 20,
    fontFamily: "regular",
    marginTop: 5
  },
  helpContainer: {
    height: 64,
    alignItems: "center",
    justifyContent: "center"
  }
});
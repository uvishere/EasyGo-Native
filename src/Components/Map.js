"use strict";

import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableHighlight,
  Alert, 
  TouchableOpacity, 
  ToastAndroid
} from "react-native";
import MapboxGL from "@mapbox/react-native-mapbox-gl";
import Permissions from "react-native-permissions";
import { Icon, SearchBar } from "react-native-elements";
import Radar from "react-native-radar";
import Modal from "react-native-modal";

// Define Mapbox Token
const MAPBOX_ACCESS_TOKEN =  "pk.eyJ1IjoidXZpc2hlcmUiLCJhIjoiY2pleHBjOWtjMTZidTJ3bWoza3dlZmIxZiJ9.HvLEBmq44mUfdgT7-C73Jg";

// Add Mapbox Token to Mapbox Library
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default class ShowMap extends Component {
  constructor(props) {
    super(props);

    //Define default states for this component
    this.state = {
      styleURL: "mapbox://styles/uvishere/cjgz9ao04000f2snu34b9j4jj",
      locationPermission: "undetermined",
      showLocation: false,
      longitude: 130.8694928,
      latitude: -12.3713568,
      search: "",
      modalVisible: false
    };

    //Bind the component functions
    this.getLocationPermission = this.getLocationPermission.bind(this);
    // this.setLocationPermission = this.setLocationPermission.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.askLocation = this.askLocation.bind(this);
  }

  // Request permission to access location
  getLocationPermission = () => {
    Radar.getPermissionsStatus()
      .then(status => {
        // do something with status
        console.log("Location permission from radar", status);

        // Request for location Peromission
        if (status !== "GRANTED") {
          Radar.requestPermissions(true)
        }
      })
      .then(res => this.updateLocation())
      .catch(e => {
        console.log(e);
      });
  };

  //Update Location
  updateLocation = () => {
    Radar.trackOnce()
      .then(result => {
        // do something with result.location, result.events, result.user.geofences
        console.log("Radar location: ", result);
        this.setState({
          longitude: result.location.longitude,
          latitude: result.location.latitude
        });
      })
      .catch(err => {
        // optionally, do something with err
        console.log(err);
      });
  };

  askLocation = async () => {
    const isGranted = await MapboxGL.requestAndroidLocationPermissions();
    if (isGranted) {
      this.setState({ showLocation: isGranted });
    }
    else {
      ToastAndroid.showWithGravity('Location access Denied!! :(', ToastAndroid.SHORT, ToastAndroid.CENTER )
    }
  } 


  //Update Search
  updateSearch = value => {
    this.setState({ search: value });
  };

  //set the visibility of Barrier Modal
  _toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible }); 
  }

  componentWillMount() {
    //Fetch All the Points here
    this.askLocation();
  }

  async componentDidMount() {
    console.log("ShowMap Component Mounted");

    // this.getLocationPermission();
    // this.updateLocation();
  }

  //Rendering Main Component
  render() {
    // Extract the state variables
    const { search, longitude, latitude, showLocation, styleURL } = this.state;
    const coords = [longitude, latitude];
    console.log(coords);

    return (
      <View style={styles.container}>
        <View>
        <Modal isVisible={this.state.modalVisible}>
          <View style={{ flex: 1, backgroundColor:"#ddd" }}>
            <Text>Hello!</Text>
            <TouchableOpacity onPress={this._toggleModal}>
              <Text>Hide me!</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
        <SearchBar
          platform="android"
          placeholder="Where are you going today..."
          onChangeText={this.updateSearch}
          value={search}
          containerStyle={styles.searchContainer}
        />

        <MapboxGL.MapView
          showUserLocation={showLocation}
          zoomLevel={16}
          userTrackingMode={MapboxGL.UserTrackingModes.Follow}
          styleURL={styleURL}
          centerCoordinate={coords}
          style={styles.container}
        />

        <View style={styles.gpsButton}>
          <Icon
            raised
            reverse={true}
            name="ios-add-circle"
            type="ionicon"
            color="#4150E8"
            size={30}
            onPress={() => this._toggleModal}
          />
          <Icon
            raised
            reverse={true}
            name="ios-locate"
            type="ionicon"
            color="#f50"
            size={30}
            onPress={() => this.askLocation()}
          />
        </View>
      </View>
    );
  }
}

// Component style definitions
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent"
  },
  gpsButton: {
    bottom: 10,
    right: 10,
    position: "absolute",
    backgroundColor: "transparent",
    justifyContent: "center"
  },
  searchContainer: {
    backgroundColor: "#fff",
    borderBottomColor: "#ddd"
  },
  inputBox: {
    fontSize: 5
  }
});

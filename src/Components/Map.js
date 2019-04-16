"use strict";

import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import MapboxGL from "@mapbox/react-native-mapbox-gl";
import Permissions from "react-native-permissions";
import { Icon, SearchBar } from "react-native-elements";

// Define Mapbox Token
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoidXZpc2hlcmUiLCJhIjoiY2pleHBjOWtjMTZidTJ3bWoza3dlZmIxZiJ9.HvLEBmq44mUfdgT7-C73Jg";

// Add Mapbox Token to Mapbox Library
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default class ShowMap extends Component {
  constructor(props) {
    super(props);

    //Define default states for this component
    this.state = {
      styleURL: "mapbox://styles/uvishere/cjgz9ao04000f2snu34b9j4jj",
      locationPermission: "undetermined",
      showLocation: true,
      coords: [130.8694928, -12.3713568],
      search: ""
    };
    this.requestPermission = this.requestPermission.bind(this);
  }

  // Request permission to access location
  requestPermission = () => {
    Permissions.request("location").then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({ locationPermission: response });
      console.log(
        "Premisstion request response:",
        this.state.locationPermission
      );
    });
  };

  //Update Search
  updateSearch = value => {
    this.setState({ search: value });
  };

  componentWillMount() {
    //Fetch All the Points here
  }

  componentDidMount() {
    console.log("ShowMap Component Mounted");
    Permissions.check("location").then(response => {
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      console.log("Location Permission Response: " + response);
      response != "authorized"
        ? this.requestPermission()
        : this.setState({ showlocation: true });
      this.setState({ locationPermission: response });
    });
  }

  //Rendering Main Component
  render() {
    const { search, showLocation, styleURL } = this.state;

    return (
      <View style={styles.container}>
        <SearchBar
          platform="android"
          placeholder="Where are you going..."
          onChangeText={this.updateSearch}
          value={search}
          containerStyle={styles.searchContainer}
          showLoading={false}
        />
        <MapboxGL.MapView
          showUserLocation={showLocation}
          zoomLevel={16}
          userTrackingMode={MapboxGL.UserTrackingModes.Follow}
          styleURL={styleURL}
          centerCoordinate={this.state.coords}
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
            onPress={() => console.log("Add Barrier icon pressed")}
          />
          <Icon
            raised
            reverse={true}
            name="ios-locate"
            type="ionicon"
            color="#f50"
            size={30}
            onPress={() => console.log("gps icon pressed")}
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
    backgroundColor: "transparent",
    padding: 10
  }
});

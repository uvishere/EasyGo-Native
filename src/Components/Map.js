"use strict";

import React, { Component } from "react";
import { View, StyleSheet, ToastAndroid } from "react-native";
import MapboxGL from "@mapbox/react-native-mapbox-gl";
import { Icon, SearchBar, Input, Text, Rating } from "react-native-elements";
import { MaterialDialog } from "react-native-material-dialog";
import config from "../Utils/config";
import RadioForm from 'react-native-simple-radio-button';

// Define Mapbox Token
const MAPBOX_ACCESS_TOKEN = config.getMapboxKey();

// Add Mapbox Token to Mapbox Library
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);


const type_props = [
  { label: 'toilet', value: 'toilet' },
  {label: 'parking', value: 'parking'},
  {label: 'gaps', value: 'gaps'},
  {label: 'crossings', value: 'crossings'},
  {label: 'obstructions', value: 'obstructions'},
  {label: 'pathways', value: 'pathways'},
]
export default class ShowMap extends Component {
  constructor(props) {
    super(props);

    //Define default states for this component
    this.state = {
      styleURL: "mapbox://styles/uvishere/cjgz9ao04000f2snu34b9j4jj",
      locationPermission: "undetermined",
      showLocation: false,
      centerCoords: [0, 0],
      longitude: 130.8694928,
      latitude: -12.3713568,
      search: "",
      modalVisible: false,
      typeValue: ""
    };

    

    //Bind the component functions
    // this.updateLocation = this.updateLocation.bind(this);
    this.askLocation = this.askLocation.bind(this);
    this._toggleModal = this._toggleModal.bind(this);
  }

  // Ask for Location Permission **USES MAPBOX API
  askLocation = async () => {
    const isGranted = await MapboxGL.requestAndroidLocationPermissions();
    if (isGranted) {
      const centervalue = await this._map.getCenter();
      console.log("MyLocation", centervalue);
      this.setState({ showLocation: isGranted, centerCoords: centervalue });
    } else {
      ToastAndroid.showWithGravity(
        "Location access Denied!! :(",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    }
  };

  //Update Search
  updateSearch = value => {
    this.setState({ search: value });
  };

  //set the visibility of Barrier Modal
  _toggleModal = () => {
    console.log("is Modal Visible?", this.state.modalVisible);
    this.setState({ modalVisible: !this.state.modalVisible });
  };

  componentWillMount() {
    //Fetch All the Points here
    this.askLocation();
  }

  async componentDidMount() {
    console.log("ShowMap Component Mounted");
    console.log("is Modal Visible?", this.state.modalVisible);
    // this.getLocationPermission();
    // this.updateLocation();
  }

  //Rendering Main Component
  render() {
    // Extract the state variables
    const {
      centerCoords,
      search,
      longitude,
      latitude,
      showLocation,
      styleURL
    } = this.state;

    return (
      <View style={styles.container}>
        <View />
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
          centerCoordinate={this.state.centerCoords}
          style={styles.container}
          ref={c => (this._map = c)}
          onRegionDidChange={this.onRegionDidChange}
        />

        <View style={styles.gpsButton}>
          <Icon
            raised
            reverse={true}
            name="ios-add-circle"
            type="ionicon"
            color="#4150E8"
            size={30}
            onPress={() => this._toggleModal()}
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

        <MaterialDialog
          title="Add a New Barrier"
          visible={this.state.modalVisible}
          onOk={() => this.setState({ modalVisible: false })}
          onCancel={() => this.setState({ modalVisible: false })}
        >
          <View>
            <Text>Barrier Type</Text>
            <RadioForm radio_props={type_props} initial={0} onPress={value => {this.setState({typeValue:value})}} />
            <Text>Co-Ordinates</Text>
            
            <Input
              placeholder="Co ordinates"
            />
            <Text>Description</Text>
            <Input
              placeholder="Barrier Description"
            />
            <Text>Image</Text>
            <Input
              placeholder="Open Camera"
            />
            <Text>Rating</Text>
            <Rating
              style={{ paddingVertical: 10 }}
              showRating
            />
          </View>
        </MaterialDialog>
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
  },
  dialogText: {
    fontSize: 12
  }
});

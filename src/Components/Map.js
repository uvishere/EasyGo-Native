"use strict";

import React, { Component } from "react";
import { View, StyleSheet, ToastAndroid, PixelRatio, Platform } from "react-native";
import MapboxGL from "@mapbox/react-native-mapbox-gl";
import {
  Icon,
  SearchBar,
  Input,
  Text,
  Rating,
  Button
} from "react-native-elements";
import { MaterialDialog } from "react-native-material-dialog";
import config from "../Utils/config";
import CurrentLocation from './CurrentLocation';
import Directions from './Directions';
import bbox from '@turf/bbox';

import RadioForm from "react-native-simple-radio-button";
import toiletIcon from "../../assets/images/toilet-icon.png";

// Define Mapbox Token
const MAPBOX_ACCESS_TOKEN = config.getMapboxKey();

// Add Mapbox Token to Mapbox Library
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const type_props = [
  { label: "toilet", value: "toilet" },
  { label: "parking", value: "parking" },
  { label: "gaps", value: "gaps" },
  { label: "crossings", value: "crossings" },
  { label: "obstructions", value: "obstructions" },
  { label: "pathways", value: "pathways" }
];


const IS_ANDROID = Platform.OS === 'android';
const BOUNDS_PADDING_SIDE = IS_ANDROID ? PixelRatio.getPixelSizeForLayoutSize(60) : 60;
const BOUNDS_PADDING_BOTTOM = IS_ANDROID ? PixelRatio.getPixelSizeForLayoutSize(206) : 206;
export default class ShowMap extends Component {
  constructor(props) {
    super(props);

    //Define default states for this component
    this.state = {
      styleURL: "mapbox://styles/uvishere/cjgz9ao04000f2snu34b9j4jj",
      locationPermission: "undetermined",
      centerCoords: [0, 0],
      longitude: 130.8694928,
      latitude: -12.3713666,
      search: "",
      modalVisible: false,
      typeValue: type_props[0].value,
      barrierDesc: "",
      pointBarrierVisible: false,
      featureCollection: MapboxGL.geoUtils.makeFeatureCollection(),
      origin: [130.851761,-12.375846],
      destination: [130.852405, -12.376862],
      fakeCenter: [130.852454,-12.374835]
    };

    //Bind the component functions
    this.updateSearch = this.updateSearch.bind(this);
    this.askLocation = this.askLocation.bind(this);
    this._toggleModal = this._toggleModal.bind(this);
    this.onSubmitBarrier = this.onSubmitBarrier.bind(this);
    this.updateUserLocation = this.updateUserLocation.bind(this);
    this.updateBarrierDesc = this.updateBarrierDesc.bind(this);
    this.onSourceLayerPress = this.onSourceLayerPress.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);
    this.onDirectionsFetched = this.onDirectionsFetched.bind(this);
  }

  onDirectionsFetched (directions) {
    if (!this.state.isChangeFromPress) {
      this.fitBounds(directions);
    }
  }

  fitBounds (directions) {
    const boundingBox = bbox(
      MapboxGL.geoUtils.makeFeature(directions.geometry),
    );

    const padding = [
      BOUNDS_PADDING_BOTTOM,
      BOUNDS_PADDING_SIDE,
      BOUNDS_PADDING_BOTTOM,
      BOUNDS_PADDING_SIDE,
    ];
    this._map.fitBounds([boundingBox[2], boundingBox[3]], [boundingBox[0], boundingBox[1]], padding, 200);
  }

  onLocationChange (coord) {
    this.setState({ origin: coord });
  }

  get directionsStyle () {
    return {
      lineColor: '#987DDF',
    };
  }

  // Ask for Location Permission **USES MAPBOX API
  async askLocation() {
    const isGranted = await MapboxGL.requestAndroidLocationPermissions();
    if (isGranted) {
      ToastAndroid.showWithGravity(
        "Please wait while we update your current location...",
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log("position", position);
          const { longitude, latitude } = position.coords;
          console.log(longitude, latitude);
          ToastAndroid.showWithGravity(
            "Thank you, your location has been updated",
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
          this.setState({
            centerCoords: [longitude, latitude]
          });
        },
        error => {
          console.log(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1 }
      )
    } else {
      ToastAndroid.showWithGravity(
        "Location access Denied!! :(",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      )
    }
  }

  //Update the userlocation
  async updateUserLocation(location) {
    this.setState({
      timestamp: location.timestamp,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      centerCoords: location.centerCoords
    });
  }


  // handler to function after a barrier is added.
  async onSubmitBarrier() {
    const newGeoPoint = {
      coordinates: [this.state.longitude, this.state.latitude],
      type: "Point"
    };
    const properties = {
      feature_type: this.state.typeValue,
      description: this.state.barrierDesc
    };
    console.log(newGeoPoint);
    const feature = MapboxGL.geoUtils.makeFeature(newGeoPoint, properties);
    feature.id = `${Date.now()}`;
    feature.feature_type = this.state.typeValue;
    feature.description = this.state.barrierDesc;

    console.log(feature);
    this.setState({
      featureCollection: MapboxGL.geoUtils.addToFeatureCollection(
        this.state.featureCollection,
        feature
      )
    });
  }

  //Update Search Input Value
  updateSearch(value) {
    this.setState({ search: value });
  }

  //Update the Barrier Description Value
  updateBarrierDesc(value) {
    this.setState({ barrierDesc: value });
  }

  //set the visibility of Barrier Modal
  _toggleModal() {
    console.log("is Modal Visible?", this.state.modalVisible);
    this.setState({ modalVisible: !this.state.modalVisible });
  }

  async componentWillMount() {
    //Fetch All the Points here
    // this.askLocation();
  }

  async componentDidMount() {
    console.log("ShowMap Component Mounted");
  }

  onSourceLayerPress(e) {
    const feature = e.nativeEvent.payload;
    console.log("You've pressed", feature);
    ToastAndroid.showWithGravity(
      "Barrier Type: " +
      feature.properties.feature_type +
      "   description: " +
      feature.properties.description,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    );
  }
  //Rendering Main Component
  render() {
    // Extract the state variables
    const {
      centerCoords,
      search,
      longitude,
      latitude,
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
          showUserLocation={true}
          zoomLevel={16}
          userTrackingMode={MapboxGL.UserTrackingModes.FollowWithHeading}
          styleURL={styleURL}
          centerCoordinate={centerCoords}
          style={styles.container}
          ref={c => (this._map = c)}
          onRegionDidChange={this.getCenter}
          animated={true}
          onUserLocationUpdate={this.updateUserLocation}
        >
          <MapboxGL.ShapeSource
            id="symbolLocationSource"
            hitbox={{ width: 44, height: 44 }}
            onPress={this.onSourceLayerPress}
            shape={this.state.featureCollection}
          >
            <MapboxGL.SymbolLayer
              id="symbolLocationSymbols"
              minZoomLevel={1}
              style={mapStyles.icon}
            />
          </MapboxGL.ShapeSource>
          <CurrentLocation
            mockUserLocation={this.state.fakeCenter}
            onLocationChange={this.onLocationChange}
            {...this.currentLocationStyle} />
          <Directions
            accessToken={MAPBOX_ACCESS_TOKEN}
            origin={this.state.origin}
            destination={this.state.destination}
            onDirectionsFetched={this.onDirectionsFetched}
            style={this.directionsStyle} />
        </MapboxGL.MapView>
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
          onOk={() => {
            this.onSubmitBarrier();
            this.setState({ modalVisible: false });
          }}
          onCancel={() => this.setState({ modalVisible: false })}
        >
          <View>
            <Text>Barrier Type</Text>
            <RadioForm
              radio_props={type_props}
              initial={0}
              onPress={value => {
                this.setState({ typeValue: value });
              }}
            />
            <Text>Co-Ordinates</Text>
            <Button
              icon={<Icon name="add-location" size={15} color="white" />}
              title="Current Location"
              onPress={this.askLocation}
            />
            <Text>
              {longitude}, {latitude}
            </Text>
            <Text> Description</Text>
            <Input
              onChangeText={this.updateBarrierDesc}
              placeholder="Barrier Description"
            />

            <Text>Rating</Text>
            <Rating
              style={{ paddingVertical: 10 }}
              ratingColor={"#000000"}
              startingValue={0.5}
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

const mapStyles = MapboxGL.StyleSheet.create({
  icon: {
    iconImage: toiletIcon,
    iconAllowOverlap: false,
    iconSize: 1.2
  }
});

"use strict";

import React, { Component } from "react";
import { View, StyleSheet, PixelRatio, Platform, KeyboardAvoidingView } from "react-native";
import MapboxGL from "@mapbox/react-native-mapbox-gl";
import {
  Input,
  Icon,
  Rating,
   Overlay
} from "react-native-elements";
import { Container, Header, Title,  Card, CardItem, Content, Footer, FooterTab, Button, Left, Right, Body, Text, Toast } from "native-base";
import { MaterialDialog } from "react-native-material-dialog";
import config from "../Utils/config";
import CurrentLocation from "./CurrentLocation";
import Directions from "./Directions";
import bbox from "@turf/bbox";
import RNGooglePlaces from "react-native-google-places";
import POI from "../Utils/PoIConfig";
import PoIDetailOverlay from "./PoIDetailOverlay";
import InfoCard from "./InforCard";

import RadioForm from "react-native-simple-radio-button";
// import defaultMarkerIcon from "../../assets/images/default-marker-icon.png";
// import toiletIcon from "../../assets/images/icon-toilet.png";
import toiletIcon from "../../assets/images/toilet-icon-resized.png";
import parkingMarkerIcon from "../../assets/images/icon-parking.png";
import gapsMarkerIcon from "../../assets/images/icon-gap.png";
import crossingMarkerIcon from "../../assets/images/icon-crossing.png";
import obstructionsMarkerIcon from "../../assets/images/obstruction.png";
import pathawaysMarkerIcon from "../../assets/images/icon-pathway.png";

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

const IS_ANDROID = Platform.OS === "android";
const BOUNDS_PADDING_SIDE = IS_ANDROID
  ? PixelRatio.getPixelSizeForLayoutSize(60)
  : 60;
const BOUNDS_PADDING_BOTTOM = IS_ANDROID
  ? PixelRatio.getPixelSizeForLayoutSize(206)
  : 206;
export default class ShowMap extends Component {
  constructor(props) {
    super(props);

    //Define default states for this component
    this.state = {
      styleURL: "mapbox://styles/uvishere/cjgz9ao04000f2snu34b9j4jj",
      locationPermission: "undetermined",
      centerCoords: null,
      longitude: 130.8694928,
      latitude: -12.3713666,
      search: "",
      modalVisible: false,
      typeValue: type_props[0].value,
      barrierDesc: "",
      pointBarrierVisible: false,
      featureCollection: MapboxGL.geoUtils.makeFeatureCollection(),
      origin: [130.851761, -12.375846],
      destination: null,
      fakeCenter: [130.852454, -12.374835]
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
    this.openSearchModal = this.openSearchModal.bind(this);
    this.populateBarriers = this.populateBarriers.bind(this);
  }

  /* For Location Search Autocomplete */
  openSearchModal() {
    RNGooglePlaces.openAutocompleteModal({
      useOverlay: true,

    }, ['placeID', 'location', 'name', 'address', 'types'])
      .then(place => {
        console.log(place);

        Toast.show({
          text: "Address: " + place.address,
          type: "default"
        });

        const { longitude, latitude } = place.location;
        const destination = [longitude, latitude];
        this.setState({
          destination: destination
        });
      })
      .catch(error => console.log(error.message)); // error is a Javascript Error object
  }


  /* Event after the direction is completely fetched from the API */
  onDirectionsFetched(directions) {
    if (!this.state.isChangeFromPress) {
      this.fitBounds(directions);
    }
  }

  /* Fit the generated route to the mobile viewport  */
  fitBounds(directions) {
    try {
      const boundingBox = bbox(
        MapboxGL.geoUtils.makeFeature(directions.geometry)
      );

      const padding = 20;
      this._map.fitBounds(
        [boundingBox[2], boundingBox[3]],
        [boundingBox[0], boundingBox[1]],
        padding,
        500
      );
    }
    catch (e) {
      console.log(e)
    }
  }

  onLocationChange(coord) {
    this.setState({ origin: coord });
  }

  get directionsStyle() {
    return {
      lineColor: "#987DDF"
    };
  }

  /* Ask for Location Permission **USES MAPBOX API */
  async askLocation() {
    const isGranted = await MapboxGL.requestAndroidLocationPermissions();
    if (isGranted) {
      Toast.show({
        text: "Please Wait! Your location is being updated",
        type: "warning"
      });
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log("position", position);
          const { longitude, latitude } = position.coords;
          console.log(longitude, latitude);
          Toast.show({
            text: "Your Location has been updated",
            type: "success",
            buttonText: "Okay",
            position: "top",
            buttonTextStyle: { color: "#008000" },
            buttonStyle: { backgroundColor: "#5cb85c" }
          });
          this.setState({
            centerCoords: [longitude, latitude],
            longitude: longitude,
            latitude: latitude
          });
        },
        error => {
          console.log(error);
        }
      );
    } else {
      Toast.show({
        text: "Location Timed Out!",
        type: "error"
      });
    }
  }

  /* Update the userlocation */
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
      description: this.state.barrierDesc,
      icon: this.state.typeValue,
    };
    const payload = {
      pointType: properties.feature_type,
      description: properties.description,
      location: newGeoPoint.coordinates
    };

    const AddPointResponse = await POI.addPoI(payload);
    console.log("added to easygo server", AddPointResponse);

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


  /* Filters all the PoI and creates an Array of PoI according to the user preference */
  filterPoI(fullArray /*, filterOptions */) {
    let readyPoI = [];

    const toCheck = ['toilet', 'parking', 'obstructions', 'pathways', 'crossings', 'gaps']; /*TODO: toCheck variable should be replaced by filterOptions */

    fullArray.data.forEach(point => {
      if (toCheck.includes(point.pointType)) {
        readyPoI.push(point)
      }
    })
    return readyPoI;
  };


  /* Add Barriers on the map load */
  async populateBarriers() {
    try {
      const pointResponse = await POI.getPoI();

      const readyPoI = this.filterPoI(pointResponse);
      debugger;
      readyPoI.forEach(point => {

        const { location, pointType, description, ratings } = point;
        
        const newGeoPoint = {
          coordinates: location.coordinates,
          type: location.type
        };
        
        const properties = {
          feature_type: pointType,
          description: description,
          icon: pointType,
          rating: ratings
        };

        const feature = MapboxGL.geoUtils.makeFeature(newGeoPoint, properties);
        feature.id = `${Date.now()}`;

        // debugger;
        this.setState({
          featureCollection: MapboxGL.geoUtils.addToFeatureCollection(
            this.state.featureCollection,
            feature
          )
        });
      });
    } catch (e) {
      debugger;
      console.log(e)
    }
  }

  /* Update Search Input Value */
  updateSearch(value) {
    this.setState({ search: value });
  }

  /* Update the Barrier Description Value */
  updateBarrierDesc(value) {
    this.setState({ barrierDesc: value });
  }

  /* set the visibility of Barrier Modal */
  _toggleModal() {
    console.log("is Modal Visible?", this.state.modalVisible);
    this.setState({ modalVisible: !this.state.modalVisible });
  }

  async componentWillMount() {
    this.askLocation();
    this.populateBarriers();
  }

  componentDidMount() {
    // this.getNearest();
  }

  onSourceLayerPress(e) {
    const feature = e.nativeEvent.payload;
    console.log(feature);

    Toast.show({
      text: feature.properties.description,
      type: "success",
      duration: 5000
    });
  }

  async getNearest() {
    const featureCollection = await this.state.featureCollection;
    const poiSingleCord = featureCollection.features;
    console.log(poiSingleCord);
    let PoIArray = [];

    poiSingleCord.forEach(point => {
      PoIArray.push(point.geometry.coordinates)
    });

    console.log(PoIArray);
  }

  get PoIIcon() {
    const mapStyles = MapboxGL.StyleSheet.create({
      icon: {
        iconImage: defaultMarkerIcon,
        iconAllowOverlap: false,
        iconSize: 0.8
      }
    })
    return mapStyles.icon;
  }

  //Rendering Main Component
  render() {
    // Extract the state variables
    const { centerCoords, longitude, latitude, styleURL } = this.state;

    return (
      <Container>
        <Header>
          <Left />
          <Body>
            <Title>EasyGo</Title>
          </Body>
          <Right>
          <Button transparent>
              <Icon name="person-outline" type="ionicons" color="#fff" />
            </Button>
            </Right>
        </Header>
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
            images={{ toilet: toiletIcon, parking: parkingMarkerIcon, gaps: gapsMarkerIcon, crossings: crossingMarkerIcon, pathways: pathawaysMarkerIcon, obstructions: obstructionsMarkerIcon }}
          >
            <MapboxGL.SymbolLayer
              id="symbolLocationSymbols"
              minZoomLevel={11}
              style={mapStyles.icon}
            />
          </MapboxGL.ShapeSource>
          <CurrentLocation onLocationChange={this.onLocationChange} />

          <Directions
            accessToken={MAPBOX_ACCESS_TOKEN}
            origin={this.state.origin}
            destination={this.state.destination}
            onDirectionsFetched={this.onDirectionsFetched}
            style={this.directionsStyle}
          />
        </MapboxGL.MapView>
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
        
        <Footer >
        <FooterTab style={{backgroundColor:'#fff'}} >
            <Button vertical  style={styles.footerButtonStyle} onPress={() => this.openSearchModal()}>
              <Icon name="search" type="ionicons" color="#de2342" />
              <Text style={styles.footerTextStyle}>Directions</Text>
            </Button>
            <Button vertical style={styles.footerButtonStyle} onPress={() => this._toggleModal()}>
              <Icon name="add-circle-outline" type="ionicons" color="#2E3F7F"/>
              <Text style={styles.footerTextStyle}>Add Point</Text>
            </Button  >
            <Button vertical style={styles.footerButtonStyle}>
              <Icon name="send" type="ionicons" color="#00CF91" />
              <Text style={styles.footerTextStyle}>Near Me</Text>
            </Button >
            <Button vertical style={styles.footerButtonStyle} onPress={() => this.askLocation()}>
              <Icon name="location-on" color="#FFC11E" />
              <Text style={styles.footerTextStyle}>Locate Me</Text>
            </Button>
          </FooterTab>
        </Footer>

      </Container>
    );
  }
}

/* Component style definitions */
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "transparent"
  },
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
    borderBottomColor: "#ddd",
    padding: 20,
    borderRadius: 50
  },
  inputBox: {
    fontSize: 5
  },
  dialogText: {
    fontSize: 12
  },
  footerButtonStyle: {
    borderRightColor: "#eee",
    borderRightWidth: 1
  },
  footerTextStyle: {
    color: "#2F3538"
  }
});


/* Map Sytles */
const mapStyles = MapboxGL.StyleSheet.create({
  icon: {
    iconImage: '{icon}',
    iconAllowOverlap: false,
    iconSize: 1
  }
});

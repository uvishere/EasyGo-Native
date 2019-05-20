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
import { Container, Header, Title, Card, CardItem, Content, Footer, FooterTab, Button, Left, Right, Body, Text, Toast, Spinner, H2, H3, Form, Grid, Col, Row, H1 } from "native-base";
import { MaterialDialog } from "react-native-material-dialog";
import config from "../Utils/config";
import CurrentLocation from "./CurrentLocation";
import Directions from "./Directions";
import bbox from "@turf/bbox";
import RNGooglePlaces from "react-native-google-places";
import POI from "../Utils/PoIConfig";
import PoIDetailOverlay from "./PoIDetailOverlay";
import InfoCard from "./InfoCard";
import findDistance from '@turf/distance';

import RadioForm from "react-native-simple-radio-button";
// import defaultMarkerIcon from "../../assets/images/default-marker-icon.png";
// import toiletIcon from "../../assets/images/icon-toilet.png";
import toiletIcon from "../../assets/images/toilet-icon-resized.png";
import parkingMarkerIcon from "../../assets/images/icon-parking.png";
import gapsMarkerIcon from "../../assets/images/icon-gap.png";
import crossingMarkerIcon from "../../assets/images/icon-crossing.png";
import obstructionsMarkerIcon from "../../assets/images/obstruction.png";
import pathawaysMarkerIcon from "../../assets/images/icon-pathway.png";
import { Modal, Actions } from "react-native-router-flux";

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
      origin: null,
      destination: null,
      showNearestModal: false,
      loading: false
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
    this.getDistancefromCurrentLocation = this.getDistancefromCurrentLocation.bind(this);
    this.updateDestination = this.updateDestination.bind(this);
    this.refreshMap = this.refreshMap.bind(this);
    this.OpenNearestOptionModal = this.OpenNearestOptionModal.bind(this);
  }

  /* For Location Search Autocomplete */
  openSearchModal() {
    RNGooglePlaces.openAutocompleteModal({
      useOverlay: true,

    }, ['placeID', 'location', 'name', 'address', 'types'])
      .then(place => {
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
      debugger;
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

  /* Open Nearest Options Modal */
  OpenNearestOptionModal() {
    this.setState({
      showNearestModal: !this.state.showNearestModal,
    })
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
          const { longitude, latitude } = position.coords;
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
            origin: [longitude, latitude],
            longitude: longitude,
            latitude: latitude
          });
        },
        error => {
          console.log(error);
          debugger;
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


  /* Get distance of the point from current location */
  getDistancefromCurrentLocation(dest) {
    const origin = MapboxGL.geoUtils.makePoint(this.state.origin);
    const destination = MapboxGL.geoUtils.makePoint(dest.coordinates);

    let distance = findDistance(
      origin, destination,
      { units: "meters" }
    );
    distance = Math.round(distance * 10) / 10;
    return distance;
  }


  /* Add Barriers on the map load */
  async populateBarriers() {
    try {
      const pointResponse = await POI.getPoI();

      const readyPoI = this.filterPoI(pointResponse);
      readyPoI.forEach(point => {

        const { location, pointType, description, ratings } = point;

        const distanceFromOrigin = this.getDistancefromCurrentLocation(location);

        const newGeoPoint = {
          coordinates: location.coordinates,
          type: location.type
        };

        const properties = {
          feature_type: pointType,
          description: description,
          icon: pointType,
          distance: distanceFromOrigin,
          rating: ratings
        };


        const feature = MapboxGL.geoUtils.makeFeature(newGeoPoint, properties);
        feature.id = `${Date.now()}`;

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
    this.setState({ modalVisible: !this.state.modalVisible });
  }


  async componentWillMount() {
    this.askLocation();
    this.populateBarriers();
  }

  componentDidMount() {
    // this.getNearest();
  }

  /* when the mapIcon is pressed */
  onSourceLayerPress(e) {
    const feature = e.nativeEvent.payload;
    console.log(feature)
    Toast.show({
      text: feature.properties.description,
      type: "success",
      duration: 5000,
      position: "top"
    });
  }


  /* go to Nearby list */
  nearbyList(type) {
    const featureCollection = this.state.featureCollection;
    const poiSingleCord = featureCollection.features;

    const params = { poi: poiSingleCord, featureType: type, directions: this.updateDestination };
    Actions.nearby(params);
  }

  /* Update the destination for directions.. Called from child component */
  updateDestination(dest) {
    this.setState({
      destination: dest
    })
  }

  /* Refrest the Map */
  async refreshMap() {
    await this.setState({
      destination: null
    })
  }
  //Rendering Main Component
  render() {
    // Extract the state variables
    const { centerCoords, longitude, latitude, styleURL } = this.state;

    if (this.state.loading) {
      return (
        <Content>
          <Spinner color='red' />
        </Content>
      );
    }
    else {
      return (
        <Container>
          <Header>
            <Left >
              <Button transparent onPress={() => alert("create user profile")} >
                <Icon name="person-outline" type="ionicons" color="#fff" />
              </Button>
            </Left>
            <Body>
              <Title>EasyGo</Title>
            </Body>
            <Right>
              <Button transparent onPress={() => this.refreshMap()} >
                <Text></Text>
                <Icon name="refresh" type="ionicons" color="#fff" />
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
            <Form style={{ padding: 25 }}>
              <H3>Barrier Type</H3>
              <RadioForm
                radio_props={type_props}
                initial={0}
                onPress={value => {
                  this.setState({ typeValue: value });
                }}
                style={{ color: "#5cb85c", padding: 25 }}
              />
              <H3>Where</H3>
              <Button bordered iconLeft success>
                <Icon name="location-on" type="Ionicons" color="#5cb85c" />
                <Text>CUrrent Location</Text>
              </Button>

              <Text> Description</Text>
              <Input
                onChangeText={this.updateBarrierDesc}
                placeholder="Barrier Description"
              />
            </Form>

          </MaterialDialog>

          <Overlay
            isVisible={this.state.showNearestModal}
            onBackdropPress={() => this.setState({ showNearestModal: false })}
          >
            <Container style={{ justifyContent: "center", alignItems: "center" }} >
                <Header transparent>
                  <H1> Select One</H1>
                </Header>
              <Content>
                <Button success full iconLeft block
                  style={styles.nearestOverlayContent}
                  onPress={() => {
                    this.nearbyList("toilet");
                    this.setState({ showNearestModal: false });
                    
                  }}>
                  <Icon name="location-on" type="Ionicons" />
                  <Text>Toilet</Text>
                </Button>
                <Button info block full  iconLeft
                  style={styles.nearestOverlayContent}
                  onPress={() => {
                    this.nearbyList("parking");
                    this.setState({ showNearestModal: false });
                  }}>
                  <Icon name="location-on" type="Ionicons" />
                  <Text>Parking</Text>
                </Button>
                <Button danger block full  iconLeft
                  style={styles.nearestOverlayContent}
                  onPress={() => {
                    this.nearbyList("obstructions");
                    this.setState({ showNearestModal: false });
                  }}>
                  <Icon name="location-on" type="Ionicons" />
                  <Text>Obstruction</Text>
                </Button>
                <Button primary block full  iconLeft
                  style={styles.nearestOverlayContent}
                  onPress={() => {
                    this.nearbyList("gaps");
                    this.setState({ showNearestModal: false });
                  }}>
                  <Icon name="location-on" type="Ionicons" />
                  <Text>Gap</Text>
                </Button>
                <Button warning block full  iconLeft
                  style={styles.nearestOverlayContent}
                  onPress={() => {
                    this.nearbyList("crossings");
                    this.setState({ showNearestModal: false });
                  }}>
                  <Icon name="location-on" type="Ionicons" />
                  <Text>Crossing</Text>
                </Button>
                <Button dark block full  iconLeft
                  style={styles.nearestOverlayContent}
                  onPress={() => {
                    this.nearbyList("pathways");
                    this.setState({ showNearestModal: false });
                  }}>
                  <Icon name="location-on" type="Ionicons" />
                  <Text>Pathway</Text>
                </Button>
              </Content>
            </Container>
          </Overlay>

          <Footer >
            <FooterTab style={{ backgroundColor: '#fff' }} >
              <Button vertical style={styles.footerButtonStyle} onPress={() => this.openSearchModal()}>
                <Icon name="search" type="ionicons" color="#de2342" />
                <Text style={styles.footerTextStyle}>Directions</Text>
              </Button>
              <Button vertical style={styles.footerButtonStyle} onPress={() => this._toggleModal()}>
                <Icon name="add-circle-outline" type="ionicons" color="#2E3F7F" />
                <Text style={styles.footerTextStyle}>Add Point</Text>
              </Button  >
              <Button vertical style={styles.footerButtonStyle} onPress={() => this.OpenNearestOptionModal()}>
                <Icon name="send" type="ionicons" color="#00CF91" />
                <Text style={styles.footerTextStyle} >Near Me</Text>
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
  },
  nearestOverlayContent:{
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 5,
    marginRight: 5,
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

import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native'
import MapboxGL from '@mapbox/react-native-mapbox-gl'

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidXZpc2hlcmUiLCJhIjoiY2pleHBjOWtjMTZidTJ3bWoza3dlZmIxZiJ9.HvLEBmq44mUfdgT7-C73Jg';

MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default class ShowMap extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      styleURL: "mapbox://styles/uvishere/cjgz9ao04000f2snu34b9j4jj",
      coords: [130.8694928, -12.3713568]
    };
  };
  
    componentDidMount() {
      console.log("nothing happend on Componet did omoi")
  }
  render() {
   
    return (
      <View style={styles.container} >
        <MapboxGL.MapView
          showUserLocation={true}
          zoomLevel={15}
          userTrackingMode={MapboxGL.UserTrackingModes.Follow}
          styleURL={this.state.styleURL}
          centerCoordinate = {this.state.coords}
          style={styles.container}
        />
      </View>
    )
  }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
})
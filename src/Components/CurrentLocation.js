import React from 'react';
import PropTypes from 'prop-types';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

const styles = MapboxGL.StyleSheet.create({
  innerCircle: {
    circleRadius: 6,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
    circleColor:'green'
  },
  outerCircle: {
    circleRadius: 11,
    circleOpacity: 0.40,
    circleColor:'green'
  },
});

class CurrentLocation extends React.Component {
  static propTypes = {
    /**
     * Overrides default user location
     */
    mockUserLocation: PropTypes.arrayOf(PropTypes.number),

    /**
     * Get fired everytime the user location changes
     */
    onLocationChange: PropTypes.func,

    /**
     * Inner circle layer style
     */
    innerCircleStyle: PropTypes.any,

    /**
     * Outer circle layer style
     */
    outerCircleStyle: PropTypes.any,
  };

  constructor(props) {
    super(props);

    this.state = {
      currentPosition: null,
    };

    this._locationWatchID = -1;
    this.onLocationChange = this.onLocationChange.bind(this);
    this.onLocationError = this.onLocationError.bind(this);
  }

  componentDidMount() {
    console.log("Current Location Component Mounted")
    if (!this.props.mockUserLocation) {
      this._locationWatchID = navigator.geolocation.watchPosition(
        this.onLocationChange,
        this.onLocationError,
      );
    } else {
      this.setState({ currentPosition: MapboxGL.geoUtils.makePoint(this.props.mockUserLocation) });

      if (this.props.onLocationChange) {
        this.props.onLocationChange(this.props.mockUserLocation);
      }
    }
  }

  componentWillUnmount() {
    if (!this.props.mockUserLocation) {
      navigator.geolocation.clearWatch(this._locationWatchID);
    }
  }

  onLocationChange(position) {
    const coord = [position.coords.longitude, position.coords.latitude];

    if (this.props.onLocationChange) {
      this.props.onLocationChange(coord);
    }

    this.setState({
      currentPosition: MapboxGL.geoUtils.makePoint(coord),
    });
  }

  onLocationError(error) {
    console.log('Geolocation error', error); // eslint-disable-line
  }

  render() {
    if (!this.state.currentPosition) {
      return null;
    }

    return (
      <MapboxGL.ShapeSource id='store-locator-current-location-source' shape={this.state.currentPosition}>
        <MapboxGL.CircleLayer
          id='store-locator-current-location-outer-circle'
          style={[styles.outerCircle, this.props.outerCircleStyle]} />

        <MapboxGL.CircleLayer
          id='store-locator-current-location-inner-circle'
          aboveLayerID='store-locator-current-location-outer-circle'
          style={[styles.innerCircle, this.props.innerCircleStyle]} />
      </MapboxGL.ShapeSource>
    );
  }
}

export default CurrentLocation;

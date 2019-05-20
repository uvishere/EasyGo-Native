import React from 'react';
import PropTypes from 'prop-types';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import MapboxClient from 'mapbox';
import DirectionType from "../Utils/DirectionType";
import sort from "fast-sort";
import { Container, Header, Left, Text, Body, Title, Right, Button, Icon, Content, Card, CardItem, Toast } from 'native-base';
import { Actions } from "react-native-router-flux";
import InfoCard from "./InfoCard";

export default class NearbyPoI extends React.Component {
  static propTypes = {

    /* Collection of All PoI */
    poi: PropTypes.array.isRequired,

    /* Type of PoI  to search for */
    featureType: PropTypes.string,

    /* for directions */
    directions: PropTypes.func
  }


  static defaultProps = {
    featureType: "parking"
  }


  constructor(props) {
    super(props);

    console.log(this.props.poi[0]);

    this.state = {
      features: this.props.poi,
      sortedFeatures: []
    }

    this.props = props;
  }


  /* Filters all the PoI and creates an Array of PoI according to the supplied PoI Type */
  filterPoI(fullArray /*, filterOptions */) {
    let readyPoI = [];

    const toCheck = [this.props.featureType]; /*TODO: toCheck variable should be replaced by filterOptions */

    fullArray.forEach(point => {
      if (toCheck.includes(point.properties.feature_type)) {
        readyPoI.push(point)
      }
    })
    console.log(readyPoI);

    return readyPoI;
  };

  /* Sort the filterdPoI and return the list of sorted array */
  sortPoints(pointsToSort) {
    const sortedPoints = sort(pointsToSort).asc(u => u.properties.distance);
    return sortedPoints;
  }


  makeList(allPoI) {
    const filteredPoi = this.filterPoI(allPoI);
    const sortedPoI = sort(filteredPoi).asc(u => u.properties.distance);

    this.setState({
      sortedFeatures: sortedPoI
    });
  }


  async componentWillMount() {
    console.log(this.props);
    await this.makeList(this.props.poi);
  }

  renderItems() {
    // debugger;
    if(this.state.sortedFeatures)
      return this.state.sortedFeatures.map((poi, index) => <InfoCard key={poi.id} count={index} data={poi} directions={this.props.directions}/> )
  };

  render() {
    return (
      <Container>
        <Header>
          <Button transparent onPress={() => Actions.pop()}>
            <Icon name="ios-arrow-back" type="Ionicons" color="#de2342" />
          </Button>
          <Body>
            <Title center>Nearby You</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => Actions.map()}>
              <Icon name="ios-home" type="Ionicons" color="#de2342" />
            </Button>
          </Right>
        </Header>
        <Content padder>
          {this.renderItems()}
        </Content>
      </Container>
    );
  }
}

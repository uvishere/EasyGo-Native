"use strict";
import React, { Component } from "react";
import { Image } from 'react-native';
import PropTypes from 'prop-types';
import { Card, CardItem, Body, Text, Left, Thumbnail, Right, Button, Icon } from "native-base";


import parkingMarkerIcon from "../../assets/images/icon-parking.png";
import gapsMarkerIcon from "../../assets/images/icon-gap.png";
import crossingMarkerIcon from "../../assets/images/icon-crossing.png";
import obstructionsMarkerIcon from "../../assets/images/obstruction.png";
import pathawaysMarkerIcon from "../../assets/images/icon-pathway.png";
import { Actions } from "react-native-router-flux";


const toiletIcon = "../../assets/images/toilet-icon-resized.png";
export default class InfoCard extends Component {
  static propType = {
    /* POI Data Object */
    data: PropTypes.object,

    /* Unique key for the component */
    key: PropTypes.number,

    /* Interation of the parent Array */
    count: PropTypes.number,

  /* function when the direction is changed */
    directions: PropTypes.func
  }
  constructor(props) {
    super(props);

    this.props = props;
    this.sendDirection = this.sendDirection.bind(this);
  }

  componentDidMount() {
  }

  sendDirection() {
    const dest = this.props.data.geometry.coordinates;
    Actions.map(this.props.directions(dest))
  }
  render() {

    const { properties } = this.props.data;

    
    return (
      <Card>
        <CardItem>
          <Left >
            <Text style={{ fontSize: 30, color: "#FF756B", fontWeight: "bold", padding: 20, backgroundColor: "#eee", margin:0, opacity:0.5}}>{this.props.count + 1}</Text>
            <Body>
              <Text style={{ fontSize: 20, color: "#555", fontWeight: "bold" }}>{properties.description}</Text>
            </Body>
          </Left>
        </CardItem>
        <CardItem style={{backgroundColor:"#2F3640"}}>
          <Left>
            <Button transparent icon>
              <Icon name="speedometer" color="#7AB1FF" size={25} />
              <Text style={{fontSize: 18, color: "#fff"}}>{properties.distance} meters</Text>
            </Button>
          </Left>
          <Right>
            <Button bordered rounded iconRight light onPress={this.sendDirection}>
              <Text>Get Directions</Text>
              <Icon name="walk" />
            </Button>
          </Right>
        </CardItem>
      </Card>
    )
  }
}

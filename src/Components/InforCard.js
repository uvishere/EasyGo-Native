"use strict";
import React, { Component } from "react";

import { Card, CardItem, Body, Text } from "native-base";



export default class InfoCard extends Component {
  constructor(props) {
    super(props);
  }



  renderDefaultItem ({ item }) {
    const feature = item;
    const props = feature.properties;

    const style = {
      backgroundColor: 'transparent',
      width: this.state.itemWidth,
      height: this.props.itemHeight,
    };

    let distance = findDistance(
      MapboxGL.geoUtils.makePoint(this.props.origin),
      feature,
      { units: 'miles' },
    );
    distance = Math.round(distance * 10) / 10;

    return (
      console.log("Nothing in the card")
    );
  }

  componentDidMount() {
    console.log("Logging");
  }

  render() {
    return (
      <Card style={{ elevation: 0, padding: 20, margin: 20 }}>
        <CardItem header button onPress={() => alert("This is Card Header")}>
          <Text>NativeBase</Text>
        </CardItem>
        <CardItem button onPress={() => alert("This is Card Body")}>
          <Body>
            <Text>
              Click on any carditem
                        </Text>
          </Body>
        </CardItem>
      </Card>
    )
  }
}

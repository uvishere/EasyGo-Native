"use strict";
import React, { Component } from "react";

import { Card, CardItem, Body, Text } from "native-base";



export default class InfoCard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Card style={{ elevation:0, padding: 20, margin:20 }}>
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

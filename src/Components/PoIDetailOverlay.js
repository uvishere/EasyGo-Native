"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import { Overlay } from 'react-native-elements';
import { View } from 'native-base';

export default class PoIDetailOverlay extends React.Component {
    static propTypes = {

        PoIFeature: PropTypes.object,
        isVisible: PropTypes.bool
    };


    constructor(props) {
        super(props);

        this.state = {
            feature: this.props.PoIFeature,
            isVisible: this.props.isVisible,
        };

    }

    
    async componentWillMount() {
        console.log("PoIFeatureOverlay is about to laod");
    }


    render() {
        if (!this.state.directions) {
            return null;
        }
        return (
            <View>
            <Overlay isVisible={this.props.isVisible}>
                <Text>Hello from Overlay!</Text>
            </Overlay>
            </View>
        );
    }
};


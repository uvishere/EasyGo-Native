'use strict'
/**
 * Application's Major Entry Point
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Root } from "native-base";
import ScreenCollection from './Navigation/ScreenCollection';

// <Root> Component is required to work most of the native-base element
export default class App extends Component {
    render() {
        return (
            <Root>
                <ScreenCollection />
            </Root>
        );
    };
};

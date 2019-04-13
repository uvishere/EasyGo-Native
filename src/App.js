'use strict'
/**
 * Application's Major Entry Point
 * @format
 * @flow
 */

import React, {Component} from 'react';
import ScreenCollection from './Navigation/ScreenCollection';

export default class App extends Component {
    render() {
        return(
            <ScreenCollection />
        );
    };
};
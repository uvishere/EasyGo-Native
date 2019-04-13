/**
* All the screens will be registered in this file
* @format
* @flow
*/
import { Navigation } from 'react-native-navigation';

export default function registerScreens() {
    Navigation.registerComponent('OnBoarding',() => require('../Components/OnBoarding').default)
    Navigation.registerComponent('SignUp',() => require('../Components/SignUp').default)
    Navigation.registerComponent('SignIn', () => require('../Components/SignIn').default)
    Navigation.registerComponent('Home', () => require('../Components/Home').default)

}
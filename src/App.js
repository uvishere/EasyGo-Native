//Application's Major Entry Point

import {  Navigation } from  'react-native-navigation'
import { registerScreens } from './Navigation/ScreenCollection'

registerScreens();

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setRoot({
        root: {
            component: {
                name: 'Initializing'
            }
        }
    })
})
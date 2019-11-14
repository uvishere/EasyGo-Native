'use strict';

import env from '../../env.json';

console.log(env.mapboxkey)

class Config {
    getMapboxKey() {
        return env.mapboxkey;
    }
}



const config = new Config();

export default config;

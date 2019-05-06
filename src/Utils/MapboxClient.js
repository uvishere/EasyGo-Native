import MapboxClient from 'mapbox';

import config from './utils/config';

const client = new MapboxClient(config.getMapboxKey());

console.log("Mapbox Token", client)

export default client;

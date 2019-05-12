import env from '../../env.json'

class Config {
    getMapboxKey() {
        return env.mapboxkey;
    }
}



const config = new Config();

export default config;

"use strict";

import axios from "axios";
import AsyncStorage from "@react-native-community/async-storage";

//API URLS
const ADDPOI_API = "http://easygo.codeshala.com/point";
const GETPOI_API = "http://easygo.codeshala.com/point";


//Create the Request header object
const setRequestConfig = token => {
  try {
    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token
      },
      responseType: "json"
    };
    return config;
  } catch (e) {
    console.log(e.message);
    return e;
  }
};

//Class to handle PoI related API Calls
class PoIConfig {
  //Add POI
  async addPoI(data) {
    const req = JSON.stringify(data);
    try {
      const token = await AsyncStorage.getItem("@userToken");

      const config = setRequestConfig(token);
      const poiResponse = await axios.post(ADDPOI_API, req, config);
      console.log("Response after adding PoI", poiResponse.data);
      return poiResponse.data;
    } catch (e) {
      console.log(e.message);
    }
  };

  // Get All the PoI
  async getPoI() {
    try {
      const token = await AsyncStorage.getItem("@userToken");
      const config = setRequestConfig(token);

      const poiResponse = await axios.get(GETPOI_API, config);
      console.log("PoI Data: ", poiResponse.data);
      
      return poiResponse.data;
    } catch (e) {
      console.log('error in getting points', e.message)
    }
  }
}

const POI = new PoIConfig();

export default POI;

"use strict";

import axios from "axios";
import AsyncStorage from "@react-native-community/async-storage";

//API Calls
const ADDPOI_API = "http://easygo.codeshala.com/point";
// const LOGIN_API = "http://easygo.codeshala.com/user/login";

const setRequestConfig =  (token) => {
  try {
    const config = {
      headers: {
        "Accept": 'application/json',
        "Content-Type": "application/json",
        "Authorization": token
      },
      responseType: "json"
    };
    return config;
  } catch (e) {
    console.log("token is not reachable", e.message);
    return e;
  }
};

//Class to handle PoI related APIs
class AddPoI {
  async addPoI(data) {
    const req = JSON.stringify(data);
    try {
    const token = await AsyncStorage.getItem("@userToken");

      const config = setRequestConfig(token);
        debugger;
        const userResponse = await axios.post(ADDPOI_API, req, config);
        console.log("Response after adding PoI", userResponse);
    } catch (e) {
      console.log("Error while adding PoI", e.message);
    }
  }
}

const POI = new AddPoI();

export default POI;

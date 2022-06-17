const axios = require("axios");

export const fetchVersion = (ip, port) => {
  if (ip == "demo" && port == "demo") {
    // Get data from version.json
    const jsonVersion = require("./version.json");
    return Promise.resolve(jsonVersion);
  } else {
    return axios
      .get("http://" + ip + ":" + port + "/version")
      .then((response) => {
        return response;
      });
  }
};

export const fetchTimerData = (ip, port) => {
  if (ip == "demo" && port == "demo") {
    // Get timer data from timers.json and then create a fake clock in the format "00:00:00"
    const jsonTimers = require("./timers.json");
    return Promise.resolve(jsonTimers);
  } else {
    return axios
      .get("http://" + ip + ":" + port + "/v1/timers/current")
      .then((response) => {
        return response.data;
      });
  }
};

export const fetchVideoTimerData = (ip, port) => {
  if (ip == "demo" && port == "demo") {
    // Create a fake clock in the format "00:00:00". Update based on current system clock plus offset
    let date = new Date();
    return Promise.resolve("00:00:" + (30 - ((date.getSeconds() + 12) % 30)));
  } else {
    return axios
      .get("http://" + ip + ":" + port + "/v1/timer/video_countdown")
      .then((response) => {
        return response.data;
      });
  }
};

export const fetchCurrentSlideIndex = (ip, port) => {
  if (ip == "demo" && port == "demo") {
    // Get data from slide_index.json
    const jsonSlideIndex = require("./slide_index.json");
    return Promise.resolve(jsonSlideIndex);
  } else {
    return axios
      .get("http://" + ip + ":" + port + "/v1/presentation/slide_index")
      .then((response) => {
        return response.data;
      });
  }
};

export const fetchSlideCount = (ip, port, id, index, thumbnailQuality) => {
  if (ip == "demo" && port == "demo") {
    // Return true while index <= 13
    if (index <= 13) return Promise.resolve(true);
    else return false;
  } else {
    return axios
      .get(
        "http://" +
          ip +
          ":" +
          port +
          "/v1/presentation/" +
          id +
          "/thumbnail/" +
          index +
          "?quality=" +
          thumbnailQuality
      )
      .then(() => {
        return;
      });
  }
};

export const fetchSlideThumbnail = (ip, port, id, index, thumbnailQuality) => {
  if (ip == "demo" && port == "demo") {
    // Get thumbnails based on index
    return (
      "https://propresenter-monitor.web.app/demo_images/" + index + ".jpeg"
    );
  } else {
    return (
      "http://" +
      ip +
      ":" +
      port +
      "/v1/presentation/" +
      id +
      "/thumbnail/" +
      index +
      "?quality=" +
      thumbnailQuality
    );
  }
};

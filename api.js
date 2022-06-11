const axios = require("axios");

export const fetchVersion = (ip, port) => {
  return axios
    .get("http://" + ip + ":" + port + "/version")
    .then((response) => {
      return response;
    });
};

export const fetchTimerData = (ip, port) => {
  return axios
    .get("http://" + ip + ":" + port + "/v1/timers/current")
    .then((response) => {
      return response;
    });
};

export const fetchVideoTimerData = (ip, port) => {
  return axios
    .get("http://" + ip + ":" + port + "/v1/timer/video_countdown")
    .then((response) => {
      return response;
    });
};

export const fetchCurrentSlideIndex = (ip, port) => {
  return axios
    .get("http://" + ip + ":" + port + "/v1/presentation/slide_index")
    .then((response) => {
      return response;
    });
};

export const fetchSlideCount = (ip, port, id, index, thumbnailQuality) => {
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
};

export const fetchSlideThumbnail = (ip, port, id, index, thumbnailQuality) => {
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
};

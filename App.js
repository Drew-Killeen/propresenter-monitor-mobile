import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  TextInput,
  Button,
  StyleSheet,
  Image,
} from "react-native";
const axios = require("axios");

let thumbnailQuality = 300;
let ip = "192.168.2.39";
let port = "49771";

const fetchVersion = () => {
  return axios
    .get("http://" + ip + ":" + port + "/version")
    .then((response) => {
      return response;
    });
};

const fetchTimerData = () => {
  return axios
    .get("http://" + ip + ":" + port + "/v1/timers/current")
    .then((response) => {
      return response;
    });
};

const fetchCurrentSlideIndex = () => {
  return axios
    .get("http://" + ip + ":" + port + "/v1/presentation/slide_index")
    .then((response) => {
      return response;
    });
};

const fetchSlideCount = (id, index) => {
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

const fetchSlideThumbnail = (id, index) => {
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

class PageContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      configured: false,
      error: false,
    };
  }

  checkConnection = () => {
    fetchVersion()
      .then((response) => {
        if (response.status == 200) {
          this.setState({ configured: true, error: false });
          console.log(response.status);
        }
      })
      .catch((response) => {
        this.setState({ error: true });
        console.log(response.status);
      });
  };

  render() {
    return (
      <ScrollView>
        <Text style={styles.pageTitle}>ProPresenter Monitor</Text>

        {this.state.configured ? (
          <>
            <TimerContainer />
            <SlidesContainer />
          </>
        ) : (
          <>
            <Text>unconfigured</Text>
            <ConfigFields
              onConfigSuccess={this.checkConnection}
              error={this.state.error}
            />
          </>
        )}
      </ScrollView>
    );
  }
}

const ConfigFields = (props) => {
  const [ip, onChangeIp] = React.useState("192.168.2.39");
  const [port, onChangePort] = React.useState("49771");
  let connectText = "Connect";

  return (
    <View style={styles.configContainer}>
      <View style={styles.configSection}>
        <Text style={styles.configLabel}>IP Address:</Text>
        <TextInput
          style={styles.textInput}
          value={ip}
          name="ip"
          type="text"
          onChange={onChangeIp}
        />
      </View>

      <View style={styles.configSection}>
        <Text style={styles.configLabel}>Port:</Text>
        <TextInput
          style={styles.textInput}
          name="port"
          type="text"
          value={port}
          onChange={onChangePort}
        />
      </View>
      <Text>
        <View>
          <Button
            style={styles.submitConnect}
            title={connectText}
            onPress={props.onConfigSuccess}
          />
        </View>
        {props.error ? (
          <Text style={styles.error}>Error: cannot connect</Text>
        ) : (
          ""
        )}
      </Text>
    </View>
  );
};

class Timer extends React.Component {
  render() {
    return (
      <View style={styles.timerBox}>
        <Text style={styles.timerLabel}>
          {this.props.name}
          <Text style={styles.timerTime}>{this.props.time}</Text>
        </Text>
      </View>
    );
  }
}

class TimerContainer extends React.Component {
  state = {
    timers: [],
  };

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    fetchTimerData().then((response) => {
      this.setState({
        timers: response.data,
      });
    });
  }

  render() {
    return (
      <View style={[styles.module, styles.timersContainer]}>
        <Text style={[styles.containerTitle, styles.timersTitle]}>Timers</Text>
        {this.state.timers.map((timer) => {
          return (
            <Text key={timer.id.index} style={styles.timer}>
              <Timer name={timer.id.name} time={timer.time} />
            </Text>
          );
        })}
      </View>
    );
  }
}

class Slide extends React.Component {
  render() {
    return (
      <View className={[this.props.currentSlide, styles.slideBox]}>
        <Image
          source={{ uri: this.props.img }}
          style={[{ width: 300, height: 169 }, styles.slideThumbnail]}
        />
        <Text style={styles.slideNumber}>{this.props.slideNumber}</Text>
      </View>
    );
  }
}

class SlidesContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      presentationID: "1",
      presentationName: "",
      slideIndex: 0,
      slideCount: 0,
    };

    this.handlePresentationUpdate = this.handlePresentationUpdate.bind(this);
  }

  componentDidMount() {
    this.handlePresentationUpdate();
  }

  handlePresentationUpdate() {
    fetchCurrentSlideIndex().then((response) => {
      this.setState({
        presentationID: response.data.presentation_index.presentation_id.uuid,
        presentationName: response.data.presentation_index.presentation_id.name,
        slideIndex: response.data.presentation_index.index,
      });

      this.buildSlideArray(
        response.data.presentation_index.presentation_id.uuid,
        0
      );
    });
  }

  buildSlideArray(id, index) {
    fetchSlideCount(id, index)
      .then(() => {
        this.buildSlideArray(id, index + 1);
      })
      .catch(() => {
        this.setState({
          slideCount: index,
        });
      });
  }

  increaseSlideSize = () => {
    if (thumbnailQuality < 500) {
      thumbnailQuality = thumbnailQuality + 50;
      this.buildSlideArray(this.state.presentationID, 0);
    }
  };

  decreaseSlideSize = () => {
    if (thumbnailQuality > 100) {
      thumbnailQuality = thumbnailQuality - 50;
      this.buildSlideArray(this.state.presentationID, 0);
    }
  };

  render() {
    let slideImgs = [];
    if (this.state.slideCount > 0) {
      for (let i = 0; i < this.state.slideCount; i++) {
        slideImgs.push(
          <Slide
            img={fetchSlideThumbnail(this.state.presentationID, i)}
            slideNumber={i + 1}
            currentSlide={
              this.state.slideIndex === i
                ? styles.currentSlide
                : styles.notCurrentSlide
            }
          />
        );
      }
    }

    return (
      <>
        <View style={styles.module}>
          <Text style={styles.containerTitle}>
            Presentation
            {/* <View style={styles.refreshContainer}>
              <form
                style={styles.refreshForm}
                onClick={this.handlePresentationUpdate}
              >
                <input
                  style={styles.refreshButton}
                  type="button"
                  value="Refresh"
                />
              </form>
            </View> */}
          </Text>
          <Text style={[styles.presentationName, styles.presentationBox]}>
            {this.state.presentationName}
          </Text>

          <Text style={[styles.slideCount, styles.presentationBox]}>
            {this.state.slideIndex + 1} / {this.state.slideCount}
          </Text>
        </View>

        <View style={styles.module}>
          <Text style={styles.containerTitle}>
            Slides
            {/* <View style={styles.slides - sizeButtonsContainer}>
              <form
                style={styles.slidesSizeForm}
                onClick={this.increaseSlideSize}
              >
                <input
                  style={styles.slidesSizeButtons}
                  type="button"
                  value="+"
                />
              </form>
              <form
                style={styles.slidesSizeForm}
                onClick={this.decreaseSlideSize}
              >
                <input
                  style={styles.slidesSizeButtons}
                  type="button"
                  value="-"
                />
              </form>
            </View> */}
          </Text>
          <View style={styles.containerSlides}>{slideImgs}</View>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({});
export default PageContainer;

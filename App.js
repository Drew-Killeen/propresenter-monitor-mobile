import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  TextInput,
  Image,
  SafeAreaView,
  Pressable,
  Dimensions,
  Platform,
  BackHandler,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./styles.js";
import * as ProPresenterApi from "./api.js";
import { setStatusBarStyle } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AndroidSwipeRefreshLayoutNativeComponent from "react-native/Libraries/Components/RefreshControl/AndroidSwipeRefreshLayoutNativeComponent";

setStatusBarStyle("light");

// Sets the thumbnail size so that two thumbnails fit side by side, unless the size is greater than 300
let thumbnailDisplayQuality = Math.min(
  Math.ceil(Dimensions.get("window").width / 2.4),
  300
);
let thumbnailLoadQuality = Math.min(
  Math.ceil(Dimensions.get("window").width / 1.2),
  1000
);
let ipDefault = "";
let portDefault = "";

const multiSet = async () => {
  const firstPair = ["@ProPresenter_Ip", ipDefault];
  const secondPair = ["@ProPresenter_Key", portDefault];
  try {
    await AsyncStorage.multiSet([firstPair, secondPair]);
  } catch (e) {
    //save error
  }
};

const getMultiple = async () => {
  let values;
  try {
    values = await AsyncStorage.multiGet([
      "@ProPresenter_Ip",
      "@ProPresenter_Key",
    ]);
  } catch (e) {
    // read error
  }
  if (values[0][1] != null) {
    ipDefault = values[0][1];
  }

  if (values[1][1] != null) {
    portDefault = values[1][1];
  }
};

getMultiple();

class PageContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      configured: false,
      error: false,
      checkingConnection: false,
    };
  }

  backAction = () => {
    if (this.state.configured === true) {
      this.setState({ configured: false });
    }
    return true;
  };

  checkConnection = (ip, port) => {
    ipDefault = ip;
    portDefault = port;
    multiSet();
    ProPresenterApi.fetchVersion(ipDefault, portDefault)
      .then((response) => {
        if (response.status == 200) {
          this.setState({ configured: true, error: false });
        }
      })
      .catch((response) => {
        this.setState({ error: true });
        // console.log(response.status);
      });
  };

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.backAction
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  render() {
    return (
      <LinearGradient
        colors={["#393939", "#282828"]}
        style={styles.pageGradient}
      >
        <SafeAreaView style={[styles.pageContainer, styles.AndroidSafeArea]}>
          <Text style={styles.pageTitle}>ProPresenter Monitor</Text>

          {this.state.configured ? (
            <ScrollView>
              <TimerContainer />
              <SlidesContainer />
            </ScrollView>
          ) : (
            <ConfigFields
              onConfigSuccess={this.checkConnection}
              error={this.state.error}
              checkingConnection={this.state.checkingConnection}
            />
          )}
        </SafeAreaView>
      </LinearGradient>
    );
  }
}

const ConfigFields = (props) => {
  const [ip, onChangeIp] = React.useState(ipDefault);
  const [port, onChangePort] = React.useState(portDefault);
  let connectText = "Connect";

  return (
    <View style={styles.configContainer}>
      <View style={styles.configSection}>
        <Text style={styles.configLabel}>IP Address:</Text>
        <TextInput
          keyboardType="numeric"
          style={styles.textInput}
          value={ip}
          name="ip"
          type="text"
          onChangeText={onChangeIp}
        />
      </View>

      <View style={styles.configSection}>
        <Text style={styles.configLabel}>Port:</Text>
        <TextInput
          keyboardType="numeric"
          style={styles.textInput}
          name="port"
          type="text"
          value={port}
          onChangeText={onChangePort}
        />
      </View>
      <View>
        <Pressable
          style={styles.submitConnect}
          onPress={() => {
            props.onConfigSuccess(ip, port);
          }}
        >
          {props.error ? (
            <Text style={styles.buttonText}>Connect</Text>
          ) : (
            <Text style={styles.buttonText}>Connecting...</Text>
          )}
        </Pressable>
      </View>
      {props.error ? (
        <Text style={styles.errorMessage}>Error: cannot connect</Text>
      ) : (
        <Text></Text>
      )}
    </View>
  );
};

class Timer extends React.Component {
  render() {
    return (
      <Text style={styles.timer}>
        <View
          style={this.props.finalRow ? styles.finalTimerBox : styles.timerBox}
        >
          <Text
            style={[styles.timerLabel, styles.whiteText, styles.biggerText]}
          >
            {this.props.name}:
          </Text>
          <Text style={[styles.timerTime, styles.whiteText, styles.biggerText]}>
            {this.props.time}
          </Text>
        </View>
      </Text>
    );
  }
}

class TimerContainer extends React.Component {
  state = {
    timers: [],
    videoTimer: "",
  };

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    ProPresenterApi.fetchTimerData(ipDefault, portDefault).then((response) => {
      this.setState({
        timers: response.data,
      });
    });
    ProPresenterApi.fetchVideoTimerData(ipDefault, portDefault).then(
      (response) => {
        this.setState({
          videoTimer: response.data,
        });
      }
    );
  }

  render() {
    return (
      <View style={[styles.module, styles.timersContainer]}>
        <View style={styles.containerTitle}>
          <Text style={styles.containerTitleText}>Timers</Text>
        </View>

        {this.state.timers.map((timer) => {
          return (
            <Timer
              name={timer.id.name}
              time={timer.time}
              key={timer.id.index}
            />
          );
        })}
        <Timer
          name="Video Countdown"
          time={this.state.videoTimer}
          finalRow="true"
        />
      </View>
    );
  }
}

class Refresh extends React.Component {
  render() {
    return (
      <View style={styles.refreshContainer}>
        <Pressable
          style={styles.refreshButtonPressable}
          onPress={this.props.onRefreshPress}
        >
          <Text style={styles.refreshButton}>Refresh</Text>
        </Pressable>
      </View>
    );
  }
}

class Slide extends React.Component {
  render() {
    return (
      <View style={[styles.slideBox, this.props.currentSlide]}>
        <Image
          source={{ uri: this.props.img }}
          style={[
            {
              width: thumbnailDisplayQuality,
              height: Math.ceil(thumbnailDisplayQuality * 0.5625),
            },
            styles.slideThumbnail,
          ]}
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
    ProPresenterApi.fetchCurrentSlideIndex(ipDefault, portDefault).then(
      (response) => {
        this.setState({
          presentationID: response.data.presentation_index.presentation_id.uuid,
          presentationName:
            response.data.presentation_index.presentation_id.name,
          slideIndex: response.data.presentation_index.index,
        });

        this.buildSlideArray(
          response.data.presentation_index.presentation_id.uuid,
          0
        );
      }
    );
  }

  buildSlideArray(id, index) {
    ProPresenterApi.fetchSlideCount(
      ipDefault,
      portDefault,
      id,
      index,
      thumbnailDisplayQuality
    )
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
    if (thumbnailDisplayQuality + 50 < thumbnailLoadQuality) {
      thumbnailDisplayQuality = thumbnailDisplayQuality + 50;
    } else if (thumbnailDisplayQuality < thumbnailDisplayQuality) {
      thumbnailDisplayQuality = thumbnailLoadQuality;
    }
  };

  decreaseSlideSize = () => {
    if (thumbnailDisplayQuality > 100) {
      thumbnailDisplayQuality = thumbnailDisplayQuality - 50;
    }
  };

  render() {
    let slideImgs = [];
    if (this.state.slideCount > 0) {
      for (let i = 0; i < this.state.slideCount; i++) {
        slideImgs.push(
          <Slide
            img={ProPresenterApi.fetchSlideThumbnail(
              ipDefault,
              portDefault,
              this.state.presentationID,
              i,
              thumbnailLoadQuality
            )}
            slideNumber={i + 1}
            currentSlide={
              this.state.slideIndex === i
                ? styles.currentSlide
                : styles.notCurrentSlide
            }
            key={i}
          />
        );
      }
    }

    return (
      <>
        <View style={styles.module}>
          <View style={[styles.containerTitle]}>
            <Text style={[styles.containerTitleText]}>Presentation</Text>
            <Refresh
              onRefreshPress={this.handlePresentationUpdate}
              style={styles.refreshContainer}
            />
          </View>
          <View style={[styles.presentationBox]}>
            <Text style={[styles.whiteText, styles.biggerText]}>
              {this.state.presentationName}
            </Text>
          </View>

          <Text
            style={[
              styles.slideCount,
              styles.finalPresentationBox,
              styles.whiteText,
              styles.biggerText,
            ]}
          >
            {this.state.slideIndex + 1} / {this.state.slideCount}
          </Text>
        </View>

        <View style={styles.module}>
          <View style={styles.containerTitle}>
            <Text style={styles.containerTitleText}>
              Slides
              <View style={styles.slidesSizeButtonsContainer}>
                <Pressable
                  style={[styles.slidesSizeForm]}
                  onPress={this.increaseSlideSize}
                >
                  <Text style={styles.slidesSizeButtons}>+</Text>
                </Pressable>
                <Pressable
                  style={[styles.slidesSizeForm]}
                  onPress={this.decreaseSlideSize}
                >
                  <Text style={styles.slidesSizeButtons}>-</Text>
                </Pressable>
              </View>
            </Text>
          </View>
          <View style={styles.containerSlides}>{slideImgs}</View>
        </View>
      </>
    );
  }
}

export default PageContainer;

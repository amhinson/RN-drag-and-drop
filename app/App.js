import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  Dimensions
} from 'react-native';

class App extends Component {
  state = {
    dropZoneValues: null,
    hover: false,
    pan: new Animated.ValueXY(),
    showDraggable: true
  };

  componentWillMount() {
    this._animatedValueX = 0;
    this._animatedValueY = 0;

    this.state.pan.x.addListener(value => (this._animatedValueX = value.value));
    this.state.pan.y.addListener(value => (this._animatedValueY = value.value));

    this.state.pan.y.addListener(({ value }) => {
      if (value <= 230 && this.state.hover) {
        this.setState({ hover: false });
      } else if (value > 230 && !this.state.hover) {
        this.setState({ hover: true });
      }
    });

    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({
          x: this._animatedValueX,
          y: this._animatedValueY
        });
        this.state.pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: this.state.pan.x, dy: this.state.pan.y }
      ]),
      onPanResponderRelease: (e, gesture) => {
        if (this.isDropZone(gesture)) {
          this.setState({ showDraggable: false, hover: false });
        } else {
          Animated.spring(this.state.pan, {
            toValue: 0
          }).start();
        }
      }
    });
  }

  componentWillUnmount() {
    this.state.pan.x.removeAllListeners();
    this.state.pan.y.removeAllListeners();
  }

  isDropZone(gesture) {
    const dz = this.state.dropZoneValues;
    return gesture.moveY > dz.y && gesture.moveY < dz.y + dz.height;
  }

  setDropZoneValues = event => {
    this.setState({ dropZoneValues: event.nativeEvent.layout });
  };

  renderDraggable() {
    if (this.state.showDraggable) {
      return (
        <View style={styles.draggableContainer}>
          <Animated.View
            {...this._panResponder.panHandlers}
            style={[this.state.pan.getLayout(), styles.circle]}
          >
            <Text style={styles.text}>STUFF!</Text>
          </Animated.View>
        </View>
      );
    }
    return null;
  }

  renderText() {
    const { hover, showDraggable } = this.state;
    if (hover) {
      return 'DROP STUFF NOW!';
    } else if (!showDraggable) {
      return 'ADDED STUFF!';
    }
    return 'DROP ZONE!';
  }

  render() {
    const { hover, showDraggable } = this.state;
    return (
      <View style={styles.mainContainer}>
        <View
          onLayout={this.setDropZoneValues}
          style={[
            styles.dropZone,
            hover ? styles.dropZoneHover : null,
            !showDraggable ? styles.dropZoneAdded : null
          ]}
        >
          <Text style={styles.text}>
            {this.renderText()}
          </Text>
        </View>
        {this.renderDraggable()}
      </View>
    );
  }
}

let Window = Dimensions.get('window');
let styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  dropZone: {
    height: 100,
    backgroundColor: 'steelblue'
  },
  dropZoneHover: {
    backgroundColor: 'dodgerblue'
  },
  dropZoneAdded: {
    backgroundColor: 'limegreen'
  },
  text: {
    marginTop: 25,
    marginLeft: 5,
    marginRight: 5,
    textAlign: 'center',
    color: '#fff'
  },
  draggableContainer: {
    position: 'absolute',
    top: Window.height / 2 - 35,
    left: Window.width / 2 - 35
  },
  circle: {
    backgroundColor: 'darkslategray',
    width: 70,
    height: 70,
    borderRadius: 5
  }
});

export default App;

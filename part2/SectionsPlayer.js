import React from 'react';
import PropTypes from 'prop-types';
import payload from './mock-payload.js'
import videojs from 'video.js'
import "video.js/dist/video-js.css";
import SectionsPlayerTimeline from "./components/SectionsPlayerTimeline/SectionsPlayerTimeline";
import SectionsPlayerControlBar from "./components/SectionsPlayerControlBar/SectionsPlayerControlBar";
import Box from "@components/ui/Box";
import styles from "./SectionsPlayer.ns.scss";
import SectionsMap from './components/SectionsMap/SectionsMap';
import { withResizeDetector } from 'react-resize-detector';


const SPEED_OPTIONS = [0.5, 0.75, 1, 1.5, 2];

class SectionsPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      totalDuration: 0,
      currentDuration: 0,
      offset: 0,
      isFullScreen: false,
      isMap: true,
      currentGpsIndex: 0,
      currentSectionIndex: 0
    };

    this.onJump = this.onJump.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onResume = this.onResume.bind(this);
    this.resetPlayer = this.resetPlayer.bind(this);
    this.onChangeSpeed = this.onChangeSpeed.bind(this);
    this.onChangeVolume = this.onChangeVolume.bind(this);
    this.onSkip = this.onSkip.bind(this);
    this.onToggleFullScreen = this.onToggleFullScreen.bind(this);
    this.onToggleMap = this.onToggleMap.bind(this);
  }
  componentDidMount() {
    this.setTotalVideoDuration();
    this.initVideo();
  }

  setTotalVideoDuration() {
    const totalDuration = this.props.sections.reduce((accumulator, currentValue) =>
      currentValue.duration + accumulator, 0
    )
    this.setState({totalDuration});
  }

  initVideo() {
    const { sections } = this.props;
    const videoJsOptions = {
      autoplay: false,
      controls: false,
      fluid: true,
      sources: [{
        src: sections[0].video.source.src,
        type: sections[0].video.source.type
      }],
      ...this.props.videoConfig
    };

    this.player = videojs(this.videoNode, videoJsOptions)

    this.player.on('timeupdate', () => {
      if (this.player.currentTime() > 0) {
        this.setState({
          currentDuration: this.state.offset + this.player.currentTime(),
          currentGpsIndex: Math.floor(this.player.currentTime())
        });
      }
      const perc = (this.player.currentTime() / this.player.duration() * 100).toFixed(2);
      if (perc > 99.5) {
        this.nextTrack();
      }
    });

    this.player.on('ended', () => this.nextTrack());
  }

  calculateDuration(index) {
    const {sections} = this.props;
    var total = 0;
    for (var i = 0; i < index; i++) {
      total += sections[i].duration;
    }
    return total;
  }

  nextTrack() {
    const {sections} = this.props;
    const currentSrc = this.player.currentSrc();
    const index = sections.findIndex(section => section.video.source.src === currentSrc);
    if (!sections[index + 1]) {
      this.resetPlayer();
      return;
    }

    this.player.src(sections[index + 1].video.source.src);
    this.player.autoplay(true);
    const offset = this.calculateDuration(index + 1);
    this.setState({offset: offset, currentSectionIndex: index + 1, currentGpsIndex: 0});
  }

  resetPlayer() {
    const {sections} = this.props;
    this.player.reset();
    this.player.autoplay(false);
    this.player.src(sections[0].video.source.src);
    this.player.pause();
    this.setState({offset: 0, currentDuration: 0, currentSectionIndex: 0, currentGpsIndex: 0});
  }

  onJump(time, index) {
    const {sections} = this.props;
    const total = this.calculateDuration(index);
    const sectionTime = time - total;
    if (!sections[index]) {
      return;
    }
    if (this.player.currentSrc() !== sections[index].video.source.src) {
      this.player.src(sections[index].video.source.src);
    }
    this.setState({offset: total, currentDuration: total + sectionTime, currentSectionIndex: index});
    this.player.currentTime(sectionTime);
    this.player.autoplay(true);
  }

  onPause() {
    this.player.pause();
  }

  onResume() {
    this.player.play();
  }

  onToggleMap() {
    this.setState({isMap: !this.state.isMap});
  }

  onToggleFullScreen() {
    const isFullScreen = this.player.isFullscreen();
    if (isFullScreen) {
      this.player.exitFullWindow();
    } else {
      this.player.enterFullWindow();
    }
    this.setState({isFullScreen: !isFullScreen});
  }

  onSkip(value) {
    const {sections} = this.props;
    const total = this.player.currentTime() + value;
    const index = sections.findIndex(section => section.video.source.src === this.player.currentSrc());
    const playerDuration = this.player.duration();

    // in the same section
    if (total < playerDuration) {
      this.player.currentTime(total);
    }

    // next section
    if (total >= playerDuration) {
      this.onJump(total - playerDuration, index + 1);
    }

    // previous section
    if ((total < 0) && sections[index - 1]) {
      this.onJump(sections[index - 1].duration + total, index - 1);
    }
  }

  onChangeVolume(value) {
    this.player.volume(value / 100);
  }

  onChangeSpeed(value) {
    this.player.playbackRate(value);
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  render() {
    const {sections, containerStyle, width} = this.props;

    const {totalDuration, currentDuration, isFullScreen, isMap, currentSectionIndex, currentGpsIndex} = this.state;
    const currentGpsPosition = sections[currentSectionIndex].gpsroute[currentGpsIndex].point;
    return (
      <Box position="relative" {...containerStyle}>
        {isMap && <SectionsMap
          mapSize={width && width * .15 || 100}
          sections={sections} currentPosition={currentGpsPosition} isFullScreen={isFullScreen}
        />}

        <div data-vjs-player>
          <video ref={ node => this.videoNode = node } className="video-js"></video>
        </div>

        {this.player && (
          <Box className={isFullScreen && styles.fullScreenControl}>
            <SectionsPlayerTimeline
              onJump={this.onJump}
              totalDuration={totalDuration}
              currentDuration={currentDuration}
              sections={sections}
            />
            <SectionsPlayerControlBar
              isPause={this.player.paused()}
              onPause={this.onPause}
              volume={this.player.volume() * 100}
              onChangeVolume={this.onChangeVolume}
              speedTypes={SPEED_OPTIONS}
              speed={this.player.playbackRate()}
              isMap={isMap}
              onChangeSpeed={this.onChangeSpeed}
              onResume={this.onResume}
              onToggleFullScreen={this.onToggleFullScreen}
              onToggleMap={this.onToggleMap}
              onSkip={this.onSkip}
            />
          </Box>
        )}
      </Box>
    )
  }
}

SectionsPlayer.propTypes = {
  sections: PropTypes.array,
  videoConfig: PropTypes.object,
  containerStyle: PropTypes.object
};

SectionsPlayer.defaultProps = {
  sections: payload.sections,
  videoConfig: {},
  containerStyle: {},
};

export default withResizeDetector(SectionsPlayer)


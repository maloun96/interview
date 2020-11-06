import React, {useRef, useState} from "react";
import {
  Popover,
  PopoverArrow, PopoverBody,
  PopoverContent,
  PopoverTrigger
} from "@chakra-ui/core";
import Flex from "@components/ui/Flex";
import {secondsToTime} from "@utils/time";
import Box from "@components/ui/Box";
import styles from "./SectionsPlayerTimeline.ns.scss";

const Section = ({section, width, onClick, onClickMarker}) => (
  <Box zIndex="1" style={{width: width + "%"}} onClick={onClick}>
    <Popover trigger="hover" placement="top">
      <PopoverTrigger>
        <Box onClick={onClickMarker} className="marker" bg="red.600" cursor="pointer" display="block" h="10px" w="3px"/>
      </PopoverTrigger>
      <PopoverContent className="marker-popover" zIndex={4}>
        <PopoverArrow />
        <PopoverBody >
          <Flex justify={"center"} >
            {section.title}
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  </Box>
)

const SectionsPlayerTimeline = ({totalDuration, currentDuration, sections, onJump}) => {
  const timeline = useRef();
  const tooltip = useRef();
  const [tooltipValue, setTooltipValue] = useState(false);

  const calculatePartOf = (value, totalValue) => ((value * 100) / totalValue).toFixed(2);

  const getDurationWidth = () => {
    return calculatePartOf(currentDuration, totalDuration)
  };

  const getSectionWidth = (section) => {
    return calculatePartOf(section.duration, totalDuration);
  };

  const onClick = (e, index) => {
    const {currentDuration} = getCurrentDuration(e);
    onJump(currentDuration, index);
  }

  const onClickMarker = (e, index) => {
    e.stopPropagation();
    onJump(0, index);
  }

  const onHover = (e) => {
    const {width, height} = tooltip.current.getBoundingClientRect();
    const {currentTime} = getCurrentDuration(e);
    const x = e.clientX;
    const y = e.clientY;
    tooltip.current.style.top = (y - (height + 10)) + 'px';
    tooltip.current.style.left = (x - (width / 2)) + 'px';
    tooltip.current.style.visibility = 'visible';
    setTooltipValue(currentTime);
  }

  const onMouseLeave = () => {
    tooltip.current.style.visibility = 'hidden';
    setTooltipValue(false);
  }

  const getCurrentDuration = (e) => {
    const {x, width} = timeline.current.getBoundingClientRect();
    const difference = e.pageX - x;

    const currentDuration = (difference * totalDuration) / width;
    const currentTime = secondsToTime(currentDuration);

    return {currentDuration, currentTime};
  }

  return (
    <Flex
      onMouseMove={onHover}
      onMouseLeave={onMouseLeave} ref={timeline}
      zIndex="2"
      position="relative"
      w="100%"
      h="10px"
      bg="coolgray.300"
    >
      <Box display="block" position="absolute" h="10px" bg="red.400" style={{width: getDurationWidth() + "%"}}></Box>
      {sections.map((section, index) => (
        <Section
          key={section.id} section={section}
          onClick={(e) => onClick(e, index)}
          onClickMarker={(e) => onClickMarker(e, index)}
          width={getSectionWidth(section)}
        />
      ))}
      <span ref={tooltip} className={styles.tooltiptext}>{tooltipValue}</span>
    </Flex>
  )
};

export default SectionsPlayerTimeline;


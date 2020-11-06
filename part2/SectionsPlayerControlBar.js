import React, {memo} from "react";
import Icon from "@components/ui/Icon";
import Flex from "@components/ui/Flex";
import Slider from "@components/ui/Slider";
import {SliderFilledTrack, SliderTrack} from "@chakra-ui/core";
import MenuButton from "@components/ui/Menu/MenuButton";
import Menu from "@components/ui/Menu/Menu";
import MenuList from "@components/ui/Menu/MenuList";
import MenuItem from "@components/ui/Menu/MenuItem";
import Grid from "@chakra-ui/core/dist/Grid";
import styles from "./SectionsPlayerControlBar.ns.scss";

const SKIP_VALUE = 10;


const SectionsPlayerControlBar = (props) => {
  const {
    isPause, 
    onResume, 
    onPause, 
    onChangeVolume, 
    volume, 
    speedTypes, 
    speed, 
    onChangeSpeed, 
    onSkip, 
    onToggleFullScreen,
    onToggleMap,
    isMap,
  } = props;
  const icon = isPause ? 'play' : 'pause';

  const getVolumeIcon = () => {
    if (volume === 0) {
      return 'volume-off';
    }

    if (volume < 50) {
      return 'volume-down'
    }

    return 'volume-up';
  }
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={6} bg="coolgray.600" h="60px" px="15px">
      <Flex justify="flex-start" align="center" direction="row" w="100%">
        <Icon name={getVolumeIcon()} color="#fff" fontSize={22}/>
        <Slider 
          defaultValue={volume} 
          className={styles.SPC__slider} 
          style={{width: "100px"}} 
          ml="10px" 
          onChange={onChangeVolume}
        >
          <SliderTrack bg="coolgray.400"/>
          <SliderFilledTrack bg="#fff"/>
        </Slider>
      </Flex>
      <Flex justify="center" align="center" w="100%" >
        <Flex align="center" justify="center" onClick={() => onSkip(-SKIP_VALUE)} cursor="pointer">
          <Icon name="fast-rewind" color="#fff" fontSize={22} />
        </Flex>
        <Flex 
          align="center" 
          border="2px" 
          borderColor="#fff" 
          borderRadius="100%" 
          justify="center" 
          cursor="pointer" 
          mx="10px" 
          p="5px" 
          onClick={isPause ? onResume : onPause} 
        >
          <Icon name={icon} color="#fff" fontSize={22} />
        </Flex>
        <Flex align="center" justify="center" onClick={() => onSkip(SKIP_VALUE)} cursor="pointer">
          <Icon name="fast-forward" color="#fff" fontSize={22} />
        </Flex>
      </Flex>
      <Flex justify="flex-end" align="center"  w="100%" >
        <Flex justify="flex-end" align="center" direction="row" w="100%">
          <Icon 
            name={isMap ? 'view-off' : 'view'} 
            color="#fff" 
            fontSize={32} 
            mr="15px" 
            alt="TEST"
            cursor="pointer" 
            onClick={onToggleMap}
          />
          <Menu autoSelect={false} >
            <MenuButton>
              <Icon name="time" color="#fff" fontSize={22} />
            </MenuButton>
            <MenuList bg="coolgray.600" zIndex={9}>
              {speedTypes.map((value, index) =>
                <MenuItem
                  onClick={() => onChangeSpeed(value)}
                  bg={value === speed ? 'coolgray.100' : 'coolgray.600'}
                  color={value === speed ? '#000' : '#fff'}
                  key={index} 
                  className={styles.SPC__menu_item}
                >
                  x{value}
                </MenuItem>
              )}
            </MenuList>
          </Menu>
          <Icon 
            name="fullscreen-in" 
            color="#fff" 
            fontSize={32} 
            ml="10px" 
            cursor="pointer" 
            onClick={onToggleFullScreen}
          />
        </Flex>
      </Flex>
    </Grid>
  );
};

export default memo(SectionsPlayerControlBar);


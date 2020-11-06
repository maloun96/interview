import React from "react";
import Map from '@components/ui/Map/Map/Map';
import { Polyline, CircleMarker } from 'react-leaflet';
import {chain} from "lodash";
import styles from "./SectionsMap.ns.scss";
import useMemo from '@hooks/useMemo';
import Box from "@components/ui/Box";

const SectionsMap = ({mapSize, sections, currentPosition, isFullScreen}) => {
    const allpoints = useMemo(() => {
        return chain(sections)
        .map(section => section.gpsroute)
        .flatten()
        .map(gpsroute => gpsroute.point)
        .value();
    }, [sections]);

    const firstPointOfSection = (index) => sections[index].gpsroute[0].point

    const getSectionMarker = (index) => (
        <CircleMarker
            key={index}
            center={firstPointOfSection(index)}
            stroke="false"
            color="#EC0016"
            fillOpacity="1"
            zIndex={1}
            radius={5}
        />
    );

    return (
        <div className={[styles.mapContainer, isFullScreen ? styles.isFullScreen : ''].join(' ')}>
            <Box width={mapSize} height={mapSize} position="relative">
                     <Map key={mapSize} center={currentPosition} bounds={allpoints} zoomControl={false}>
                         <Polyline positions={allpoints} color="#EC0016"/>

                         {sections.map((section, index) => getSectionMarker(index))}

                         <CircleMarker
                           center={currentPosition}
                           stroke="false"
                           color="#408335"
                           fillOpacity="1"
                           zIndex={2}
                           radius={5}
                         />
                     </Map>
            </Box>
        </div>
    )
};

export default SectionsMap;


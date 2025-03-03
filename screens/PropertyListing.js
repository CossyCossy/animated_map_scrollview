import { useRef, useState, useEffect } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  Animated,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform, Easing, StatusBar
} from "react-native"
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { ListingCard } from '../components';
import { COLORS, dummyData, SIZES, theme } from "../constants";
import images from '../constants/images';


const CARD_WIDTH = SIZES.width * 0.8;
const SPACING_FOR_CARD_INSET = SIZES.width * 0.1 - 10;

//
const PropertyListing = ({ ...props }) => {
  const [region, setRegion] = useState(null)
  const mapView = useRef(null);
  const _scrollView = useRef(null);

  let mapIndex = 0;
  let mapAnimation = new Animated.Value(0);

  const initialMapState = {
    region: {
      latitude: 9.675322614439349,
      longitude: 42.039529737085104,
      latitudeDelta: 100.71837826448541,
      longitudeDelta: 72.32143867760897,
    },
  };

  useEffect(() => {

    setRegion(initialMapState.region)

    mapAnimation.addListener(({ value }) => {
      let index = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
      if (index >= dummyData?.propertyData.length) {
        index = dummyData?.propertyData.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }

      clearTimeout(regionTimeout);

      const regionTimeout = setTimeout(() => {
        if (mapIndex !== index) {
          mapIndex = index;
          const { location } = dummyData?.propertyData[index];
          const coordinates = {
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
          }
          mapView.current.animateToRegion(
            {
              ...coordinates,
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            },
            350
          );
        }
      }, 10);
    });

    if (region !== null) {
      // zoomIn()
    }

    //zoomIn()

  }, [])

  const interpolations = dummyData.propertyData.map((marker, index) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      ((index + 1) * CARD_WIDTH),
    ];
    const scale = mapAnimation.interpolate({
      inputRange,
      outputRange: [10, 15, 10],
      extrapolate: "clamp",
    });
    const opacity = mapAnimation.interpolate({
      inputRange,
      outputRange: [0.35, 1, 0.35],
      extrapolate: "clamp",
    });
    return { scale, opacity };

  });


  function zoomIn() {
    let newRegion = {
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2
    }

    setRegion(newRegion)
    mapView.current.animateToRegion(newRegion, 200)
  }

  function AnimatedScrollView() {

    return (
      <Animated.ScrollView
        ref={_scrollView}
        horizontal
        pagingEnabled
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 20}
        snapToAlignment="center"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingVertical: 10,
        }}
        contentInset={{
          top: 0,
          left: SPACING_FOR_CARD_INSET,
          bottom: 0,
          right: SPACING_FOR_CARD_INSET
        }}
        contentContainerStyle={{
          paddingHorizontal: Platform.OS === 'android' ? SPACING_FOR_CARD_INSET : 0
        }}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: mapAnimation,
                }
              },
            },
          ],
          { useNativeDriver: true }
        )}
      >
        {dummyData.propertyData.map((marker, index) => (

         <ListingCard key={index} marker = {marker}/>
        ))}
        
      </Animated.ScrollView>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      }}>

      <MapView
        style={{
          height: SIZES.height,
          width: SIZES.width,
        }}
        customMapStyle={theme.MAP_DARK_THEME}
        initialRegion={region}
        ref={mapView}
      >
        {dummyData.propertyData.map((marker, index) => {
          const scaleStyle = {
            transform: [
              {
                scale: interpolations[index].scale,
              },
            ],
          };

          const opacityStyle = {
            opacity: interpolations[index].opacity,
          };

          const coords = {
            latitude: marker.location.latitude,
            longitude: marker.location.longitude
          };

          return (
            <MapView.Marker key={index} coordinate={coords}>
              <Animated.View
                style={[{
                  alignItems: "center",
                  justifyContent: "center",
                }, opacityStyle]}
              >
                <Animated.View
                  style={[{
                    width: 30,
                    height: 30,
                    borderRadius: 12,
                    backgroundColor: "rgba(130,4,150, 0.3)",
                    position: "absolute",
                    borderWidth: 1,
                    borderColor: "rgba(130,4,150, 0.5)",
                  }, scaleStyle]} />
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 4,
                  backgroundColor: "rgba(130,4,150, 0.9)",
                }} />
              </Animated.View>
            </MapView.Marker>
          )

        })}
      </MapView>

      {/* animated scrollview */}
      <AnimatedScrollView />

    </View>
  )

}

export default PropertyListing;

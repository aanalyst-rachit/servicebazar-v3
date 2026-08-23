import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

type OSMMapProps = {
  latitude: number;
  longitude: number;
  draggable?: boolean;
  onLocationChange?: (
    latitude: number,
    longitude: number
  ) => void;
};

export default function OSMMap({
  latitude,
  longitude,
  draggable = false,
  onLocationChange,
}: OSMMapProps) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta
    name="viewport"
    content="width=device-width,
    initial-scale=1.0,
    maximum-scale=1.0,
    user-scalable=no"
  />

  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }

    body {
      overflow: hidden;
    }
  </style>
</head>

<body>

<div id="map"></div>

<script>

  const lat = ${latitude};
  const lng = ${longitude};
  const draggable = ${draggable ? 'true' : 'false'};

  const map = L.map('map', {
    zoomControl: true,
    attributionControl: true
  }).setView([lat, lng], 15);

  L.tileLayer(
    'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; OpenStreetMap contributors &copy; CARTO'
    }
  ).addTo(map);

  const marker = L.marker(
    [lat, lng],
    {
      draggable: draggable
    }
  ).addTo(map);

  marker.bindPopup(
    'Dukan Location'
  );

  ${
    draggable
      ? `
  marker.on('dragend', function(event) {

    const position =
      event.target.getLatLng();

    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        latitude: position.lat,
        longitude: position.lng
      })
    );

  });
  `
      : ''
  }

</script>

</body>
</html>
`;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        onMessage={event => {
          try {
            const data = JSON.parse(
              event.nativeEvent.data
            );

            if (
              typeof data.latitude === 'number' &&
              typeof data.longitude === 'number'
            ) {
              onLocationChange?.(
                data.latitude,
                data.longitude
              );
            }
          } catch (error) {
            console.log(
              'OSM map message error:',
              error
            );
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
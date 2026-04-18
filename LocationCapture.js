import * as Location from "expo-location";
import { useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";

export default function LocationCapture() {
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    city: "Not set",
  });

  const fetchLocation = async () => {
    setLoading(true);
    try {
      // 1. Request OS permission to use GPS
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        setLoading(false);
        return;
      }

      // 2. Get Latitude and Longitude
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Balances speed and battery life
      });

      const { latitude, longitude } = currentLocation.coords;

      // 3. Reverse Geocode to get the City/Address name
      let geocodeResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      // 4. Extract the city (or subregion if city is null in rural areas)
      if (geocodeResult.length > 0) {
        const addressDetails = geocodeResult[0];
        const cityName =
          addressDetails.city ||
          addressDetails.subregion ||
          addressDetails.region ||
          "Unknown City";

        setLocationData({
          latitude,
          longitude,
          city: cityName,
        });
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("Could not fetch location. Ensure GPS is enabled.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Get My Location" onPress={fetchLocation} />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <View style={{ marginTop: 20 }}>
          <Text>City: {locationData.city}</Text>
          <Text>Lat: {locationData.latitude}</Text>
          <Text>Lng: {locationData.longitude}</Text>
        </View>
      )}
    </View>
  );
}

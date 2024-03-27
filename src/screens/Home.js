import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, Button } from "react-native";
import { refresh, authenticate, isLoggedIn } from "../auth/SpotifyAuth";
import {
  getCurrentUserTopTracks,
  getCurrentUserRecentlyPlayedTracks,
} from "../api/userApi";
import RecentlyPlayed from "../components/RecentlyPlayed";
import TopTracks from "../components/TopTracks";
import * as SecureStore from "expo-secure-store";

const getAccessToken = async () => {
  try {
    const expirationTime = await SecureStore.getItemAsync(
      "spotifyExpirationTime"
    );
    if (new Date().getTime() > new Date(expirationTime)) {
      await refresh();
    }
    const accessToken = await SecureStore.getItemAsync("spotifyAccessToken");
    return accessToken;
  } catch (error) {
    console.error("Error retrieving access token:", error);
    return null;
  }
};

const fetchAccessToken = async (setAccessToken) => {
  const accessToken = await getAccessToken();
  if (accessToken) {
    setAccessToken(accessToken);
    console.log("Access token:", accessToken);
  }
};

const HomeScreen = () => {
  const [accessToken, setAccessToken] = useState(null);
  useEffect(() => {
    fetchAccessToken(setAccessToken);
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Sound Share!</Text>
      {isLoggedIn() ? null : (
        <Button
          title="Login To Spotify"
          onPress={() => {
            authenticate();
          }}
        />
      )}
      <RecentlyPlayed accessToken={accessToken} limit={10} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  text: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
    marginHorizontal: 30,
  },
});

export default HomeScreen;

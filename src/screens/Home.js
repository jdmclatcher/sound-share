import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { refresh, authenticate, isLoggedIn } from "../auth/SpotifyAuth";
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
  }
};

const HomeScreen = () => {
  const [accessToken, setAccessToken] = useState(null);
  useEffect(() => {
    fetchAccessToken(setAccessToken);
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sound Share</Text>
      {isLoggedIn() ? (
        <Text style={styles.text}>
          Welcome to Sound Share! Select a song from your Spotify history below
          to begin reviewing music.
        </Text>
      ) : (
        <View>
          <Text style={styles.text}>
            Click the button below to login to Spotify and start reviewing
            music.
          </Text>
          <Button
            title="Login To Spotify"
            onPress={() => {
              authenticate();
            }}
          />
        </View>
      )}
      <RecentlyPlayed accessToken={accessToken} limit={10} />
      <TopTracks accessToken={accessToken} limit={10} />
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
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 10,
    paddingTop: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: "center",
    marginHorizontal: 30,
  },
});

export default HomeScreen;

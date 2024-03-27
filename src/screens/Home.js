import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { SpotifyLogin, isLoggedIn } from "../auth/SpotifyAuth";
import {
  getCurrentUserTopTracks,
  getCurrentUserRecentlyPlayedTracks,
} from "../api/userApi";
import * as SecureStore from "expo-secure-store";

const getAccessToken = async () => {
  try {
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
      <Text style={styles.heading}>Welcome to Sound Share!</Text>
      <Text style={styles.text}>
        Login and connect your Spotify account below to begin.
      </Text>
      {/* {!isLoggedIn && <SpotifyLogin />} */}
      <SpotifyLogin />
      {/* <TopTracks accessToken={accessToken} limit={10} /> */}
      <RecentlyPlayed accessToken={accessToken} />
    </View>
  );
};

const TopTracks = ({ accessToken, limit }) => {
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const tracks = await getCurrentUserTopTracks(accessToken, limit);
        setTopTracks(tracks);
        console.log("Top tracks:", tracks);
      } catch (error) {
        console.error("Error fetching top tracks:", error);
      }
    };

    if (accessToken) {
      fetchTopTracks();
    }
  }, [accessToken]);

  const renderItem = ({ item }) => (
    <View style={styles.trackContainer}>
      <Image source={{ uri: item.albumArt }} style={styles.albumArt} />
      <Text style={styles.trackName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Top Tracks</Text>
      <FlatList
        data={topTracks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const RecentlyPlayed = ({ accessToken }) => {
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      try {
        const tracks = await getCurrentUserRecentlyPlayedTracks(accessToken);
        setRecentlyPlayed(tracks);
        console.log("Recently played tracks:", tracks);
      } catch (error) {
        console.error("Error fetching recently played tracks:", error);
      }
    };
    if (accessToken) {
      fetchRecentlyPlayed();
    }
  }, [accessToken]);
  const renderItem = ({ item }) => (
    <View style={styles.trackContainer}>
      <Image source={{ uri: item.albumArt }} style={styles.albumArt} />
      <Text style={styles.trackName}>{item.name}</Text>
    </View>
  );
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Recently Played</Text>
      <FlatList
        data={recentlyPlayed}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
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
  trackHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  trackContainer: {
    marginRight: 10,
    alignItems: "center",
  },
  albumArt: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  trackName: {
    marginTop: 5,
    textAlign: "center",
  },
});

export default HomeScreen;

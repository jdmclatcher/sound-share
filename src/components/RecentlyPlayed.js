import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Button,
  ScrollView,
} from "react-native";
import { getCurrentUserRecentlyPlayedTracks } from "../api/userApi";
import { getSongById } from "../api/searchApi";

const RecentlyPlayed = ({ accessToken, limit }) => {
  const [trackDetails, setTrackDetails] = useState([]);

  useEffect(() => {
    const fetchRecentlyPlayedTracks = async () => {
      try {
        const recentlyPlayed = await getCurrentUserRecentlyPlayedTracks(
          accessToken,
          limit
        );
        if (recentlyPlayed) {
          const trackIds = recentlyPlayed.items.map((item) => item.track.id);
          const details = await Promise.all(
            trackIds.map((id) => getSongById(accessToken, id))
          );
          setTrackDetails(details);
        }
      } catch (error) {
        console.error("Error fetching recently played tracks:", error);
      }
    };

    fetchRecentlyPlayedTracks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Recently Played</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {trackDetails &&
          trackDetails.map((item) => (
            <View key={item.id} style={styles.trackContainer}>
              <Image
                source={{ uri: item.album.images[0].url }}
                style={styles.albumArt}
              />
              <Text style={styles.trackName}>{item.name}</Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    height: "25%",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    marginLeft: 10,
    paddingBottom: 10,
  },
  trackHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  trackContainer: {
    marginLeft: 10,
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

module.exports = RecentlyPlayed;

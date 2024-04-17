import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getCurrentUserRecentlyPlayedTracks } from "../api/userApi";
import { getSongById } from "../api/searchApi";
import { useNavigation } from "@react-navigation/native";

const RecentlyPlayed = ({ accessToken, limit }) => {
  const [trackDetails, setTrackDetails] = useState([]);

  useEffect(() => {
    if (accessToken) {
      const fetchRecentlyPlayedTracks = () => {
        getCurrentUserRecentlyPlayedTracks(accessToken, limit)
          .then((recentlyPlayed) => {
            if (recentlyPlayed && recentlyPlayed.items) {
              const trackIds = recentlyPlayed.items.map(
                (item) => item.track.id
              );
              const uniqueTrackIds = [...new Set(trackIds)];
              return Promise.all(
                uniqueTrackIds.map((id) => getSongById(accessToken, id))
              );
            }
            return [];
          })
          .then((details) => {
            setTrackDetails(details);
          })
          .catch((error) => {
            console.error("Error fetching recently played tracks:", error);
          });
      };

      fetchRecentlyPlayedTracks();
    }
  }, [accessToken]);

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Recently Played</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
        {trackDetails &&
          trackDetails.map((item) => (
            <View key={item.id} style={styles.trackContainer}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("AddReview", {
                    id: item.id,
                    type: 0,
                  })
                }
                style={styles.touchableContainer}
              >
                <Image
                  source={{ uri: item.album.images[0].url }}
                  style={styles.albumArt}
                />
                <Text style={styles.trackName}>{item.name}</Text>
              </TouchableOpacity>
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
    marginLeft: 5,
    marginRight: 10,
    alignItems: "center",
  },
  touchableContainer: {
    alignItems: "center",
    width: 110, 
  },
  albumArt: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  trackName: {
    marginTop: 5,
    textAlign: "center",
    flexWrap: "wrap",
    fontSize: 12,
  },
});

export default RecentlyPlayed;

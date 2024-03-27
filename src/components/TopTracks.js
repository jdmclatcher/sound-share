import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getCurrentUserTopTracks } from "../api/userApi";
import { getSongById } from "../api/searchApi";
import { useNavigation } from "@react-navigation/native";

const TopTracks = ({ accessToken, limit }) => {
  const [trackDetails, setTrackDetails] = useState([]);

  useEffect(() => {
    if (accessToken) {
      const fetchTopTracks = () => {
        getCurrentUserTopTracks(accessToken, limit)
          .then((topTracks) => {
            if (topTracks && topTracks.items) {
              const trackIds = topTracks.items.map((item) => item.id);
              return Promise.all(
                trackIds.map((id) => getSongById(accessToken, id))
              );
            }
            return [];
          })
          .then((details) => {
            setTrackDetails(details);
          })
          .catch((error) => {
            console.error("Error fetching top tracks:", error);
          });
      };

      fetchTopTracks();
    }
  }, [accessToken]);

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Top Tracks</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {trackDetails &&
          trackDetails.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.trackContainer}
              onPress={() =>
                navigation.navigate("AddReview", {
                  id: item.id,
                  type: "track",
                })
              }
            >
              <Image
                source={{ uri: item.album.images[0].url }}
                style={styles.albumArt}
              />
              <Text style={styles.trackName}>{item.name}</Text>
            </TouchableOpacity>
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

module.exports = TopTracks;

import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, Button } from "react-native";
import { getCurrentUserTopTracks } from "../api/userApi";

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
  trackHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  trackContainer: {
    marginRight: 10,
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

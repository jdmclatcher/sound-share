import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getCurrentUserTopArtists } from "../api/userApi";
import { getArtistById } from "../api/searchApi";
import { useNavigation } from "@react-navigation/native";

const TopArtists = ({ accessToken, limit }) => {
  const [artistDetails, setArtistDetails] = useState([]);

  useEffect(() => {
    if (accessToken) {
      const fetchTopArtists = () => {
        getCurrentUserTopArtists(accessToken, limit)
          .then((topArtists) => {
            if (topArtists && topArtists.items) {
              const artistIds = topArtists.items.map((item) => item.id);
              return Promise.all(
                artistIds.map((id) => getArtistById(accessToken, id))
              );
            }
            return [];
          })
          .then((details) => {
            setArtistDetails(details);
          })
          .catch((error) => {
            console.error("Error fetching artists:", error);
          });
      };

      fetchTopArtists();
    }
  }, [accessToken]);

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Top Artists This Month</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
        {artistDetails &&
          artistDetails.map((item) => (
            <View key={item.id} style={styles.artistContainer}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ArtistProfile", {
                    id: item.id,
                    type: 0,
                  })
                }
                style={styles.touchableContainer}
              >
                <Image
                  source={{ uri: item.images && item.images[0] ? item.images[0].url : '' }}
                  style={styles.artistArt}
                />
                <Text style={styles.artistName}>{item.name}</Text>
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
  artistContainer: {
    marginLeft: 5,
    marginRight: 10,
    alignItems: "center",
  },
  touchableContainer: {
    alignItems: "center",
    width: 110,
  },
  artistArt: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  artistName: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 12,
    flexWrap: "wrap",
  },
});

export default TopArtists;

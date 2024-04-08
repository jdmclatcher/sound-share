import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getArtistById, getTopTracksOfArtist } from "../api/searchApi.js";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { refresh } from "../auth/SpotifyAuth.js";

const ArtistProfile = ({ route }) => {
  const navigation = useNavigation();

  const [musicData, setMusicData] = useState(null);
  const [artistName, setArtistName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [artistImage, setArtistImage] = useState(""); 

  const { id, type } = route.params;

  useEffect(() => {
    const fetchAccessToken = async () => {
      setIsLoading(true);
      const accessToken = await getAccessToken();
      if (accessToken) {
        fetchMusicData(accessToken);
      }
    };

    fetchAccessToken();
  }, [id, type]); 

  useEffect(() => {
    if (!isLoading) {
      navigation.setOptions({ title: artistName });
    } else {
      navigation.setOptions({ title: "" });
    }
  }, [artistName, isLoading]);

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

  const fetchMusicData = async (accessToken) => {
    try {
      console.log("Fetching artist top tracks");
      const response = await getTopTracksOfArtist(accessToken, id);
      if (response && response.tracks && Array.isArray(response.tracks)) {
        setMusicData(response.tracks);
        const artistResponse = await getArtistById(accessToken, id);
        if (artistResponse && artistResponse.name) {
          setArtistName(artistResponse.name);
          const imageUrl = artistResponse.images[0].url;
          if (imageUrl) {
            setArtistImage(imageUrl);
          }
        }
      } else {
        console.error("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Error fetching music data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackPress = (itemId, itemType) => {
    navigation.navigate("AddReview", { id: itemId, type: itemType });
  };

  return (
    <ScrollView>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <>
              {artistImage && ( 
                <Image
                  source={{ uri: artistImage }}
                  style={styles.artistImage}
                />
              )}
              <View style={styles.musicContainer}>
                {type === 0 && (
                  <Text style={styles.heading}>Top Tracks by {artistName}</Text>
                )}
                {type === 1 && <Text style={styles.heading}>Albums</Text>}
                {musicData.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.itemContainer}
                    onPress={() => handleTrackPress(item.id, type)}
                  >
                    <Image
                      source={{
                        uri:
                          type === 0
                            ? item.album.images[0].url
                            : item.images[0].url,
                      }}
                      style={styles.image}
                    />
                    <View style={styles.textContainer}>
                      <Text style={styles.name}>
                        {type === 0 ? item.name : item.album.name}
                      </Text>
                      {type === 0 && (
                        <Text style={styles.artist}>
                          {item.artists
                            .map((artist) => artist.name)
                            .join(", ")}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  musicContainer: {
    marginTop: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  artistImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  artist: {
    fontSize: 14,
    color: "gray",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ArtistProfile;

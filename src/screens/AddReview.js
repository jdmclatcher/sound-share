import React, { useState, useEffect } from "react";
import { View, Text, Image, TextInput, Button, StyleSheet } from "react-native";
import { getSongById, getAlbumById } from "../api/searchApi";
import { Rating } from "react-native-ratings";
import { useNavigation, route } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { refresh } from "../auth/SpotifyAuth";

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

const AddReview = ({ route }) => {
  const [accessToken, setAccessToken] = useState(null);

  const { id, type } = route.params;

  useEffect(() => {
    fetchAccessToken(setAccessToken);
  }, []);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [musicData, setMusicData] = useState(null);

  const handleRatingChange = (value) => {
    setRating(parseInt(value));
  };

  const handleReviewChange = (value) => {
    setReview(value);
  };

  const handleSubmit = () => {
    // Send to home screen
    Alert.alert("Review Saved", "Review saved successfully", [
      { text: "OK", onPress: () => navigation.navigate("Home") },
    ]);
  };

  useEffect(() => {
    if (accessToken) {
      const fetchMusicData = () => {
        if (type === "song" || "track") {
          getSongById(accessToken, id)
            .then((response) => {
              setMusicData(response);
            })
            .catch((error) => {
              console.error("Error fetching song data:", error);
            });
        } else if (type === "album") {
          getAlbumById(accessToken, id)
            .then((response) => {
              setMusicData(response);
            })
            .catch((error) => {
              console.error("Error fetching album data:", error);
            });
        }
      };
      fetchMusicData();
    }
  }, [accessToken, id, type]);

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {musicData &&
        (console.log("music data", musicData),
        (
          <View style={styles.musicContainer}>
            <Text style={styles.musicName}>{musicData.name}</Text>
            <Image
              source={{ uri: musicData.album.images[0].url }}
              style={styles.albumCover}
            />
            <Text style={styles.musicName}>
              {type === "song" ? "Song Name" : "Album Name"}
            </Text>

            <Rating
              type="star"
              ratingCount={5}
              imageSize={30}
              showRating
              increment={1}
              onFinishRating={handleRatingChange}
              style={styles.rating}
            />

            <View style={styles.reviewContainer}>
              <Text style={styles.reviewLabel}>Review:</Text>
              <TextInput
                value={review}
                onChangeText={handleReviewChange}
                style={styles.reviewInput}
              />
            </View>

            <Button title="Submit" onPress={handleSubmit} />
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  musicContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  musicName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  albumCover: {
    width: "100%",
    height: "33%",
    marginBottom: 10,
  },
  rating: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  reviewContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  reviewInput: {
    width: "80%",
    height: 150,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
  },
});

export default AddReview;

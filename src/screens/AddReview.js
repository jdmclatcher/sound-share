import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
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
    // TODO handle save to firebase
    // Send to home screen
    Alert.alert("Review Saved", "Review saved successfully", [
      { text: "OK", onPress: () => navigation.navigate("Home") },
    ]);
  };

  useEffect(() => {
    if (accessToken) {
      const fetchMusicData = () => {
        if (type == 0) {
          console.log("Fetching song data");
          getSongById(accessToken, id)
            .then((response) => {
              setMusicData(response);
            })
            .catch((error) => {
              console.error("Error fetching song data:", error);
            });
        } else if (type == 1) {
          console.log("Fetching album data");
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        {musicData && (
          <View style={styles.musicContainer}>
            <Text style={styles.musicName}>{musicData.name}</Text>
            <Text style={styles.artistName}>
              by: {musicData.artists.map((artist) => artist.name).join(", ")}
            </Text>
            <Image
              source={{
                uri:
                  type == 1
                    ? musicData.images[0].url
                    : musicData.album.images[0].url,
              }}
              style={styles.albumCover}
            />
            <View style={styles.reviewContainer}>
              <Text style={styles.reviewLabel}>Review:</Text>
              <TextInput
                value={review}
                onChangeText={handleReviewChange}
                style={[styles.reviewInput, { textAlignVertical: "top" }]}
                multiline={true}
                numberOfLines={4}
              />
            </View>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={30}
              showRating
              defaultRating={0}
              increment={1}
              onFinishRating={handleRatingChange}
              style={styles.rating}
            />
            <Button title="Submit Review" onPress={handleSubmit} />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 10,
  },
  musicContainer: {
    flex: 1,
    alignItems: "center",
  },
  musicName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  albumCover: {
    aspectRatio: 1,
    width: "50%",
    marginBottom: 10,
    borderRadius: 5,
  },
  artistName: {
    fontSize: 16,
    marginBottom: 5,
  },
  rating: {
    marginBottom: 10,
  },
  reviewContainer: {
    width: "100%",
    marginBottom: 10,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  reviewInput: {
    width: "100%",
    height: 150,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "gray",
    padding: 10,
  },
});

export default AddReview;

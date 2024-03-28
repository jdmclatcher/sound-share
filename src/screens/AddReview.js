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
import { firebase } from "../../config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getCurrentUserProfile } from "../api/userApi";

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
  const [isLoading, setIsLoading] = useState(false); // prevent spam clicking submit

  const handleRatingChange = (value) => {
    setRating(parseInt(value));
  };

  const handleReviewChange = (value) => {
    setReview(value);
  };

  // TODO handle save to firebase
  const handleSubmit = async () => {
    try {
      const userProfile = await getCurrentUserProfile(accessToken);
      const userId = userProfile.id;
      const reviewData = {
        rating: rating,
        review: review,
        spotifySongId: musicData.id,
        createdAt: serverTimestamp(),
        spotifyUserId: userId,
      };
      // Get a reference to the Firestore collection
      const reviewsCollection = collection(firebase, "reviews");

      // Add the new note
      try {
        await addDoc(reviewsCollection, reviewData);
        Alert.alert("Review Saved", "Review saved successfully", [
          { text: "OK", onPress: () => navigation.navigate("Home") },
        ]);
      } catch (error) {
        console.error("Error saving review to Firebase: ", error);
        Alert.alert("Error", "Failed to save review");
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      Alert.alert("Error", "Failed to save review");
    }
    // Clear all data after saving
    setRating(0);
    setReview("");
    setMusicData(null);
  };

  // const checkForExistingReview = async () => {
  //   const userProfile = await getCurrentUserProfile(accessToken);
  //   const userId = userProfile.id;
  //   const reviewsCollection = collection(firebase, "reviews");
  //   const querySnapshot = await getDocs(
  //     query(reviewsCollection, where("spotifyUserId", "==", userId))
  //   );
  //   querySnapshot.forEach((doc) => {
  //     const data = doc.data();
  //     if (
  //       data.spotifyUserId === userId &&
  //       musicData.id === data.spotifySongId
  //     ) {
  //       console.log("Existing review found");
  //       // Clear all data after loading
  //       setRating(0);
  //       setReview("");
  //       setMusicData(null);
  //       Alert.alert(
  //         "Existing Review",
  //         "You have already submitted a review for this song.",
  //         [{ text: "OK", onPress: () => navigation.navigate("Home") }]
  //       );
  //     }
  //   });
  // };
  // checkForExistingReview();

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
            <Button
              title="Submit Review"
              onPress={handleSubmit}
              disabled={review === "" || isLoading}
            />
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

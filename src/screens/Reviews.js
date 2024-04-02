import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  getCurrentUserProfile,
  getCurrentUserPlaylists,
  getCurrentUserTopArtists,
  getCurrentUserRecentlyPlayedTracks,
} from "../api/userApi";
import { getSongById } from "../api/searchApi";
import * as SecureStore from "expo-secure-store";
import { refresh, authenticate } from "../auth/SpotifyAuth";
import { firebase } from "../../config.js";
import {
  collection,
  getDocs,
  where,
  query,
  onSnapshot,
} from "firebase/firestore";

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

const Reviews = ({ accessToken }) => {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    if (accessToken) {
      getCurrentUserProfile(accessToken).then((profile) => {
        setProfile(profile);

        // Fetch reviews from Firestore
        const fetchReviews = async () => {
          const reviewsRef = collection(firebase, "reviews");
          const q = query(reviewsRef, where("spotifyUserId", "==", profile.id));
          const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            try {
              const reviewDataFirestore = querySnapshot.docs.map((doc) =>
                doc.data()
              );

              const reviewData = await Promise.all(
                reviewDataFirestore.map((review) => {
                  return getSongById(accessToken, review.spotifySongId)
                    .then((musicData) => {
                      const albumArt = musicData?.album.images[0].url;
                      const songName = musicData?.name;
                      const reviewDataExport = {
                        ...review,
                        albumArt,
                        songName,
                      };
                      return reviewDataExport;
                    })
                    .catch((error) => {
                      console.error("Error retrieving music data:", error);
                      return null;
                    });
                })
              );
              setReviews(reviewData);
            } catch (error) {
              console.error("Error fetching reviews:", error);
            }
          });

          return unsubscribe; // Return the unsubscribe function to clean up the listener
        };

        fetchReviews();
      });
    }
  }, [accessToken]);

  return (
    <View style={styles.container}>
      {profile && (
        <>
          <Text style={styles.text}>Welcome, {profile.display_name}</Text>
          <Text style={styles.text}>Your Reviews: </Text>
          {reviews && (
            <ScrollView>
              {reviews.map((review, index) => (
                <TouchableOpacity key={index} style={styles.reviewContainer}>
                  <Image
                    source={{ uri: review.albumArt }}
                    style={styles.albumArt}
                  />
                  <View>
                    <Text style={styles.songTitle}>{review.songName}</Text>
                    <Text style={styles.reviewText}>
                      Review: {review.review}
                    </Text>
                    <Text>Rating: {review.rating}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}
      {!profile && (
        <>
          <Text style={styles.text}>
            Please Login to Spotify to see your profile.
          </Text>
          <Button
            title="Login To Spotify"
            onPress={() => {
              authenticate();
            }}
          />
        </>
      )}
    </View>
  );
};

const ReviewScreen = () => {
  const [accessToken, setAccessToken] = useState(null);
  useEffect(() => {
    fetchAccessToken(setAccessToken);
  }, []);

  return (
    <View style={styles.container}>
      {accessToken && <Reviews accessToken={accessToken} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
    textAlign: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
  },
  reviewContainer: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  albumArt: {
    width: 60,
    height: "100%",
    marginRight: 10,
    aspectRatio: 1,
  },
  songTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  reviewText: {
    marginBottom: 5,
    maxWidth: "90%",
  },
});

export default ReviewScreen;

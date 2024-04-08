import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { getCurrentUserProfile } from "../api/userApi";
import { getSongById } from "../api/searchApi";
import * as SecureStore from "expo-secure-store";
import { refresh, authenticate } from "../auth/SpotifyAuth";
import { firebase } from "../../config.js";
import { ref, query, orderByChild, equalTo, onValue } from "firebase/database";

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
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (accessToken) {
      getCurrentUserProfile(accessToken).then((profile) => {
        setProfile(profile);

        const fetchReviews = () => {
          const userId = profile.id;
          const userRef = ref(firebase, `users/${userId}`);
          onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
              // Fetching reviews
              const reviewsRef = ref(firebase, `users/${userId}/reviews`);
              onValue(reviewsRef, async (reviewSnapshot) => {
                const reviewData = reviewSnapshot.val();
                if (reviewData) {
                  const reviewList = Object.keys(reviewData).map(async (key) => {
                    const review = reviewData[key];
                    const songId = review.spotifySongId;
                    const musicData = await getSongById(accessToken, songId);
                    const songName = musicData.name;
                    const albumArt = musicData.album.images[0].url;
                    return { ...review, id: key, songName, albumArt };
                  });
                  Promise.all(reviewList).then((reviews) => {
                    setReviews(reviews);
                  });
                } else {
                  setReviews([]);
                }
              });

              const friendsRef = ref(firebase, `users/${userId}/friends`);
              onValue(friendsRef, (friendsSnapshot) => {
                const friendsData = friendsSnapshot.val();
                if (friendsData) {
                  const friendsList = Object.keys(friendsData).map((friendId) => {
                    return { id: friendId, name: friendsData[friendId].name };
                  });

                  friendsList.sort((a, b) => a.name.localeCompare(b.name));

                  setFriends(friendsList);
                } else {
                  setFriends([]);
                }
              });
            }
          });
        };

        fetchReviews();
      });
    }
  }, [accessToken]);

  return (
    <View style={styles.container}>
      {profile && (
        <>
          <Text style={styles.welcome}>Welcome, {profile.display_name}!</Text>
          <Text style={styles.reviews}>Your Reviews: </Text>
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
              {//TODO: placeholder for friends name
              }
              <Text style={styles.friends}>Friends: {friends.map((friend) => friend.name).join(", ")}</Text>
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
  welcome: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
    textAlign: "center",
  },
  reviews: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
    textAlign: "center",
    marginBottom: 20,
  },
  friends: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
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
    width: 200,
    maxWidth: "90%",
  },
});

export default ReviewScreen;

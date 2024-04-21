import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getSongById, getAlbumById } from "../api/searchApi";
import { logOut } from "../auth/SpotifyAuth";
import { firebase } from "../../config.js";
import { ref, onValue } from "firebase/database";

const UserProfile = ({ route }) => {
    const { userId, accessToken } = route.params;
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState(null);
    const [friends, setFriends] = useState([]);
    // console.log(accessToken);
    useEffect(() => {
        if (accessToken) {
            const fetchReviews = () => {
                const userRef = ref(firebase, `users/${userId}`);
                // console.log(userRef);
                onValue(userRef, (snapshot) => {
                  const userData = snapshot.val();
                  if (userData) {
                    const reviewsRef = ref(firebase, `users/${userId}/reviews`);
                    onValue(reviewsRef, async (reviewSnapshot) => {
                      const reviewData = reviewSnapshot.val();
                      if (reviewData) {
                        const reviewList = Object.keys(reviewData).map(
                          async (key) => {
                            const review = reviewData[key];
                            const songId = review.spotifySongId;
                            let musicData;
                            let albumArt;
                            if (review.musicType === 0) {
                              musicData = await getSongById(accessToken, songId);
                              albumArt = musicData.album.images[0].url;
                            } else {
                              musicData = await getAlbumById(accessToken, songId);
                              albumArt = musicData.images[0].url;
                            }
                            const songName = musicData.name;
                            return { ...review, id: key, songName, albumArt };
                          }
                        );
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
                        const friendsList = Object.keys(friendsData).map(
                          (friendId) => {
                            return { id: friendId, name: friendsData[friendId].name };
                          }
                        );
      
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
        }

    }, [accessToken]);

    return (
        <View style={styles.container}>
          {(
            <>
              <Text style={styles.welcome}>Welcome to {userId}'s profile!</Text>
              <Text style={styles.friends}>
                {friends ? 'Friends:' : 'No friends added yet.'}
                </Text>
                {friends && (
                <ScrollView>
                    {friends.map((friend) => (
                    <Text key={friend.id} style={styles.friend}>
                        {friend.name}
                    </Text>
                    ))}
                </ScrollView>
                )}
              <Text style={styles.reviews}>
                {reviews ? "Reviews:" : "No reviews added yet."}
              </Text>
              {reviews && (
                <ScrollView>
                  {reviews.map((review, index) => (
                    <TouchableOpacity key={index} style={styles.reviewContainer}>
                      <Image
                        source={{ uri: review.albumArt }}
                        style={styles.albumArt}
                      />
                      <View>
                        <Text style={styles.songTitle}>
                          {review.musicType === 0
                            ? "Song Title: " + review.songName
                            : "Album Title: " + review.songName}
                        </Text>
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
          <Button
            title="Log Out"
            onPress={() => {
              Alert.alert(
                "Confirmation",
                "Are you sure you want to log out?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Log Out",
                    onPress: () => {
                      logOut();
                      setIsLoggedIn(false);
                    },
                  },
                ],
                { cancelable: false }
              );
            }}
          />
        </View>
      );
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		padding: 20,
	},
	welcome: {
		fontSize: 20,
		fontWeight: 'bold',
		marginVertical: 5,
		textAlign: 'center',
		marginBottom: 20,
	},
	reviews: {
		fontSize: 18,
		fontWeight: 'bold',
		marginVertical: 5,
		textAlign: 'center',
		marginBottom: 20,
	},
	friends: {
		fontSize: 18,
		fontWeight: 'bold',
		marginVertical: 5,
		textAlign: 'center',
		marginTop: 10,
	},
	friend: {
		fontSize: 16,
		marginVertical: 5,
		textAlign: 'center',
		marginTop: 10,
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginTop: 10,
	},
	reviewContainer: {
		marginBottom: 20,
		flexDirection: 'row',
		alignItems: 'center',
	},
	albumArt: {
		width: 60,
		height: '100%',
		marginRight: 10,
		aspectRatio: 1,
	},
	songTitle: {
		fontWeight: 'bold',
		marginBottom: 5,
	},
	reviewText: {
		marginBottom: 5,
		width: 200,
		maxWidth: '90%',
	},
});
export default UserProfile;

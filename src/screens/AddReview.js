import React, { useState, useEffect } from 'react';
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
	ActivityIndicator,
} from 'react-native';
import { getSongById, getAlbumById } from '../api/searchApi';
import { Rating } from 'react-native-ratings';
import { useNavigation, route } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { refresh, getAccessToken, fetchAccessToken } from '../auth/SpotifyAuth';
import { firebase } from '../../config.js';
import { ref, push, set } from 'firebase/database';
import { getCurrentUserProfile } from '../api/userApi';

const AddReview = ({ route }) => {
	const [accessToken, setAccessToken] = useState(null);
	const [loadingMusicData, setLoadingMusicData] = useState(true);
	const [rating, setRating] = useState(0);
	const [review, setReview] = useState('');
	const [musicData, setMusicData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const { id, type } = route.params;

	useEffect(() => {
		fetchAccessToken(setAccessToken);
	}, []);

	const handleRatingChange = (value) => {
		setRating(parseInt(value));
	};

	const handleReviewChange = (value) => {
		setReview(value);
	};

	const handleSubmit = async () => {
		try {
			const userProfile = await getCurrentUserProfile(accessToken);
			const username = userProfile.id;
			if (!username) {
				throw new Error('Username not found in user profile');
			}
			const reviewData = {
				rating: rating,
				review: review,
				spotifySongId: musicData.id,
				spotifyUserId: username,
			};

			const userReviewsRef = ref(firebase, `users/${username}/reviews`);

			const newReviewRef = push(userReviewsRef);
			await set(newReviewRef, reviewData);

			Alert.alert('Review Saved', 'Review saved successfully', [
				{ text: 'OK', onPress: () => navigation.navigate('Home') },
			]);
		} catch (error) {
			console.error('Error saving review to Firebase: ', error);
			Alert.alert('Error', 'Failed to save review');
		} finally {
			setIsLoading(false);
		}
	};

	/*
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
    
      const reviewsCollection = collection(firebase, "reviews");

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
    setRating(0);
    setReview("");
    setMusicData(null);
  };
*/

	useEffect(() => {
		if (accessToken) {
			const fetchMusicData = () => {
				setLoadingMusicData(true);
				if (type == 0) {
					console.log('Fetching song data');
					getSongById(accessToken, id)
						.then((response) => {
							setMusicData(response);
						})
						.catch((error) => {
							console.error('Error fetching song data:', error);
						})
						.finally(() => setLoadingMusicData(false));
				} else if (type == 1) {
					console.log('Fetching album data');
					getAlbumById(accessToken, id)
						.then((response) => {
							setMusicData(response);
						})
						.catch((error) => {
							console.error('Error fetching album data:', error);
						})
						.finally(() => setLoadingMusicData(false));
				}
			};
			fetchMusicData();
		}
	}, [accessToken, id, type]);

	useEffect(() => {
		if (!loadingMusicData) {
			navigation.setOptions({ title: musicData ? musicData.name : '' });
		} else {
			navigation.setOptions({ title: '' });
		}
	}, [musicData, loadingMusicData]);

	const navigation = useNavigation();

	const dismissKeyboard = () => {
		Keyboard.dismiss();
	};

	return (
		<TouchableWithoutFeedback onPress={dismissKeyboard}>
			<View style={styles.container}>
				{loadingMusicData ? (
					<ActivityIndicator size="large" color="#0000ff" />
				) : (
					musicData && (
						<View style={styles.musicContainer}>
							{/* Music data content */}
							<Text style={styles.musicName}>{musicData.name}</Text>
							<Text style={styles.artistName}>
								by: {musicData.artists.map((artist) => artist.name).join(', ')}
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
									style={[styles.reviewInput, { textAlignVertical: 'top' }]}
									multiline={true}
									numberOfLines={4}
								/>
							</View>
							<Rating
								type="star"
								ratingCount={5}
								imageSize={30}
								showRating
								startingValue={0}
								minValue={1}
								jumpValue={1}
								tintColor="#f5f5f5"
								onFinishRating={handleRatingChange}
								style={styles.rating}
							/>
							<Button
								title="Submit Review"
								onPress={handleSubmit}
								disabled={review === '' || isLoading}
							/>
						</View>
					)
				)}
			</View>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		paddingTop: 10,
	},
	musicContainer: {
		flex: 1,
		alignItems: 'center',
	},
	musicName: {
		fontSize: 22,
		fontWeight: 'bold',
	},
	albumCover: {
		aspectRatio: 1,
		width: '50%',
		marginBottom: 10,
		borderRadius: 5,
	},
	artistName: {
		fontSize: 16,
		marginBottom: 5,
	},
	rating: {
		marginTop: 30,
		marginBottom: 10,
	},
	reviewContainer: {
		height: 150,
		width: '100%',
		marginBottom: 10,
	},
	reviewLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 5,
	},
	reviewInput: {
		width: 300,
		height: 150,
		borderWidth: 1,
		borderRadius: 5,
		borderColor: 'gray',
		padding: 10,
	},
});

export default AddReview;

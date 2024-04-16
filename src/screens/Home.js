import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import {
	refresh,
	authenticate,
	isLoggedIn,
	getAccessToken,
	fetchAccessToken,
} from '../auth/SpotifyAuth';
import RecentlyPlayed from '../components/RecentlyPlayed';
import TopTracks from '../components/TopTracks';
import TopArtists from '../components/TopArtists';
import * as SecureStore from 'expo-secure-store';

const HomeScreen = () => {
	const [accessToken, setAccessToken] = useState(null);
	useEffect(() => {
		fetchAccessToken(setAccessToken);
		console.log('Navigated to HomeScreen');
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>Sound Share</Text>
			{isLoggedIn() ? (
				<Text style={styles.text}>
					Welcome to Sound Share! Select a song or artist from your Spotify
					history below to begin reviewing music.
				</Text>
			) : (
				<View style={styles.loginContainer}>
					<Text style={styles.text}>
						Click the button below to login to Spotify and start reviewing
						music.
					</Text>
					<Button
						title="Login To Spotify"
						onPress={() => {
							authenticate();
						}}
					/>
				</View>
			)}
			<RecentlyPlayed accessToken={accessToken} limit={10} />
			<TopTracks accessToken={accessToken} limit={10} />
			<TopArtists accessToken={accessToken} limit={10} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 10,
	},
	heading: {
		fontSize: 30,
		fontWeight: 'bold',
		textAlign: 'center',
		marginTop: 20,
		marginBottom: 20,
	},
	text: {
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 20,
	},
	loginContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
});

export default HomeScreen;

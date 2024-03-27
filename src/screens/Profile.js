import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import {
	getCurrentUserProfile,
	getCurrentUserPlaylists,
	getCurrentUserTopArtists,
	getCurrentUserRecentlyPlayedTracks,
} from '../api/userApi';
import * as SecureStore from 'expo-secure-store';
import { refresh } from '../auth/SpotifyAuth';

const getAccessToken = async () => {
	try {
		const expirationTime = await SecureStore.getItemAsync(
			'spotifyExpirationTime'
		);
		if (new Date().getTime() > new Date(expirationTime)) {
			await refresh();
		}
		const accessToken = await SecureStore.getItemAsync('spotifyAccessToken');
		return accessToken;
	} catch (error) {
		console.error('Error retrieving access token:', error);
		return null;
	}
};

const fetchAccessToken = async (setAccessToken) => {
	const accessToken = await getAccessToken();
	if (accessToken) {
		setAccessToken(accessToken);
		console.log('Access token:', accessToken);
	}
};

const UserProfile = ({ accessToken }) => {
	const [profile, setProfile] = useState(null);
	const [playlists, setPlaylists] = useState(null);
	const [topArtists, setTopArtists] = useState(null);
	const [recentlyPlayed, setRecentlyPlayed] = useState(null);

	useEffect(() => {
		if (accessToken) {
			getCurrentUserProfile(accessToken).then(setProfile);
			getCurrentUserPlaylists(accessToken).then(setPlaylists);
			getCurrentUserTopArtists(accessToken).then(setTopArtists);
			getCurrentUserRecentlyPlayedTracks(accessToken).then(setRecentlyPlayed);
		}
	}, [accessToken]);

	return (
		<View style={styles.container}>
			{profile && (
				<>
					<Text style={styles.text}>Welcome, {profile.display_name}</Text>
					<Text style={styles.text}>Email: {profile.email}</Text>
					<Text style={styles.text}>Followers: {profile.followers.total}</Text>
					<Text style={styles.text}>Top Artists: </Text>
					{topArtists && (
						<View>
							{topArtists.items.map((artist, index) => (
								<Text key={index}> {artist.name} </Text>
							))}
						</View>
					)}
				</>
			)}
		</View>
	);
};

const ProfileScreen = () => {
	const [accessToken, setAccessToken] = useState(null);
	useEffect(() => {
		fetchAccessToken(setAccessToken);
	}, []);

	return (
		<View style={styles.container}>
			{accessToken && <UserProfile accessToken={accessToken} />}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	text: {
		fontSize: 18,
		fontWeight: 'bold',
		marginVertical: 5,
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginTop: 10,
	},
});

export default ProfileScreen;

import * as React from 'react';
import { Button, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
	makeRedirectUri,
	useAuthRequest,
	ResponseType,
} from 'expo-auth-session';
import {
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_REDIRECT_URI,
} from '@env';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
	authorizationEndpoint: 'https://accounts.spotify.com/authorize',
	tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const spotifyAuthConfig = {
	clientId: SPOTIFY_CLIENT_ID,
	scopes: [
		'streaming',
		'playlist-read-private',
		'user-read-email',
		'user-read-private',
		'user-top-read',
		'user-library-read',
	],
	responseType: ResponseType.Token,
	usePKCE: false,
	redirectUri: makeRedirectUri({
		useProxy: true,
	}),
};

function SpotifyLogin() {
	const [request, response, promptAsync] = useAuthRequest(
		spotifyAuthConfig,
		discovery
	);
	React.useEffect(() => {
		if (response?.type === 'success') {
			SecureStore.setItemAsync(
				'spotifyAccessToken',
				response.authentication.accessToken
			)
				.then(() => {
					console.log('Access token saved successfully!');
				})
				.catch((error) => {
					console.error('Error saving access token:', error);
				});
		}
	}, [response]);
	return (
		<Button
			disabled={!request}
			title="Login To Spotify"
			onPress={() => {
				promptAsync();
			}}
		/>
	);
}

module.exports = { SpotifyLogin };

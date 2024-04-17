import { useEffect } from 'react';
import { Button, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { firebase } from '../../config.js';
import { ref, set, get } from 'firebase/database';
import {
	makeRedirectUri,
	useAuthRequest,
	ResponseType,
	AuthSession,
} from 'expo-auth-session';
import {
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_REDIRECT_URI,
} from '@env';
import * as SecureStore from 'expo-secure-store';
import { encode as btoa } from 'base-64';
import { getCurrentUserProfile } from '../api/userApi.js';
WebBrowser.maybeCompleteAuthSession();

const clientId = SPOTIFY_CLIENT_ID;
const clientSecret = SPOTIFY_CLIENT_SECRET;
const scopes = [
	// "streaming",
	'playlist-read-private',
	'user-read-email',
	'user-read-private',
	'user-top-read',
	'user-library-read',
	'user-read-recently-played',
];
const redirectUri = makeRedirectUri({
	useProxy: true,
});

const deleteTokens = async () => {
	await SecureStore.deleteItemAsync('spotifyAccessToken');
	await SecureStore.deleteItemAsync('spotifyRefreshToken');
	await SecureStore.deleteItemAsync('spotifyTokenExpirationTime');
};

const getParams = (url) => {
	const queryString = url.split('?')[1];
	const params = queryString.split('&');
	const paramsObject = {};

	params.forEach((param) => {
		const [key, value] = param.split('=');
		paramsObject[key] = decodeURIComponent(value);
	});

	return paramsObject;
};

const getAuthURL = () => {
	const queryParams = new URLSearchParams({
		client_id: clientId,
		response_type: 'code',
		redirect_uri: redirectUri,
		scope: scopes.join(' '),
		show_dialog: true,
	});
	return `https://accounts.spotify.com/authorize?${queryParams.toString()}`;
};

const getTokens = async (code) => {
	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: redirectUri,
			client_id: clientId,
		}).toString(),
	});
	const data = await response.json();
	return data;
};

const authenticate = async (setIsLoggedIn) => {
	try {
		const authUrl = getAuthURL();
		const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
		if (result.type === 'success') {
			const params = getParams(result.url);
			const code = params.code;
			if (!code) {
				return;
			}
			const tokens = await getTokens(code);
			if (!tokens) {
				return;
			}
			const expirationTime = new Date().getTime() + tokens.expires_in * 1000;
			await SecureStore.setItemAsync('spotifyAccessToken', tokens.access_token);
			await SecureStore.setItemAsync(
				'spotifyRefreshToken',
				tokens.refresh_token
			);
			await SecureStore.setItemAsync(
				'spotifyTokenExpirationTime',
				expirationTime.toString()
			);

			const accessToken = tokens.access_token;
			const userData = await getCurrentUserProfile(accessToken);
			await createUserInDatabase(userData);
			
			console.log(
				`Access token stored successfully. Access token: ${
					tokens.access_token
				}. Access token will expire at ${new Date(
					expirationTime
				).toLocaleString()}`
			);
			setIsLoggedIn(true);
		} else {
			console.log('Authentication failed.');
		}
	} catch (error) {
		console.log('Authentication failed.');
		console.error(error);
	}
};

const refresh = async () => {
	try {
		const refreshToken = await SecureStore.getItemAsync('spotifyRefreshToken');
		const tokenResponse = await fetch(
			'https://accounts.spotify.com/api/token',
			{
				method: 'POST',
				headers: {
					Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
			}
		);
		const tokenData = await tokenResponse.json();
		// console.log(tokenData);
		// if request for refresh fails
		if (tokenData.error) {
			console.log('Error refreshing token:', tokenData.error_description);
			await deleteTokens();
			return;
		}
		const expirationTime = new Date().getTime() + tokenData.expires_in * 1000;
		await SecureStore.setItemAsync(
			'spotifyAccessToken',
			tokenData.access_token
		);
		if (tokenData.refresh_token) {
			await SecureStore.setItemAsync(
				'spotifyRefreshToken',
				tokenData.refresh_token
			);
		}
		await SecureStore.setItemAsync(
			'spotifyTokenExpirationTime',
			expirationTime.toString()
		);
		console.log(
			`Access token refreshed successfully. Access token: ${
				tokenData.access_token
			}. Expiration Time ${new Date(expirationTime)}`
		);
	} catch (error) {
		console.log('Error refreshing token. Error: ');
		console.error(error);
	}
};

const isLoggedIn = async () => {
	try {
		const accessToken = await SecureStore.getItemAsync('spotifyAccessToken');
		if (!accessToken) {
			console.log('User is not logged in.');
			return false;
		}
	} catch (error) {
		console.error(error);
		return false;
	}
	return true;
};

const logOut = async () => {
	try {
		await deleteTokens();
		console.log('User logged out.');
	} catch (error) {
		console.error(error);
	}
};

const getAccessToken = async () => {
	try {
		const expirationTime = await SecureStore.getItemAsync(
			'spotifyTokenExpirationTime'
		);
		const currentTime = new Date().getTime();
		if (currentTime > expirationTime) {
			console.log('Access token expired. Refreshing token...');
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
	}
	// TODO: handle null case?
};

module.exports = {
	authenticate,
	refresh,
	isLoggedIn,
	logOut,
	getAccessToken,
	fetchAccessToken,
};

const createUserInDatabase = async (userData) => {
	try {
		console.log(userData);
	  const { id, display_name } = userData;
  
	  const usersRef = ref(firebase, `users/${id}`);
  
	  const snapshot = await get(usersRef);
	  if (snapshot.exists()) {
		console.log('User already exists in the database:', snapshot.val());
		return;
	  }
  
	  const user = {
		name: display_name,
	  };
  
	  await set(usersRef, user);
  
	  console.log('User created in the database:', user);
	} catch (error) {
	  console.error('Error creating user in the database:', error);
	}
  };
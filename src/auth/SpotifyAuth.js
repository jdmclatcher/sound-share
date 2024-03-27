import { useEffect } from 'react';
import { Button, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
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

WebBrowser.maybeCompleteAuthSession();

const clientId = SPOTIFY_CLIENT_ID;
const clientSecret = SPOTIFY_CLIENT_SECRET;
const scopes = [
	'streaming',
	'playlist-read-private',
	'user-read-email',
	'user-read-private',
	'user-top-read',
	'user-library-read',
];
const redirectUri = makeRedirectUri({
	useProxy: true,
});

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

const authenticate = async () => {
	try {
		const authUrl = getAuthURL();
		const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
		if (result.type === 'success') {
			const params = getParams(result.url);
			const code = params.code;
			const tokens = await getTokens(code);
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
			console.log(
				`Access token stored successfully. Access token will expire at ${new Date(
					expirationTime
				).toLocaleString()}`
			);
		} else {
			console.log('Authentication failed.');
		}
	} catch (error) {
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
		console.log(tokenData);
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
			`Access token refreshed successfully. Access token will expire at ${new Date(
				expirationTime
			).toLocaleString()}`
		);
	} catch (error) {
		console.error(error);
	}
};

module.exports = { authenticate, refresh };

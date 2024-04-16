import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import {
	refresh,
	authenticate,
	isLoggedIn,
	getAccessToken,
	fetchAccessToken,
} from '../auth/SpotifyAuth';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ setIsLoggedIn }) {
	return (
		<View style={styles.container}>
			<Button
				title="Login To Spotify"
				onPress={() => {
					authenticate(setIsLoggedIn);
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
});

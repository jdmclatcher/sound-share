import * as React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { authenticate } from '../auth/SpotifyAuth';

const HomeScreen = () => {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Welcome to Sound Share!</Text>
			<Button
				title="Login To Spotify"
				onPress={() => {
					authenticate();
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		fontSize: 24,
		fontWeight: 'bold',
	},
});

export default HomeScreen;

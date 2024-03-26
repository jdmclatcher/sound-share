import * as React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { SpotifyLogin } from '../auth/SpotifyAuth';

const HomeScreen = () => {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Welcome to Sound Share!</Text>
			<SpotifyLogin />
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

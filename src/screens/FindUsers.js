import React, { useState, useEffect } from 'react';
import {
	View,
	TextInput,
	FlatList,
	TouchableOpacity,
	Text,
	StyleSheet,
} from 'react-native';
import { firebase } from '../../config.js';
import { getCurrentUserProfile } from '../api/userApi';
import * as SecureStore from 'expo-secure-store';
import { refresh, getAccessToken, fetchAccessToken } from '../auth/SpotifyAuth';
import {
	ref,
	startAt,
	endAt,
	query,
	orderByKey,
	get,
	push,
	set,
	onValue,
} from 'firebase/database';

const FindUsers = ({ route }) => {
	const [accessToken, setAccessToken] = useState(null);
	const [searchQuery, setQuery] = useState('');
	const [userResults, setUserResults] = useState([]);
	const [userFriends, setUserFriends] = useState([]);
	const [profile, setProfile] = useState(null);

	/**
	 * Asynchronously fetches and updates the user's profile from Firebase using a provided access token.
	 *
	 * @async
	 * @function updateUserProfile
	 * @description Fetches the current user's profile based on the accessToken and updates the React state with this profile.
	 * @returns {Promise<void>} A promise that resolves once the profile is fetched and the state is updated.
	 */
	async function updateUserProfile() {
		const profile = await getCurrentUserProfile(accessToken);
		setProfile(profile);
	}

	/**
	 * Fetches the current user's friends from Firebase and updates the state.
	 *
	 * @function updateUserFriends
	 * @description Subscribes to the user's friends list in Firebase and updates the React state with the list of friends.
	 * @returns {void} This function does not return a value but updates the state directly.
	 */
	function updateUserFriends() {
		const id = profile.id;
		const friendsRef = ref(firebase, `users/${id}/friends`);
		onValue(friendsRef, (snapshot) => {
			const data = snapshot.val();
			if (data) {
				const list = Object.keys(data).map((friendId) => {
					return { id: friendId, name: data[friendId].name };
				});
				setUserFriends(list);
			}
		});
	}

	/**
	 * Fetches and updates the list of all users from Firebase, excluding the current user, and updates the state.
	 *
	 * @function updateAllUsers
	 * @description Subscribes to the complete list of users in Firebase, filters out the current user, and updates the React state with the results.
	 * @returns {void} This function does not return a value but updates the state directly.
	 */
	function updateAllUsers() {
		try {
			const usersRef = ref(firebase, 'users');
			onValue(usersRef, (snapshot) => {
				const data = snapshot.val();
				if (data) {
					const list = Object.keys(data).map((userId) => ({
						id: userId,
					}));
					if (profile) {
						setUserResults(list.filter((user) => user.id !== profile.id));
					} else {
						setUserResults(list);
					}
				}
			});
		} catch {
			console.error('Error updating all users');
		}
	}

	const searchUsers = async (searchQuery) => {
		try {
			let queryRef;
			const lowercaseQuery = searchQuery.toLowerCase();
			const usersRef = ref(firebase, 'users');
			// by default, display all users
			if (lowercaseQuery.trim().length === 0) {
				queryRef = usersRef;
			} else {
				queryRef = query(
					usersRef,
					orderByKey(),
					startAt(lowercaseQuery),
					endAt(lowercaseQuery + '\uf8ff')
				);
			}

			const snapshot = await get(queryRef);
			const users = snapshot.val();
			if (users) {
				const userList = Object.keys(users).map((userId) => ({
					id: userId,
					// uid: users[userId].uid, // this is undefined for all users so not sure what it is used for?
				}));
				if (profile) {
					setUserResults(userList.filter((user) => user.id !== profile.id));
				}
			} else {
				setUserResults([]);
			}
		} catch (error) {
			console.error('Error searching users:', error);
		}
	};

	useEffect(() => {
		fetchAccessToken(setAccessToken);
	}, []);

	useEffect(() => {
		if (accessToken) {
			updateUserProfile();
		}
	}, [accessToken]);

	useEffect(() => {
		if (profile) {
			updateUserFriends();
			updateAllUsers();
		}
	}, [profile]);

	useEffect(() => {
		searchQuery.trim().length > 0 ? searchUsers(searchQuery) : searchUsers('');
	}, [searchQuery]);

	const isFriend = (userId) => {
		for (const friend of userFriends) {
			if (friend.id === userId) {
				return true;
			}
		}
		return false;
	};

	const handleAddFriend = (userId) => {
		if (accessToken) {
			getCurrentUserProfile(accessToken).then(async (profile) => {
				setProfile(profile);
				try {
					const username = profile.id;
					updateUserFriends();
					// add friend functionality
					if (!isFriend(userId) && userId != profileId) {
						const friendData = { name: userId };
						const newRef = ref(
							firebase,
							`users/${profileId}/friends/${userId}`
						);
						await set(newRef, friendData);
						const friendFriendRef = ref(
							firebase,
							`users/${userId}/friends/${profileId}`
						);
						const currentUserData = { name: profileId };
						await set(friendFriendRef, currentUserData);
						console.log('Friend added successfully');
					} else {
						console.log(
							'User is already a friend or trying to add yourself as friend'
						);
					}
				} catch (error) {
					console.error('Error adding friend: ', error);
				}
			});
		}
	};

	const handleRemoveFriend = (userId) => {
		// TODO: implement remove friend functionality
	};

	const renderUserItem = ({ item }) => (
		<TouchableOpacity
			//onPress={() => navigation.navigate("UserProfile", { userId: item.id })}
			style={styles.userResultItem}
		>
			<Text style={styles.userName}>{item.id}</Text>
			{/* if the user is a friend, give the option to remove the friend */}
			{!userFriends.some((friend) => friend.id === item.id) ? (
				<TouchableOpacity onPress={() => handleAddFriend(item.id)}>
					<Text style={styles.addFriendButton}>Add Friend</Text>
				</TouchableOpacity>
			) : (
				<TouchableOpacity onPress={() => handleRemoveFriend(item.id)}>
					<Text style={styles.addFriendButton}>Remove Friend</Text>
				</TouchableOpacity>
			)}
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.searchInput}
				value={searchQuery}
				onChangeText={setQuery}
				placeholder="Search for users"
			/>
			<FlatList
				style={styles.resultsList}
				data={userResults}
				renderItem={renderUserItem}
				keyExtractor={(item) => item.id}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#fff',
	},
	searchInput: {
		height: 48,
		borderRadius: 24,
		paddingHorizontal: 16,
		marginBottom: 16,
		fontSize: 16,
		backgroundColor: '#f2f2f2',
	},
	resultsList: {
		flex: 1,
	},
	userResultItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
	},
	userName: {
		fontSize: 16,
		paddingLeft: 8,
		fontWeight: 'bold',
	},
	addFriendButton: {
		fontSize: 16,
		color: 'blue',
		paddingRight: 8,
	},
});

export default FindUsers;

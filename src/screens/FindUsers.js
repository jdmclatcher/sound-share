import React, { useState, useEffect } from 'react';
import {
	View,
	TextInput,
	FlatList,
	TouchableOpacity,
	Text,
	StyleSheet,
	ActivityIndicator,
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
	remove,
} from 'firebase/database';

const FindUsers = ({ route }) => {
	const [accessToken, setAccessToken] = useState(null);
	const [searchQuery, setQuery] = useState('');
	const [userResults, setUserResults] = useState([]);
	const [userFriends, setUserFriends] = useState([]);
	const [profile, setProfile] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	/**
	 * Asynchronously fetches and updates the user's profile from Firebase using a provided access token.
	 *
	 * @async
	 * @function updateUserProfile
	 * @description Fetches the current user's profile based on the accessToken and updates the React state with this profile.
	 * @returns {Promise<void>} A promise that resolves once the profile is fetched and the state is updated.
	 */
	const updateUserProfile = async () => {
		const profile = await getCurrentUserProfile(accessToken);
		setProfile({ ...profile, name: profile.display_name }); 
	};	

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
						id: userId, name: data[userId].name
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
			
			const userProfile = await getCurrentUserProfile(accessToken);
			const username = userProfile.id;
			const snapshot = await get(queryRef);
			const users = snapshot.val();
			if (users) {
				const userList = Object.keys(users).map((userId) => ({
					id: userId, name: users[userId].name
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

	const handleNewRequest = (userId) => {
		if (accessToken) {
			getCurrentUserProfile(accessToken).then(async (profile) => {
				setProfile(profile);

				try {
					const userProfile = await getCurrentUserProfile(accessToken);
					const username = userProfile.id;
					if (!username) {
						throw new Error('Username not found in user profile');
					}

					if (!isFriend(userId) && userId != username) {
						const friendData = { name: username };
						const newRef = ref(firebase, `users/${userId}/friendRequests/${username}`);
						await set(newRef, friendData);
						console.log('Friend request added successfully');
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

	const handleAddFriend = (userId, userName) => {
		if (accessToken) {
			getCurrentUserProfile(accessToken).then(async (profile) => {
				setProfile(profile);
				try {
					const username = profile.id;
					updateUserFriends();
					if (!isFriend(userId) && userId != username) {
						const friendData = { name: userName};
						const newRef = ref(
							firebase,
							`users/${username}/friends/${userId}`
						);
						await set(newRef, friendData);
						const friendFriendRef = ref(
							firebase,
							`users/${userId}/friends/${username}`
						);
						
						const currentUserData = { name: profile.display_name};
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
		if (accessToken) {
			getCurrentUserProfile(accessToken).then(async (profile) => {
				try {
					const username = profile.id;
	
					const currentUserFriendRef = ref(
						firebase,
						`users/${username}/friends/${userId}`
					);
					await remove(currentUserFriendRef);
	
					const friendFriendRef = ref(
						firebase,
						`users/${userId}/friends/${username}`
					);
					await remove(friendFriendRef);
	
					console.log('Friend removed successfully');
				} catch (error) {
					console.error('Error removing friend: ', error);
				}
			});
		}
	};
	
	const renderUserItem = ({ item }) => (
		<TouchableOpacity
			//onPress={() => navigation.navigate("UserProfile", { userId: item.id })}
			style={styles.userResultItem}
		>
			<Text style={styles.userName}>{item.name}</Text>
			{!userFriends.some((friend) => friend.id === item.id) ? (
				<TouchableOpacity onPress={() => handleAddFriend(item.id, item.name)}>
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
			{isLoading ? ( 
				<ActivityIndicator size="large" color="blue" />
			) : (
				<FlatList
					style={styles.resultsList}
					data={userResults}
					renderItem={renderUserItem}
					keyExtractor={(item) => item.id}
				/>
			)}
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

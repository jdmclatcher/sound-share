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

	const searchUsers = async (searchQuery) => {
		// TODO: filter out yourself & users already friends with so you can remove button
		try {
			const usersRef = ref(firebase, 'users');
			let queryRef;
			const lowercaseQuery = searchQuery.toLowerCase();

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
					uid: users[userId].uid,
				}));
				setUserResults(userList);
			} else {
				setUserResults([]);
			}
		} catch (error) {
			console.error('Error searching users:', error);
		}
	};

	useEffect(() => {
		if (searchQuery.trim().length > 0) {
			searchUsers(searchQuery);
		} else {
			searchUsers('');
		}
	}, [searchQuery]);

	useEffect(() => {
		fetchAccessToken(setAccessToken);
	}, []);

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
					const userProfile = await getCurrentUserProfile(accessToken);
					const username = userProfile.id;
					if (!username) {
						throw new Error('Username not found in user profile');
					}

					const currentUserFriendRef = ref(
						firebase,
						`users/${username}/friends`
					);

					onValue(currentUserFriendRef, (friendsSnapshot) => {
						const friendsData = friendsSnapshot.val();
						if (friendsData) {
							const friendsList = Object.keys(friendsData).map((friendId) => {
								return { id: friendId, name: friendsData[friendId].name };
							});
							setUserFriends(friendsList);
						}
					});

					if (!isFriend(userId) && userId != username) {
						const friendData = { name: userId };
						const newRef = ref(firebase, `users/${username}/friends/${userId}`);
						await set(newRef, friendData);
						const friendFriendRef = ref(
							firebase,
							`users/${userId}/friends/${username}`
						);
						const currentUserData = { name: username };
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

	const renderUserItem = ({ item }) => (
		<TouchableOpacity
			//onPress={() => navigation.navigate("UserProfile", { userId: item.id })}
			style={styles.userResultItem}
		>
			<Text style={styles.userName}>{item.id}</Text>
			<TouchableOpacity onPress={() => handleAddFriend(item.id)}>
				<Text style={styles.addFriendButton}>Add Friend</Text>
			</TouchableOpacity>
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

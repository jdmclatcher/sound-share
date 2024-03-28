import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Button,
} from "react-native";
import { searchSpotify } from "../api/searchApi";
import * as SecureStore from "expo-secure-store";
import { refresh, authenticate } from "../auth/SpotifyAuth";

const getAccessToken = async () => {
  try {
    const expirationTime = await SecureStore.getItemAsync(
      "spotifyExpirationTime"
    );
    if (new Date().getTime() > new Date(expirationTime)) {
      await refresh();
    }
    const accessToken = await SecureStore.getItemAsync("spotifyAccessToken");
    return accessToken;
  } catch (error) {
    console.error("Error retrieving access token:", error);
    return null;
  }
};

const fetchAccessToken = async (setAccessToken) => {
  const accessToken = await getAccessToken();
  if (accessToken) {
    setAccessToken(accessToken);
  }
};

const Search = ({ navigation }) => {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    fetchAccessToken(setAccessToken);
  }, []);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState(0);

  useEffect(() => {
    const timerId = setTimeout(async () => {
      if (query) {
        let searchTypeText = searchType === 0 ? "track" : "album";
        const result = await searchSpotify(accessToken, query, searchTypeText);
        if (searchType == 0) {
          setResults(result.tracks.items);
        } else if (searchType == 1) {
          setResults(result.albums.items);
        }
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [query, searchType]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("AddReview", {
          id: item.id,
          type: searchType,
        })
      }
      style={styles.resultItem}
    >
      <Image
        source={{
          uri: searchType == 1 ? item.images[0].url : item.album.images[0].url,
        }}
        style={styles.albumImage}
      />
      <Text style={styles.songName}>{item.name}</Text>
      <Text style={styles.artistName}>{item.artists[0].name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!accessToken && (
        <>
          <Text style={styles.text}>
            Please Login to Spotify to search & review music.
          </Text>
          <Button
            title="Login To Spotify"
            onPress={() => {
              authenticate();
            }}
          />
        </>
      )}
      {/* <Button
        title="Songs"
        onPress={() => {
          setSearchType(0);
          setQuery("");
          setResults([]);
        }}
        style={searchType === 0 ? styles.activeButton : styles.inactiveButton}
      />
      <Button
        title="Albums"
        onPress={() => {
          setSearchType(1);
          setQuery("");
          setResults([]);
        }}
        style={searchType === 1 ? styles.activeButton : styles.inactiveButton}
      /> */}
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder={`Search for a${searchType === 0 ? " song" : "n album"}`}
      />
      <FlatList
        style={styles.resultsList}
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
    textAlign: "center",
  },
  segmentedControl: {
    marginBottom: 16,
  },
  searchInput: {
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f2f2f2",
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
  },
  albumImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginLeft: 8,
  },
  songName: {
    fontSize: 16,
    paddingLeft: 8,
    fontWeight: "bold",
    flex: 1,
  },
  artistName: {
    fontSize: 14,
    paddingLeft: 8,
    flex: 1,
  },
  activeButton: {
    backgroundColor: "blue",
    color: "white",
    marginRight: 8,
  },
  inactiveButton: {
    backgroundColor: "gray",
    color: "black",
    marginRight: 8,
  },
});

export default Search;

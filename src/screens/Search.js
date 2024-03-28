import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { searchSpotify } from "../api/searchApi";
import * as SecureStore from "expo-secure-store";
import { refresh } from "../auth/SpotifyAuth";

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
  const [searchType, setSearchType] = useState("track");

  useEffect(() => {
    const timerId = setTimeout(async () => {
      if (query) {
        const result = await searchSpotify(accessToken, query, searchType);
        if (searchType === "track") {
          setResults(result.tracks.items);
        } else if (searchType === "album") {
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
          uri:
            searchType === "album"
              ? item.images[0].url
              : item.album.images[0].url,
        }}
        style={styles.albumImage}
      />
      <Text style={styles.songName}>{item.name}</Text>
      <Text style={styles.artistName}>{item.artists[0].name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SegmentedControl
        style={styles.segmentedControl}
        values={["Songs", "Albums"]}
        selectedIndex={searchType === "album" ? 1 : 0}
        onChange={(event) => {
          setSearchType(
            event.nativeEvent.selectedSegmentIndex === 0 ? "track" : "album"
          );
          console.log(searchType);
          setQuery("");
          setResults([]);
        }}
      />
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder={`Search for a${
          searchType === "track" ? " song" : "n album"
        }`}
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
});

export default Search;

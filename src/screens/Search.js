import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { searchSpotify } from "../api/searchApi";
import * as SecureStore from "expo-secure-store";

const getAccessToken = async () => {
  try {
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
    console.log("Access token:", accessToken);
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
        setResults(result[searchType].items);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [query, searchType]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("AddReview", {
          accessToken: accessToken,
          songId: item.id,
        })
      }
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SegmentedControl
        style={styles.segmentedControl}
        values={["Song", "Album"]}
        selectedIndex={searchType}
        onChange={(event) =>
          setSearchType(event.nativeEvent.selectedSegmentIndex)
        }
      />
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="Search for a song or album"
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
  },
  resultText: {
    fontSize: 16,
  },
});

export default Search;

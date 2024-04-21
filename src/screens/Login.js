import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import {
  refresh,
  authenticate,
  isLoggedIn,
  getAccessToken,
  fetchAccessToken,
} from "../auth/SpotifyAuth";
import * as SecureStore from "expo-secure-store";

export default function LoginScreen({ setIsLoggedIn }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Sound Share!</Text>
      <Text style={styles.subheader}>
        Please Login & Authenticate with your Spotify account to continue.
      </Text>
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
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 20,
    marginHorizontal: 20,
    textAlign: "center",
  },
  subheader: {
    fontSize: 18,
    marginVertical: 20,
    marginHorizontal: 20,
    textAlign: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

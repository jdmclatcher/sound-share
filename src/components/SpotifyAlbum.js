import React, { useEffect, useState } from "react";
import { Text, Image, View } from "react-native";
import axios from "axios";
import { SPOTIFY_ACCESS_TOKEN } from "@env";
const SpotifyAlbum = ({ albumId, size }) => {
  const [albumData, setAlbumData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
          headers: {
            Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
          },
        }
      );
      setAlbumData(result.data);
    };
    fetchData();
  }, [albumId]);

  if (!albumData) {
    return <Text>Loading...</Text>;
  }

  const imageUrl =
    albumData.images && albumData.images[0] ? albumData.images[0].url : "";

  return (
    <View>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
        />
      )}
      <Text>{albumData.name}</Text>
    </View>
  );
};

export default SpotifyAlbum;

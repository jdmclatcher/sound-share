import React, { useEffect, useState } from "react";
import { Text, Image, View } from "react-native";
import axios from "axios";
import { SPOTIFY_ACCESS_TOKEN } from "@env";

const SpotifySong = ({ songId, size }) => {
  const [songData, setSongData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get(
        `https://api.spotify.com/v1/tracks/${songId}`,
        {
          headers: {
            Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
          },
        }
      );

      setSongData(result.data);
    };

    fetchData();
  }, [songId]);

  if (!songData) {
    return <Text>Loading...</Text>;
  }

  const imageUrl =
    songData.album && songData.album.images && songData.album.images[0]
      ? songData.album.images[0].url
      : "";

  return (
    <View>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
        />
      )}
      <Text>{songData.name}</Text>
    </View>
  );
};

export default SpotifySong;

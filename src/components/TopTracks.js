import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import axios from "axios";
import { SPOTIFY_ACCESS_TOKEN } from "@env";
import SpotifySong from "./SpotifySong";

const TopTracks = ({ userId }) => {
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get(
        `https://api.spotify.com/v1/me/top/tracks?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
          },
          params: {
            time_range: "short_term",
          },
        }
      );
      setTopTracks(result.data.items);
    };

    fetchData();
  }, [userId]);

  return (
    <Text>
      <Text>Top Tracks</Text>
      {topTracks.map((track, index) => (
        <View key={index}>
          <SpotifySong songId={track.id} size={50} />
        </View>
      ))}
    </Text>
  );
};

export default TopTracks;

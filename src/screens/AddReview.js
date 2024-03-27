import React, { useState } from "react";
import { View, Text, Image, TextInput, Button, StyleSheet } from "react-native";
import { getSongById, getAlbumById } from "../api/searchApi";
import { Rating } from "react-native-elements";

const AddReview = ({ accessToken, id, type }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [musicData, setMusicData] = useState(null);

  const handleRatingChange = (value) => {
    setRating(parseInt(value));
  };

  const handleReviewChange = (value) => {
    setReview(value);
  };

  const handleSubmit = () => {
    // Send to home screen
    navigation.navigate("Home");
  };

  useEffect(() => {
    const fetchMusicData = async () => {
      let data;
      if (type === "song") {
        data = await getSongById(accessToken, id);
      } else if (type === "album") {
        data = await getAlbumById(accessToken, id);
      }
      setMusicData(data);
    };
    fetchMusicData();
  }, [accessToken, id, type]);

  return (
    <View style={styles.container}>
      <View style={styles.musicContainer}>
        <Text style={styles.musicName}>{musicData?.name}</Text>
        <Image
          source={{ uri: musicData?.images[0].url }}
          style={styles.albumCover}
        />
        <Text style={styles.musicName}>
          {type === "song" ? "Song Name" : "Album Name"}
        </Text>
        <Image
          source={require("./album-cover.jpg")}
          style={styles.albumCover}
        />

        <Rating
          startingValue={rating}
          onFinishRating={handleRatingChange}
          imageSize={20}
          style={styles.rating}
        />

        <View style={styles.reviewContainer}>
          <Text style={styles.reviewLabel}>Review:</Text>
          <TextInput
            value={review}
            onChangeText={handleReviewChange}
            style={styles.reviewInput}
          />
        </View>

        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  musicContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  musicName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  albumCover: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  rating: {
    paddingVertical: 10,
  },
  reviewContainer: {
    marginBottom: 20,
  },
  reviewLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  reviewInput: {
    height: 100,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
  },
});

export default AddReview;

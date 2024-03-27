const BASE_URL = "https://api.spotify.com/v1";

/**
 * Gets the current user's profile information from Spotify.
 * @param {string} accessToken - The access token for the Spotify API.
 * @returns {Promise<Object>} The user's profile information.
 */
const getCurrentUserProfile = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
};

/**
 * Gets the current user's playlists from Spotify.
 * @param {string} accessToken - The access token for the Spotify API.
 * @returns {Promise<Object>} The user's playlists.
 */
const getCurrentUserPlaylists = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/me/playlists`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
};

/**
 * Gets the current user's top artists from Spotify.
 * @param {string} accessToken - The access token for the Spotify API.
 * @returns {Promise<Object>} The user's top artists.
 */
const getCurrentUserTopArtists = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/me/top/artists`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
};

/**
 * Gets the current user's top tracks from Spotify.
 * @param {string} accessToken - The access token for the Spotify API.
 * @param {string} limit - The number of items to return.
 * @returns {Promise<Object>} The user's top artists.
 */
const getCurrentUserTopTracks = async (accessToken, limit) => {
  const response = await fetch(`${BASE_URL}/me/top/tracks?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
};

/**
 * Gets the current user's recently played tracks from Spotify.
 * @param {string} accessToken - The access token for the Spotify API.
 * @returns {Promise<Object>} The user's recently played tracks.
 */
const getCurrentUserRecentlyPlayedTracks = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/me/player/recently-played`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
};

module.exports = {
  getCurrentUserProfile,
  getCurrentUserPlaylists,
  getCurrentUserTopArtists,
  getCurrentUserTopTracks,
  getCurrentUserRecentlyPlayedTracks,
};

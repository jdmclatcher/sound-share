const BASE_URL = 'https://api.spotify.com/v1';

/**
 * Searches Spotify for music-related data based on the given query and type.
 * @param {string} accessToken - The access token for the Spotify API.
 * @param {string} query - The search query.
 * @param {string} type - The type of search (e.g., 'album', 'artist', 'track').
 * @returns {Promise<Object>} The search results.
 */
const searchSpotify = async (accessToken, query, type) => {
	const response = await fetch(
		`${BASE_URL}/search?q=${encodeURIComponent(query)}&type=${type}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	);
	const data = await response.json();
	return data;
};

/**
 * Retrieves details of a specific album by its ID.
 * @param {string} accessToken - The access token for the Spotify API.
 * @param {string} albumId - The Spotify ID of the album.
 * @returns {Promise<Object>} The album details.
 */
const getAlbumById = async (accessToken, albumId) => {
	const response = await fetch(`${BASE_URL}/albums/${albumId}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const data = await response.json();
	return data;
};

/**
 * Retrieves the tracks of a specific album by its ID.
 * @param {string} accessToken - The access token for the Spotify API.
 * @param {string} albumId - The Spotify ID of the album.
 * @returns {Promise<Object>} The tracks of the album.
 */
const getTracksOfAlbum = async (accessToken, albumId) => {
	const response = await fetch(`${BASE_URL}/albums/${albumId}/tracks`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const data = await response.json();
	return data;
};

/**
 * Retrieves the top tracks of a specific artist by their ID.
 * @param {string} accessToken - The access token for the Spotify API.
 * @param {string} artistId - The Spotify ID of the artist.
 * @returns {Promise<Object>} The top tracks of the artist.
 */
const getTopTracksOfArtist = async (accessToken, artistId) => {
	const response = await fetch(
		`${BASE_URL}/artists/${artistId}/top-tracks?market=US`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	);
	const data = await response.json();
	return data;
};

module.exports = {
	searchSpotify,
	getAlbumById,
	getTracksOfAlbum,
	getTopTracksOfArtist,
};

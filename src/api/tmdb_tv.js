
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const fetchFromTMDB = async (endpoint) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const searchTvShows = (query) => fetchFromTMDB(`/search/tv?query=${encodeURIComponent(query)}`);

export const getTvShowDetails = (tvShowId) => fetchFromTMDB(`/tv/${tvShowId}`);

export const getTvShowVideos = (tvShowId) => fetchFromTMDB(`/tv/${tvShowId}/videos`);

export const getTvShowWatchProviders = (tvShowId) => fetchFromTMDB(`/tv/${tvShowId}/watch/providers`);

export const getTvShowRecommendations = (tvShowId) => fetchFromTMDB(`/tv/${tvShowId}/recommendations`);

export const getPopularTvShows = (page = 1) => fetchFromTMDB(`/tv/popular?page=${page}`);

export const getTvShowGenres = () => fetchFromTMDB('/genre/tv/list');

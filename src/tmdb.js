const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const fetchFromTMDB = async (endpoint) => {
  if (!API_KEY) {
    throw new Error("TMDB API Key is missing. Please check your .env file.");
  }
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const searchMovies = (query) => fetchFromTMDB(`/search/movie?query=${encodeURIComponent(query)}`);

export const searchMulti = (query) => fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}`);

export const getMovieDetails = (movieId) => fetchFromTMDB(`/movie/${movieId}`);

export const getMovieVideos = (movieId) => fetchFromTMDB(`/movie/${movieId}/videos`);

export const getMovieWatchProviders = (movieId) => fetchFromTMDB(`/movie/${movieId}/watch/providers`);

export const getMovieRecommendations = (movieId) => fetchFromTMDB(`/movie/${movieId}/recommendations`);

export const getUpcomingMovies = (page = 1) => fetchFromTMDB(`/movie/upcoming?page=${page}`);

export const getGenres = () => fetchFromTMDB('/genre/movie/list');
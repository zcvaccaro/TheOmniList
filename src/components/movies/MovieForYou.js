import React, { useEffect, useState, useRef } from 'react';
import { Box, Heading, SimpleGrid, Spinner, Text, Select, VStack } from '@chakra-ui/react';
import MovieCard from './MovieCard';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function MovieForYou({ watchlist, onAddToWatchlist, onRemoveFromWatchlist, onSelect }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const prevWatchlistRef = useRef([]);

  useEffect(() => {
    const prevWatchlist = prevWatchlistRef.current;
    const prevIds = new Set(prevWatchlist.map(m => m.id));
    const newMovies = watchlist.filter(m => !prevIds.has(m.id));

    // Update ref for next render
    prevWatchlistRef.current = watchlist;

    if (newMovies.length === 0) return;

    async function fetchNewRecommendations() {
      setLoading(true);
      try {
        const allRecs = await Promise.all(
          newMovies.map(async (movie) => {
            const res = await fetch(
              `https://api.themoviedb.org/3/movie/${movie.id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
            );
            const data = await res.json();
            return data.results || [];
          })
        );

        const flattened = allRecs.flat();
        const newRecMap = new Map();
        const watchlistIds = new Set(watchlist.map(w => w.id));

        flattened.forEach((m) => {
          if (!newRecMap.has(m.id) && !watchlistIds.has(m.id)) {
            newRecMap.set(m.id, m);
          }
        });

        // Functional update avoids dependency on `recommendations`
        setRecommendations(prev => {
          const currentRecIds = new Set(prev.map(r => r.id));

          const newRecs = Array.from(newRecMap.values()).map(m => ({
            id: m.id,
            title: m.title,
            poster: m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : 'https://via.placeholder.com/200x300?text=No+Image',
            rating: m.vote_average || null,
            genre_ids: m.genre_ids || [],
          })).filter(rec => !currentRecIds.has(rec.id));

          return [...prev, ...newRecs];
        });

      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchNewRecommendations();
  }, [watchlist]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        setGenres(data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  const filteredRecommendations = selectedGenre
    ? recommendations.filter(
        (movie) => movie.genre_ids && movie.genre_ids.includes(parseInt(selectedGenre))
      )
    : recommendations;

  const watchlistIds = new Set(watchlist.map(m => m.id));

  // Save scroll position before triggering add
  const handleAdd = (movie) => {
    sessionStorage.setItem('forYouScrollPos', window.scrollY);
    onAddToWatchlist(movie);
  };

  // Restore scroll position once on mount
  useEffect(() => {
    const savedPos = sessionStorage.getItem('forYouScrollPos');
    if (savedPos) {
      window.scrollTo(0, parseInt(savedPos, 10));
      sessionStorage.removeItem('forYouScrollPos');
    }
  }, []);

  return (
    <Box pt={6}>
      <Heading size="xl" mb={6} textAlign="center">
        For You
      </Heading>
      <Box maxW="300px" mx="auto" mb={6}>
        <Select
          placeholder="Filter by Genre"
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </Select>
      </Box>

      {loading && filteredRecommendations.length === 0 ? (
        <VStack justify="center" align="center" height="50vh">
          <Spinner size="xl" />
          <Text>Loading Recommendations...</Text>
        </VStack>
      ) : filteredRecommendations.length === 0 ? (
        <Text textAlign="center" color="gray.500">
          Add movies to your watchlist to get personalized recommendations!
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {filteredRecommendations.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onAdd={handleAdd}
              onRemove={onRemoveFromWatchlist}
              onClick={() => onSelect(movie)}
              inWatchlist={watchlistIds.has(movie.id)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default MovieForYou;

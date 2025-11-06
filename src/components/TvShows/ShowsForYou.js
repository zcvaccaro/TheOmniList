import React, { useEffect, useState, useRef } from 'react';
import { Box, Heading, SimpleGrid, Spinner, Text, Select } from '@chakra-ui/react';
import TVCard from './TVCard';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function ShowsForYou({ watchlist, onAdd, onRemove, onClick }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const prevWatchlistRef = useRef([]);

  useEffect(() => {
    const prevWatchlist = prevWatchlistRef.current;
    const prevIds = new Set(prevWatchlist.map(s => s.id));
    const newShows = watchlist.filter(s => !prevIds.has(s.id));

    // Update ref for next render
    prevWatchlistRef.current = watchlist;

    if (newShows.length === 0) return;

    async function fetchNewRecommendations() {
      setLoading(true);
      try {
        const allRecs = await Promise.all(
          newShows.map(async (show) => {
            const res = await fetch(
              `https://api.themoviedb.org/3/tv/${show.id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
            );
            const data = await res.json();
            return data.results || [];
          })
        );

        const flattened = allRecs.flat();
        const newRecMap = new Map();
        const watchlistIds = new Set(watchlist.map(w => w.id));

        flattened.forEach((s) => {
          if (!newRecMap.has(s.id) && !watchlistIds.has(s.id)) {
            newRecMap.set(s.id, s);
          }
        });

        // Functional update avoids dependency on `recommendations`
        setRecommendations(prev => {
          const currentRecIds = new Set(prev.map(r => r.id));

          const newRecs = Array.from(newRecMap.values()).map(s => ({
            id: s.id,
            name: s.name,
            poster_path: s.poster_path
              ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
              : 'https://via.placeholder.com/200x300?text=No+Image',
            vote_average: s.vote_average || null,
            genre_ids: s.genre_ids || [],
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
        const response = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}&language=en-US`);
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
        (show) => show.genre_ids && show.genre_ids.includes(parseInt(selectedGenre))
      )
    : recommendations;

  const watchlistIds = new Set(watchlist.map(s => s.id));

  // Save scroll position before triggering add
  const handleAdd = (show) => {
    sessionStorage.setItem('forYouScrollPos', window.scrollY);
    onAdd(show);
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
        <Spinner size="xl" thickness="4px" color="blue.500" />
      ) : filteredRecommendations.length === 0 ? (
        <Text textAlign="center" color="gray.500">
          Add shows to your watchlist to get personalized recommendations!
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {filteredRecommendations.map((show) => (
            <TVCard
              key={show.id}
              show={show}
              onAdd={handleAdd}
              onRemove={onRemove}
              onClick={() => onClick(show)}
              inWatchlist={watchlistIds.has(show.id)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default ShowsForYou;
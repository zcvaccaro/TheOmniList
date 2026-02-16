import React, { useEffect, useState, useRef } from 'react';
import { Box, Heading, SimpleGrid, Spinner, Text, Select, VStack, HStack, Button } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import TVCard from './TVCard';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function ShowsForYou({ watchlist, onAdd, onRemove, onClick }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const prevWatchlistRef = useRef([]);
  const [currentPage, setCurrentPage] = useState(1);

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
            const totalPagesToFetch = 3;
            const pagePromises = [];
            for (let page = 1; page <= totalPagesToFetch; page++) {
              pagePromises.push(
                fetch(
                  `https://api.themoviedb.org/3/tv/${show.id}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`
                ).then((res) => res.json())
              );
            }
            const pagesData = await Promise.all(pagePromises);
            return pagesData.flatMap((data) => data.results || []);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre, watchlist]);

  const filteredRecommendations = selectedGenre
    ? recommendations.filter(
        (show) => show.genre_ids && show.genre_ids.includes(parseInt(selectedGenre))
      )
    : recommendations;

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredRecommendations.length / itemsPerPage);
  const currentShows = filteredRecommendations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
        <VStack justify="center" align="center" height="50vh">
          <Spinner size="xl" />
          <Text>Loading Recommendations...</Text>
        </VStack>
      ) : filteredRecommendations.length === 0 ? (
        <Text textAlign="center" color="gray.500">
          Add shows to your watchlist to get personalized recommendations!
        </Text>
      ) : (
        <>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {currentShows.map((show) => (
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
          <HStack spacing={4} justify="center" mt={8} mb={10}>
            <Button onClick={handlePrevPage} isDisabled={currentPage === 1} aria-label="Previous Page">
              <ChevronLeftIcon />
            </Button>
            <Text>
              {currentPage} of {totalPages}
            </Text>
            <Button onClick={handleNextPage} isDisabled={currentPage === totalPages} aria-label="Next Page">
              <ChevronRightIcon />
            </Button>
          </HStack>
        </>
      )}
    </Box>
  );
}

export default ShowsForYou;
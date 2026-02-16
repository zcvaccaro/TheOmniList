import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Spinner, Heading, Select, VStack, Text, HStack, Button } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import MovieCard from './MovieCard';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function MovieUpcomingReleases({ watchlist, onAddToWatchlist, onRemoveFromWatchlist, onSelect }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`);
        const data = await res.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    }
    fetchGenres();
  }, []);

  useEffect(() => {
    async function fetchUpcoming() {
      setLoading(true);
      try {
        const firstRes = await fetch(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
        );
        const firstData = await firstRes.json();
        const totalPages = Math.min(firstData.total_pages, 5);
        const allResults = [...firstData.results];

        const pagePromises = [];
        for (let page = 2; page <= totalPages; page++) {
          pagePromises.push(
            fetch(
              `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${page}`
            ).then((res) => res.json())
          );
        }

        const morePages = await Promise.all(pagePromises);
        morePages.forEach((page) => {
          if (page.results) allResults.push(...page.results);
        });

        const today = new Date().toISOString().split('T')[0];
        const upcomingOnly = allResults.filter(
          (movie) => movie.release_date && movie.release_date >= today
        );

        setMovies(upcomingOnly);
      } catch (err) {
        console.error('Error fetching upcoming movies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUpcoming();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre]);

  const filteredMovies = selectedGenre
    ? movies.filter((movie) => movie.genre_ids?.includes(parseInt(selectedGenre)))
    : movies;

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const currentMovies = filteredMovies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  const watchlistIds = new Set(watchlist.map(m => m.id));

  return (
    <Box pt={6}>
      <Heading size="xl" mb={6} textAlign="center">
      Upcoming Releases
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

      {loading ? (
        <VStack justify="center" align="center" height="50vh">
          <Spinner size="xl" />
          <Text>Loading Upcoming Movies...</Text>
        </VStack>
      ) : (
        <>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {currentMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={{
                ...movie,
                poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
                rating: movie.vote_average,
              }}
              onAdd={onAddToWatchlist}
              onRemove={onRemoveFromWatchlist}
              onClick={() => onSelect(movie)}
              inWatchlist={watchlistIds.has(movie.id)}
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

export default MovieUpcomingReleases;

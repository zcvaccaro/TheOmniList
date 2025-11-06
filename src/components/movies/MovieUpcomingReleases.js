import React, { useEffect, useState } from 'react';
import {
  Box,
  Image,
  Text,
  VStack,
  SimpleGrid,
  Spinner,
  Heading,
  Select,
  Button,
} from '@chakra-ui/react';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function MovieUpcomingReleases({ onAddToWatchlist, onSelect }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');

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

  const filteredMovies = selectedGenre
    ? movies.filter((movie) => movie.genre_ids?.includes(parseInt(selectedGenre)))
    : movies;

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
        <Spinner size="xl" thickness="4px" color="blue.500" />
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {filteredMovies.map((movie) => (
            <Box
              key={movie.id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              p={4}
              cursor="pointer"
              _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
              transition="all 0.2s"
              onClick={() => onSelect(movie)}
            >
              <VStack spacing={3}>
                <Image
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : 'https://via.placeholder.com/200x300?text=No+Image'
                  }
                  alt={movie.title}
                  boxSize="200px"
                  objectFit="cover"
                />
                <Text fontWeight="bold" textAlign="center">
                  {movie.title}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Release: {movie.release_date}
                </Text>
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={(e) => {
                    e.stopPropagation();
                    const movieToAdd = {
                      id: movie.id,
                      title: movie.title,
                      poster: movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : 'https://via.placeholder.com/200x300?text=No+Image',
                      rating: movie.vote_average || null,
                    };
                    onAddToWatchlist(movieToAdd);
                  }}
                >
                  Add to Watchlist
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default MovieUpcomingReleases;

import React, { useState, useEffect } from 'react';
import { getPopularTvShows } from '../../api/tmdb_tv';
import TVCard from './TVCard';
import { SimpleGrid, Box, Heading, Select, Spinner, VStack, Text, HStack, Button } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

const ShowPopular = ({ watchlist, onAdd, onRemove, onClick }) => {
  const [shows, setShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPopularShows = async () => {
      setLoading(true);
      try {
        const response = await getPopularTvShows();
        setShows(response.results);
      } catch (error) {
        console.error('Error fetching popular TV shows:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchGenres = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        setGenres(data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchPopularShows();
    fetchGenres();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre]);

  const filteredShows = selectedGenre
    ? shows.filter((show) =>
        show.genre_ids && show.genre_ids.includes(parseInt(selectedGenre))
      )
    : shows;

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredShows.length / itemsPerPage);
  const currentShows = filteredShows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  return (
    <Box pt={6}>
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Popular TV Shows
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
          <Text>Loading Popular Shows...</Text>
        </VStack>
      ) : (
        <>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
          {currentShows.map(show => (
            <TVCard
              key={show.id}
              show={show}
              onAdd={onAdd}
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
};

export default ShowPopular;
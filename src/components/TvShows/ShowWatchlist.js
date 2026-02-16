import React, { useState, useEffect } from 'react';
import { Box, Text, SimpleGrid, Select, HStack, Button } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import TVCard from './TVCard';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function ShowWatchlist({ watchlist, onRemove, onSelect }) {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredWatchlist = selectedGenre
    ? watchlist.filter((show) =>
        show.genre_ids && show.genre_ids.includes(parseInt(selectedGenre))
      )
    : watchlist;

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredWatchlist.length / itemsPerPage);
  const currentShows = filteredWatchlist.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  return (
    <Box pt={6}>
      <Text fontSize="xl" mb={4} fontWeight="bold" flex="1" textAlign="center" fontFamily="'Orbitron', sans-serif">Your TV Show Watchlist</Text>
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
      {filteredWatchlist.length === 0 ? (
        <Text>No shows in your watchlist yet.</Text>
      ) : (
        <>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {currentShows.map((show) => (
            <TVCard
              key={show.id}
              show={show}
              onRemove={onRemove}
              onClick={() => onSelect(show)}
              inWatchlist={true}
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

export default ShowWatchlist;

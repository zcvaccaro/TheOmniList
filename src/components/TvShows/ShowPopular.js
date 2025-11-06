import React, { useState, useEffect } from 'react';
import { getPopularTvShows } from '../../api/tmdb_tv';
import TVCard from './TVCard';
import { SimpleGrid, Box, Heading, Select } from '@chakra-ui/react';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

const ShowPopular = ({ onAdd, onClick }) => {
  const [shows, setShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    const fetchPopularShows = async () => {
      try {
        const response = await getPopularTvShows();
        setShows(response.results);
      } catch (error) {
        console.error('Error fetching popular TV shows:', error);
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

  const filteredShows = selectedGenre
    ? shows.filter((show) =>
        show.genre_ids && show.genre_ids.includes(parseInt(selectedGenre))
      )
    : shows;

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
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
        {filteredShows.map(show => (
          <TVCard
            key={show.id}
            show={show}
            onAdd={onAdd}
            onClick={() => onClick(show)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ShowPopular;
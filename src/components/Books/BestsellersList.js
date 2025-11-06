import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Heading,
  Select,
  Flex,
} from '@chakra-ui/react';
import { fetchBestsellersWithDetails } from './bookApi';
import BookCard from './BookCard';

const bestsellerLists = [
  { name: 'Combined Print & E-Book Fiction', value: 'combined-print-and-e-book-fiction' },
  { name: 'Combined Print & E-Book Nonfiction', value: 'combined-print-and-e-book-nonfiction' },
  { name: 'Hardcover Fiction', value: 'hardcover-fiction' },
  { name: 'Hardcover Nonfiction', value: 'hardcover-nonfiction' },
  { name: 'Paperback Trade Fiction', value: 'trade-fiction-paperback' },
  { name: 'Paperback Nonfiction', value: 'paperback-nonfiction' },
  { name: 'Advice, How-To & Miscellaneous', value: 'advice-how-to-and-miscellaneous' },
  { name: 'Young Adult Hardcover', value: 'young-adult-hardcover' },
];

const BestsellersList = ({ onAdd, onRemove, onClick, watchlist }) => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedList, setSelectedList] = useState(bestsellerLists[0].value);

  const handleListChange = (event) => {
    setSelectedList(event.target.value);
  };

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const bookData = await fetchBestsellersWithDetails(selectedList);
        setBooks(bookData);
      } catch (err) {
        setError('Failed to fetch bestsellers. Please check your API keys and network connection.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [selectedList]);

  if (isLoading) {
    return (
      <VStack justify="center" align="center" height="50vh">
        <Spinner size="xl" />
        <Text>Loading Bestsellers...</Text>
      </VStack>
    );
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  const watchlistIsbns = new Set(watchlist.map(b => b.isbn));

  return (
    <Box pt={6}>
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="lg" mb={{ base: 4, md: 0 }}>
          NYT Bestsellers
        </Heading>
        <Select value={selectedList} onChange={handleListChange} maxW={{ base: '100%', md: '400px' }}>
          {bestsellerLists.map((list) => (
            <option key={list.value} value={list.value}>
              {list.name}
            </option>
          ))}
        </Select>
      </Flex>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
        {books.map((book) => (
          <BookCard
            key={book.isbn}
            book={book}
            onAdd={onAdd}
            onRemove={onRemove}
            onClick={onClick}
            inWatchlist={watchlistIsbns.has(book.isbn)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default BestsellersList;
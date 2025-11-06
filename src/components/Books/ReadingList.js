import React from 'react';
import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import BookCard from './BookCard';

function ReadingList({ watchlist, onRemove, onSelect }) {
  return (
    <Box pt={6}>
      <Heading as="h2" size="lg" mb={6}>
        My Reading List ({watchlist.length})
      </Heading>

      {watchlist.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
          {watchlist.map((book) => (
            <BookCard key={book.isbn} book={book} onRemove={() => onRemove(book.isbn)} onClick={() => onSelect(book)} isWatchlist />
          ))}
        </SimpleGrid>
      ) : (
        <Text>Your reading list is empty. Add some books!</Text>
      )}
    </Box>
  );
}

export default ReadingList;
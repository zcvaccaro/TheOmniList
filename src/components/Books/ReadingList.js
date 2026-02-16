import React, { useState } from 'react';
import { Box, Heading, SimpleGrid, Text, HStack, Button } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import BookCard from './BookCard';

function ReadingList({ watchlist, onRemove, onSelect }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(watchlist.length / itemsPerPage);
  const currentBooks = watchlist.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      <Heading as="h2" size="lg" mb={6}>
        My Reading List ({watchlist.length})
      </Heading>

      {watchlist.length > 0 ? (
        <>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
          {currentBooks.map((book) => (
            <BookCard key={book.isbn} book={book} onRemove={() => onRemove(book.isbn)} onClick={() => onSelect(book)} isWatchlist />
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
      ) : (
        <Text>Your reading list is empty. Add some books!</Text>
      )}
    </Box>
  );
}

export default ReadingList;
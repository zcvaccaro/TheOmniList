import React, { useEffect, useState, useRef } from 'react';
import { Box, Heading, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react';
import { searchBooks } from './bookApi';
import BookCard from './BookCard';

function BooksForYou({ readingList, onAdd, onRemove, onClick }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevReadingListRef = useRef([]);

  useEffect(() => {
    const prevList = prevReadingListRef.current;
    const prevIsbns = new Set(prevList.map(b => b.isbn));
    const currentBooks = readingList || [];
    const newBooks = currentBooks.filter(b => b.isbn && !prevIsbns.has(b.isbn));

    // Determine which books to use for fetching recommendations.
    // On first load (prevList is empty), use all books. On subsequent renders, use only new books.
    const booksForRecs = prevList.length === 0 ? currentBooks : newBooks;

    if (booksForRecs.length === 0) return;

    async function fetchNewRecommendations() {
      setLoading(true);
      try {
        const authorQueries = booksForRecs
          .map(book => book.author ? book.author.split(',')[0] : null) // Get first author
          .filter(author => author && author !== 'Unknown Author');

        if (authorQueries.length === 0) return;

        const uniqueQueries = [...new Set(authorQueries)];

        const allRecs = await Promise.all(
          uniqueQueries.map(query => searchBooks(query))
        );

        const flattened = allRecs.flat();
        const newRecMap = new Map();
        const readingListIsbns = new Set(readingList.map(b => b.isbn));

        flattened.forEach((book) => {
          if (book.isbn && !newRecMap.has(book.isbn) && !readingListIsbns.has(book.isbn)) {
            newRecMap.set(book.isbn, book);
          }
        });

        setRecommendations(prev => {
          const currentRecIsbns = new Set(prev.map(r => r.isbn));
          const newRecs = Array.from(newRecMap.values()).filter(rec => !currentRecIsbns.has(rec.isbn));
          return [...prev, ...newRecs];
        });

      } catch (err) {
        console.error('Failed to fetch book recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    // Update the ref *after* using it, so on next render it has the correct previous value.
    prevReadingListRef.current = readingList;
    fetchNewRecommendations();
  }, [readingList]);

  const readingListIsbns = new Set(readingList.map(b => b.isbn));

  return (
    <Box pt={6}>
      <Heading size="xl" mb={6} textAlign="center">
        For You
      </Heading>

      {loading && recommendations.length === 0 ? (
        <VStack><Spinner size="xl" /></VStack>
      ) : recommendations.length === 0 ? (
        <Text textAlign="center" color="gray.500">
          Add books to your reading list to get personalized recommendations!
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
          {recommendations.map((book) => (
            <BookCard
              key={book.isbn}
              book={book}
              onAdd={onAdd}
              onRemove={onRemove}
              onClick={onClick}
              inWatchlist={readingListIsbns.has(book.isbn)} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default BooksForYou;
import React from 'react';
import {
  Box,
  Image,
  Text,
  Button,
  VStack,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';

const BookCard = ({ book, onAdd, onClick, onRemove, isWatchlist, inWatchlist }) => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleAdd = (e) => {
    e.stopPropagation(); // Prevent card's onClick from firing
    onAdd(book);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation(); // Prevent card's onClick from firing
    // The onRemove prop might expect just the ID
    onRemove(book.isbn || book.id);
  };

  return (
    <Tooltip label={book.title} openDelay={500}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        cursor="pointer"
        onClick={() => onClick && onClick(book)}
        bg={bgColor}
        transition="transform 0.2s"
        _hover={{ transform: 'scale(1.05)', shadow: 'lg' }}
      >
        <Image src={book.coverImage} alt={`Cover of ${book.title}`} fallbackSrc="https://via.placeholder.com/200x300?text=No+Image" objectFit="contain" height="300px" width="100%" />
        <VStack p="4" align="start" spacing={2}>
          <Text fontWeight="bold" as="h4" lineHeight="tight" isTruncated color={textColor} width="100%">
            {book.title}
          </Text>
          <Text fontSize="sm" color="gray.500" isTruncated width="100%">
            by {book.author}
          </Text>
          {isWatchlist || inWatchlist ? (
            <Button size="sm" colorScheme="red" onClick={handleRemoveClick} width="100%">
              Remove
            </Button>
          ) : (
            <Button size="sm" colorScheme="green" onClick={handleAdd} width="100%">
              Add to Reading List
            </Button>
          )}
        </VStack>
      </Box>
    </Tooltip>
  );
};

export default BookCard;
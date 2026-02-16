import React from 'react';
import {
  Box,
  Image,
  Text,
  Button,
  VStack,
  Tooltip,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';

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
          
          <HStack spacing={1}>
            {book.averageRating > 0 ? (
              <>
                <Icon as={StarIcon} color="yellow.400" w={3} h={3} />
                <Text fontSize="xs" color="gray.500">
                  {book.averageRating * 2} ({book.ratingsCount})
                </Text>
              </>
            ) : (
              <Text fontSize="xs" color="gray.400">No ratings</Text>
            )}
          </HStack>

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
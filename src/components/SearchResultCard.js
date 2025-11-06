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

const SearchResultCard = ({ item, onAdd, onRemove, onClick, inWatchlist }) => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(item);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove(item);
  };

  // Normalize data for display
  const title = item.title || item.name;
  const image = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : item.coverImage;
  const subText = item.type === 'book' ? `by ${item.author}` : `(${item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || 'N/A'})`;
  
  let buttonText;
  if (item.type === 'book') {
    buttonText = 'Add to Reading List';
  } else if (item.type === 'movie') {
    buttonText = 'Add to Movies';
  } else if (item.type === 'tv') {
    buttonText = 'Add to Shows';
  }

  return (
    <Tooltip label={title} openDelay={500}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        cursor="pointer"
        onClick={() => onClick(item)}
        bg={bgColor}
        transition="transform 0.2s"
        _hover={{ transform: 'scale(1.05)', shadow: 'lg' }}
      >
        <Image src={image} alt={`Cover of ${title}`} fallbackSrc="https://via.placeholder.com/200x300?text=No+Image" objectFit="cover" height="300px" width="100%" />
        <VStack p="4" align="start" spacing={2}>
          <Text fontWeight="bold" as="h4" lineHeight="tight" isTruncated color={textColor} width="100%">
            {title}
          </Text>
          <Text fontSize="sm" color="gray.500" isTruncated width="100%">
            {subText}
          </Text>
          {inWatchlist ? (
            <Button size="sm" colorScheme="red" onClick={handleRemove} width="100%">
              Remove
            </Button>
          ) : (
            <Button size="sm" colorScheme="green" onClick={handleAdd} width="100%">
              {buttonText}
            </Button>
          )}
        </VStack>
      </Box>
    </Tooltip>
  );
};

export default SearchResultCard;
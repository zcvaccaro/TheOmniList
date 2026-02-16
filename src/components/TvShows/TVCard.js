import React from 'react';
import {
  Box,
  Image,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';

function TVCard({ show, onAdd, onRemove, onClick, inWatchlist }) {
  const rating = show.vote_average;
  const ratingCount = show.vote_count || 0;

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      cursor={onClick ? 'pointer' : 'default'}
      _hover={onClick ? { boxShadow: 'lg', transform: 'scale(1.02)' } : undefined}
      transition="all 0.2s"
      onClick={onClick}
      position="relative"
      height="380px" // set fixed height for uniform cards}
    >
      <VStack spacing={3} height="100%">
        <Image
          src={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'}
          alt={show.name}
          boxSize="200px"
          objectFit="cover"
          draggable={false}
        />
        <Text fontWeight="bold" textAlign="center" noOfLines={2}>
          {show.name}
        </Text>
        <HStack spacing={1}>
          {rating > 0 ? (
            <>
              <Icon as={StarIcon} color="yellow.400" w={3} h={3} />
              <Text fontSize="xs" color="gray.500">
                {rating} ({ratingCount})
              </Text>
            </>
          ) : (
            <Text fontSize="xs" color="gray.400">No ratings</Text>
          )}
        </HStack>
      </VStack>

      {/* Buttons fixed at bottom */}
      <Box position="absolute" bottom="10px" left="0" right="0" px={4}>
        {onAdd && !inWatchlist && (
          <Button
            size="sm"
            colorScheme="green"
            width="100%"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(show);
            }}
          >
            Add to Watchlist
          </Button>
        )}
        {(onRemove && inWatchlist) && (
          <Button
            size="sm"
            colorScheme="red"
            width="100%"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(show.id);
            }}
          >
            Remove
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default TVCard;
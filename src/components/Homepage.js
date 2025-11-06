import React, { useState } from 'react';
import { Box, Button, VStack, Heading, Text, HStack, Center } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MotionButton = motion(Button);
const MotionHStack = motion(HStack);
const categories = {
  movies: {
    name: 'Movies',
    colorScheme: 'teal',
    links: [
      { name: 'For You', to: '/movies/foryou' },
      { name: 'Upcoming', to: '/movies/upcoming' },
      { name: 'Watchlist', to: '/movies/watchlist' },
    ],
  },
  tv: {
    name: 'TV Shows',
    colorScheme: 'purple',
    links: [
      { name: 'For You', to: '/tvshows/foryou' },
      { name: 'Popular', to: '/tvshows/popular' },
      { name: 'Watchlist', to: '/tvshows/watchlist' },
    ],
  },
  books: {
    name: 'Books',
    colorScheme: 'orange',
    links: [
      { name: 'For You', to: '/books/foryou' },
      { name: 'Bestsellers', to: '/books/bestsellers' },
      { name: 'Reading List', to: '/books/watchlist' },
    ],
  },
};

const Homepage = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const handleCategoryClick = (categoryKey) => {
    setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey);
  };

  const handleOutsideClick = () => {
    setExpandedCategory(null);
  };

  return (
    <Box
      position="relative" // Set a positioning context for the copyright text
      textAlign="center"
      fontSize="xl"
      minH="calc(100vh - 125px)" // Use minH to fill available vertical space
      display="flex"
      flexDirection="column"
      justifyContent="center" // Center content vertically
      alignItems="center"
      bg="gray.800"
      color="white"
      mx="-1.5rem" // Counteract container padding
      onClick={handleOutsideClick}
    >
      <VStack spacing={8}>
        <Heading as="h1" size="2xl" mb={6}>
          Welcome to Your OmniList
        </Heading>
        {Object.entries(categories).map(([key, category]) => ( // Stop propagation to prevent background click
          <Center key={key} h="48px" w="100%">
            <AnimatePresence initial={false} mode="wait">
              {expandedCategory === key ? (
                <MotionHStack
                  key={`${key}-sub`}
                  spacing={4}
                  initial={{ opacity: 0, scaleX: 0.5 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0.5 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {category.links.map((link) => (
                    <Button
                      key={link.name}
                      as={Link}
                      to={link.to}
                      colorScheme={category.colorScheme}
                      variant="outline"
                    >
                      {link.name}
                    </Button>
                  ))}
                </MotionHStack>
              ) : (
                <MotionButton
                  key={`${key}-main`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(key);
                  }}
                  colorScheme={category.colorScheme}
                  size="lg"
                  width="200px"
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {category.name}
                </MotionButton>
              )}
            </AnimatePresence>
          </Center>
        ))}
      </VStack>
      <Text
        position="absolute"
        bottom="20px"
        fontSize="sm"
        color="gray.500"
      >
        © Zack Vaccaro 2025
      </Text>
    </Box>
  );
};

export default Homepage;

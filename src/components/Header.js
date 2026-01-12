import React from 'react';
import {
  Box,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  useDisclosure,
  Button,
  Flex,
  Text,
  Input,
  InputGroup,
  HStack,
  useColorMode,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { HamburgerIcon, SunIcon, MoonIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';

function Header({ onSearch }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [query, setQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState({ id: 'all', name: 'All' });
  const navigate = useNavigate();
  const location = useLocation();

  const { colorMode, toggleColorMode } = useColorMode();
  const menuBg = useColorModeValue('white', 'gray.700');
  const menuTextColor = useColorModeValue('gray.800', 'white');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.700');
  const menuItemHoverBg = useColorModeValue('gray.100', 'gray.600');

  const searchCategories = [
    { id: 'all', name: 'All' },
    { id: 'movie', name: 'Movies' },
    { id: 'tv', name: 'TV Shows' },
    { id: 'book', name: 'Books' },
  ];

  const handleSearch = (category) => {
    if (query.trim() && category) {
      onSearch(query.trim(), category);
      setQuery('');
      if (location.pathname !== '/search') {
        navigate('/search');  // Navigate to /search after searching
      }
    }
  };

  const isHomePage = location.pathname === '/' || location.pathname === '/search';
  let placeholder = 'Search...';
  let searchCategory = 'all';

  if (location.pathname.startsWith('/movies')) {
    placeholder = 'Search movies...'; searchCategory = 'movie';
  } else if (location.pathname.startsWith('/tvshows')) {
    placeholder = 'Search TV shows...'; searchCategory = 'tv';
  } else if (location.pathname.startsWith('/books')) {
    placeholder = 'Search books...'; searchCategory = 'book';
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(isHomePage ? selectedCategory.id : searchCategory);
    }
  };

  return (
    <Box bg="gray.800" color="white" px={4} py={3} position="sticky" top="0" zIndex="1000">
      {/* Top row: Hamburger, title, and color mode toggle */}
      <Flex align="center" justify="space-between" mb={3}>
        <IconButton
          icon={<HamburgerIcon />}
          onClick={onOpen}
          variant="ghost"
          color="white"
          aria-label="Open menu"
          mr={2}
        />

        <Text fontWeight="bold" fontSize="lg" flex="1" textAlign="center" fontFamily="'Orbitron', sans-serif">
          <RouterLink to="/" onClick={onClose}>
            OmniList
          </RouterLink>
        </Text>


        <IconButton
          aria-label="Toggle color mode"
          icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
          onClick={toggleColorMode}
          variant="ghost"
          color="white"
          ml={2}
        />
      </Flex>

      {/* Search bar below, full width with button inside */}
      <HStack>
        <InputGroup size="md">
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            bg="whiteAlpha.100"
            color="white"
            border="1px solid"
            borderColor="whiteAlpha.200"
            backdropFilter="blur(4px)"
            _placeholder={{ color: 'whiteAlpha.600' }}
            _focus={{ bg: 'whiteAlpha.200', borderColor: 'whiteAlpha.400' }}
          />
        </InputGroup>

        {isHomePage && (
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              size="md"
              variant="outline"
              minW="130px" // Ensure enough space for text and icon
              pr={2}
              color="white"
              borderColor="whiteAlpha.600"
              _hover={{ bg: 'whiteAlpha.200' }}
              _active={{ bg: 'whiteAlpha.300' }}
            >
              {selectedCategory.name}
            </MenuButton>
            <MenuList bg={menuBg} borderColor={menuBorderColor} border="1px solid">
              {searchCategories.map((cat) => (
                <MenuItem 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat)}
                  color={menuTextColor}
                  _hover={{ bg: menuItemHoverBg }}
                  _focus={{ bg: menuItemHoverBg }}
                >
                  {cat.name}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )}

        <Button
          size="md"
          onClick={() => handleSearch(isHomePage ? selectedCategory.id : searchCategory)}
          colorScheme="blue"
        >
          Search
        </Button>
      </HStack>

            {/* Navigation Drawer */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader as={RouterLink} to="/" onClick={onClose} fontFamily="'Orbitron', sans-serif">OmniList</DrawerHeader>
          <DrawerBody>
            <Accordion allowMultiple>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Movies
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack align="start" spacing={4}>
                    <Button as={RouterLink} to="/movies/foryou" onClick={onClose} variant="ghost">
                      For You
                    </Button>
                    <Button as={RouterLink} to="/movies/upcoming" onClick={onClose} variant="ghost">
                      Upcoming Releases
                    </Button>
                    <Button as={RouterLink} to="/movies/watchlist" onClick={onClose} variant="ghost">
                      Watchlist
                    </Button>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      TV Shows
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack align="start" spacing={4}>
                    <Button as={RouterLink} to="/tvshows/foryou" onClick={onClose} variant="ghost">
                      For You
                    </Button>
                    <Button as={RouterLink} to="/tvshows/popular" onClick={onClose} variant="ghost">
                      Popular Shows
                    </Button>
                    <Button as={RouterLink} to="/tvshows/watchlist" onClick={onClose} variant="ghost">
                      Watchlist
                    </Button>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Books
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack align="start" spacing={4}>
                    <Button as={RouterLink} to="/books/foryou" onClick={onClose} variant="ghost">
                      For You
                    </Button>
                    <Button as={RouterLink} to="/books/bestsellers" onClick={onClose} variant="ghost">
                      Bestsellers
                    </Button>
                    <Button as={RouterLink} to="/books/watchlist" onClick={onClose} variant="ghost">
                      Reading List
                    </Button>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default Header;

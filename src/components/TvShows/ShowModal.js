import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  ModalBody,
  AspectRatio,
  Text,
  Button,
  useBreakpointValue,
  Spinner,
  VStack,
  HStack,
  Link,
  Image,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionModalContent = motion(ModalContent);
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function ShowModal({ show, isOpen, onClose, onAddToWatchlist, onRemoveFromWatchlist, isWatchlist }) {
  const [details, setDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const modalSize = useBreakpointValue({ base: 'full', md: 'xl' });

  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const bodyTextColor = useColorModeValue('gray.800', 'gray.200');

  useEffect(() => {
    if (!show || !show.id) return;

    const fetchDetailsAndTrailerAndStreaming = async () => {
      setLoading(true);
      try {
        const [detailsRes, videosRes, providersRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/tv/${show.id}?api_key=${API_KEY}&language=en-US`
          ),
          fetch(
            `https://api.themoviedb.org/3/tv/${show.id}/videos?api_key=${API_KEY}`
          ),
          fetch(
            `https://api.themoviedb.org/3/tv/${show.id}/watch/providers?api_key=${API_KEY}`
          ),
        ]);

        const detailsData = await detailsRes.json();
        const videosData = await videosRes.json();
        const providersData = await providersRes.json();

        const trailer = videosData.results?.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        );

        setDetails({
          ...detailsData,
          streamingProviders:
            providersData.results?.US?.flatrate || [],
        });
        setTrailerKey(trailer?.key || null);
      } catch (err) {
        console.error('Failed to fetch show details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailsAndTrailerAndStreaming();
  }, [show]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={modalSize}
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay />
      <MotionModalContent
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3 }}
      >
        <ModalHeader>{show?.name}</ModalHeader>
      <ModalCloseButton />
        <ModalBody pb={6}>
          {loading ? (
            <Spinner size="xl" thickness="4px" color="blue.500" />
          ) : details ? (
            <VStack align="start" spacing={4} color={bodyTextColor}>
              <Text fontSize="sm" color={secondaryTextColor}>
                First Air Date: {details.first_air_date}
              </Text>
              <Text fontSize="sm" color={secondaryTextColor}>
                Seasons: {details.number_of_seasons}
              </Text>
              <Text fontSize="sm" color={secondaryTextColor}>
                Episodes: {details.number_of_episodes}
              </Text>
              <Text fontSize="sm" color={secondaryTextColor}>
                Genres: {details.genres?.map((g) => g.name).join(', ') || 'Unknown'}
              </Text>
              <Text>{details.overview || 'No overview available.'}</Text>

              {/* Streaming Providers Logos */}
              <Text fontWeight="bold" mt={4}>
                Available On:
              </Text>
              {details.streamingProviders.length > 0 ? (
                <HStack spacing={3}>
                  {details.streamingProviders.map((provider) => (
                    <Link
                      key={provider.provider_id}
                      href={`https://www.themoviedb.org/tv/${show.id}/watch?locale=en-US#providers`}
                      isExternal
                      _hover={{ opacity: 0.8 }}
                      title={provider.provider_name}
                    >
                      <Tooltip label={provider.provider_name}>
                        <Image
                          src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                          alt={provider.provider_name}
                          boxSize="40px"
                          objectFit="contain"
                          draggable={false}
                        />
                      </Tooltip>
                    </Link>
                  ))}
                </HStack>
              ) : (
                <Text fontSize="sm" color={secondaryTextColor}>
                  Streaming info not available.
                </Text>
              )}

              {trailerKey ? (
                <AspectRatio ratio={16 / 9} w="100%">
                  <iframe
                    title="Trailer"
                    src={`https://www.youtube.com/embed/${trailerKey}`}
                    allowFullScreen
                  />
                </AspectRatio>
              ) : (
                <Text fontSize="sm" color={secondaryTextColor}>
                  Trailer unavailable.
                </Text>
              )}
            </VStack>
          ) : (
            <Text>Error loading show details.</Text>
          )}
        </ModalBody>
        <ModalFooter justifyContent="center">
          {isWatchlist ? (
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                onRemoveFromWatchlist(show.id);
                onClose();
              }}
            >
              Remove from Watchlist
            </Button>
          ) : (
            <Button
              colorScheme="green"
              mr={3}
              onClick={() => { onAddToWatchlist(show); onClose(); }}
            >
              Add to Watchlist
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  );
}

export default ShowModal;

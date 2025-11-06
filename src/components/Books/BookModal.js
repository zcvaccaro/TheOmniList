import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Image,
  Text,
  Button,
  VStack,
  HStack,
  Tag,
  Link,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';

const BookModal = ({ book, isOpen, onClose, onAddToWatchlist, onRemoveFromWatchlist, isWatchlist, onPersonSearch }) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  if (!book) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>{book.title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack align="start" spacing={5}>
            <Image
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              borderRadius="md"
              boxSize="250px"
              objectFit="contain"
              fallbackSrc="https://via.placeholder.com/200x300?text=No+Image"
            />
            <VStack align="start" spacing={3}>
              <Text fontSize="lg" fontWeight="bold">
                <Link
                  onClick={() => onPersonSearch(book.author, 'author')}
                  color="blue.400"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {book.author}
                </Link>
              </Text>
              <HStack>
                {book.averageRating ? (
                  <>
                    <Icon as={StarIcon} color="yellow.400" />
                    <Text>{book.averageRating} / 5 ({book.ratingsCount || 0} ratings)</Text>
                  </>
                ) : (
                  <Text color="gray.500">Not Rated</Text>
                )}
              </HStack>
              <Text fontSize="sm">Published: {book.publishedDate}</Text>
              <HStack wrap="wrap">
                {book.genres.map((genre) => (
                  <Tag key={genre} size="sm" colorScheme="purple">
                    {genre}
                  </Tag>
                ))}
              </HStack>
              <Text fontSize="sm" pt={2}>{book.description}</Text>
            </VStack>
          </HStack>
        </ModalBody>

        <ModalFooter justifyContent="center">
          {isWatchlist ? (
            <Button colorScheme="red" mr={3} onClick={() => onRemoveFromWatchlist(book.isbn)}>
              Remove from Reading List
            </Button>
          ) : (
            <Button colorScheme="green" mr={3} onClick={() => onAddToWatchlist(book)}>
              Add to Reading List
            </Button>
          )}
          {book.purchaseLink && (
            <Link href={book.purchaseLink} isExternal>
              <Button variant="ghost">Buy Now</Button>
            </Link>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BookModal;
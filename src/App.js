import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, VStack, SimpleGrid, useToast, Spinner, Text, useColorMode } from '@chakra-ui/react';

import Homepage from './components/Homepage';
import Header from './components/Header';
import MovieWatchlist from './components/movies/MovieWatchlist';
import MovieUpcomingReleases from './components/movies/MovieUpcomingReleases';
import MovieModal from './components/movies/MovieModal';
import MovieForYou from './components/movies/MovieForYou';
import ShowPopular from './components/TvShows/ShowPopular';
import ShowWatchlist from './components/TvShows/ShowWatchlist';
import ShowsForYou from './components/TvShows/ShowsForYou';
import ShowModal from './components/TvShows/ShowModal';
import BestsellersList from './components/Books/BestsellersList';
import BookModal from './components/Books/BookModal';
import ReadingList from './components/Books/ReadingList';
import BooksForYou from './components/Books/BooksForYou';
import SearchResultCard from './components/SearchResultCard';
import NavigateToSearch from './NavigateToSearch';
import { getWatchlist, saveWatchlist, getShowWatchlist, saveShowWatchlist } from './api/localStorage';
import { searchMovies, searchMulti, getPersonMovieCredits } from './api/tmdb';
import { searchTvShows } from './api/tmdb_tv';
import { searchBooks } from './api/bookApi';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [movieWatchlist, setMovieWatchlist] = useState(getWatchlist);
  const [showWatchlist, setShowWatchlist] = useState(getShowWatchlist);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [readingList, setReadingList] = useState(() => JSON.parse(localStorage.getItem('readingList')) || []);

  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [needsNav, setNeedsNav] = useState(false);
  const toast = useToast();
  const { setColorMode } = useColorMode();

  // Force dark mode on initial load
  useEffect(() => {
    setColorMode('dark');
  }, [setColorMode]);

  useEffect(() => {
    saveWatchlist(movieWatchlist);
  }, [movieWatchlist]);

  useEffect(() => {
    saveShowWatchlist(showWatchlist);
  }, [showWatchlist]);

  useEffect(() => {
    localStorage.setItem('readingList', JSON.stringify(readingList));
  }, [readingList]);

  // Helper to fetch multiple pages of results from TMDB
  const fetchAllPages = async (searchFunction, query) => {
    const totalPagesToFetch = 3; // Fetch first 3 pages
    const pagePromises = [];
    for (let page = 1; page <= totalPagesToFetch; page++) {
      pagePromises.push(searchFunction(query, page));
    }

    const pages = await Promise.all(pagePromises);
    let allResults = [];
    pages.forEach(pageData => {
      if (pageData && pageData.results) {
        allResults = allResults.concat(pageData.results);
      }
    });
    return allResults;
  };

  const handleSearch = async (query, category = 'all') => {
    if (!query.trim()) return;
    setSearchResults([]); // Clear previous results immediately
    setIsSearchLoading(true);
    try {
      let results = [];
      if (category === 'all') {
        const multiResults = await searchMulti(query);
        const personResult = multiResults.results?.find(r => r.media_type === 'person');

        if (personResult) {
          // If a person is found, get their movie credits and filter by director.
          const credits = await getPersonMovieCredits(personResult.id);
          results = credits.crew
            .filter(movie => movie.job === 'Director')
            .map(movie => ({ ...movie, type: 'movie' }));
        } else {
          // Fetch multiple pages for general 'all' search
          results = multiResults.results.filter(
            item => item.media_type === 'movie' || item.media_type === 'tv'
          ).map(item => ({
            ...item,
            type: item.media_type, // 'movie' or 'tv'
          }));
        }

        try {
          const bookResults = await searchBooks(query);
          results = results.concat(bookResults);
        } catch (error) {
          console.warn("Book search failed:", error);
        }
      } else if (category === 'director') {
        const multiResults = await searchMulti(query);
        const personResult = multiResults.results?.find(r => r.media_type === 'person');
        if (personResult) {
          const credits = await getPersonMovieCredits(personResult.id);
          results = credits.crew
            .filter(movie => movie.job === 'Director')
            .map(movie => ({ ...movie, type: 'movie' }));
        }
      } else if (category === 'author') {
        const bookResults = await searchBooks(query, 'author');
        results = results.concat(bookResults);
      } else if (category === 'movie') {
        const movieResults = await fetchAllPages(searchMovies, query);
        results = results.concat(movieResults.map(movie => ({
            ...movie,
            type: 'movie',
        })));
      } else if (category === 'tv') {
        const tvResults = await fetchAllPages(searchTvShows, query);
        results = results.concat(tvResults.map(show => ({
            ...show,
            type: 'tv',
        })));
      } else if (category === 'book') {
        const bookResults = await searchBooks(query);
        results = results.concat(bookResults);
      }

      // Sort results by popularity or relevance before displaying
      results.sort((a, b) => {
        const isABook = a.type === 'book';
        const isBBook = b.type === 'book';

        // If one is a book and the other isn't, the non-book (movie/TV) comes first.
        if (isABook && !isBBook) return 1;
        if (!isABook && isBBook) return -1;

        // If both are books, don't re-sort them. Maintain API's relevance order.
        if (isABook && isBBook) return 0;

        // Otherwise, sort movies/TV shows by popularity.
        const popularityA = a.popularity || 0;
        const popularityB = b.popularity || 0;
        return popularityB - popularityA;
      });

      if (results.length > 0) {
        setSearchResults(results);
      } else {
        setSearchResults([]);
        toast({
          title: 'No results found.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }

    } catch (error) {
      console.error('Error during search:', error);
      toast({
        title: 'Search failed.',
        description: error.message || 'Something went wrong while searching.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handlePersonSearch = (name, category) => {
    handleCloseModal();
    setTimeout(() => {
      handleSearch(name, category);
      setNeedsNav(true); // Trigger navigation
    }, 100);
  };

  const handleAddItemToWatchlist = (item) => {
    if (item.type === 'movie') {
      handleAddMovieToWatchlist(item);
    } else if (item.type === 'tv') {
      handleAddShowToWatchlist(item);
    } else if (item.type === 'book') {
      handleAddBookToWatchlist(item);
    }
  };

  const handleAddMovieToWatchlist = (movie) => {
    if (!movieWatchlist.some((m) => m.id === movie.id)) {
      setMovieWatchlist((prev) => [...prev, movie]);
      toast({
        title: `${movie.title} added to watchlist.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveMovieFromWatchlist = (movieId) => {
    setMovieWatchlist((prev) => prev.filter((movie) => movie.id !== movieId));
    toast({
      title: 'Removed from watchlist.',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAddShowToWatchlist = (show) => {
    if (!showWatchlist.some((s) => s.id === show.id)) {
      setShowWatchlist((prev) => [...prev, show]);
      toast({
        title: `${show.name} added to watchlist.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveShowFromWatchlist = (showId) => {
    setShowWatchlist((prev) => prev.filter((show) => show.id !== showId));
    toast({
      title: 'Removed from watchlist.',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAddBookToWatchlist = (book) => {
    // Ensure the book object has a genres array before adding
    const bookWithGenres = { ...book, genres: book.genres || [] };

    if (!readingList.some((b) => b.isbn === bookWithGenres.isbn)) {
      setReadingList((prev) => [...prev, bookWithGenres]);
      toast({
        title: `${book.title} added to reading list.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveBookFromWatchlist = (bookIsbn) => {
    setReadingList((prev) => prev.filter((book) => book.isbn !== bookIsbn));
    toast({
      title: 'Removed from reading list.',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSelectItem = (item) => {
    if (item.type === 'movie') {
      setSelectedMovie(item);
    } else if (item.type === 'tv') {
      setSelectedShow(item);
    } else if (item.type === 'book') {
      handleSelectBook(item);
    }
  };
  const handleSelectBook = (book) => setSelectedBook(book);
  const handleCloseModal = () => { setSelectedMovie(null); setSelectedShow(null); setSelectedBook(null); };

  const isMovieInWatchlist = selectedMovie ? movieWatchlist.some(m => m.id === selectedMovie.id) : false;
  const isShowInWatchlist = selectedShow ? showWatchlist.some(s => s.id === selectedShow.id) : false;
  const isBookInWatchlist = selectedBook ? readingList.some(b => b.isbn === selectedBook.isbn) : false;

  const movieWatchlistIds = new Set(movieWatchlist.map(m => m.id));
  const showWatchlistIds = new Set(showWatchlist.map(s => s.id));
  const readingListIsbns = new Set(readingList.map(b => b.isbn));

  return (
    <Router basename={process.env.PUBLIC_URL}>
      {needsNav && <NavigateToSearch onNavigate={() => setNeedsNav(false)} />}
      <Header onSearch={handleSearch} />

      <Container maxW="container.xl" overflowX="hidden">
        <Routes>
          <Route path="/" element={<Homepage />} />

          <Route
            path="/movies/foryou"
            element={<MovieForYou
                watchlist={movieWatchlist}
                onAddToWatchlist={handleAddMovieToWatchlist}
                onRemoveFromWatchlist={handleRemoveMovieFromWatchlist}
                onSelect={setSelectedMovie}
              />}
          />

          <Route
            path="/movies/watchlist"
            element={<MovieWatchlist
                watchlist={movieWatchlist}
                onRemove={handleRemoveMovieFromWatchlist}
                onSelect={setSelectedMovie}
              />}
          />

          <Route
            path="/movies/upcoming"
            element={<MovieUpcomingReleases
                watchlist={movieWatchlist}
                onAddToWatchlist={handleAddMovieToWatchlist}
                onRemoveFromWatchlist={handleRemoveMovieFromWatchlist}
                onSelect={setSelectedMovie}
              />}
          />

          {/* TV Show Routes */}
          <Route
            path="/tvshows/foryou"
            element={<ShowsForYou
                watchlist={showWatchlist}
                onAdd={handleAddShowToWatchlist}
                onRemove={handleRemoveShowFromWatchlist}
                onClick={setSelectedShow}
              />}
          />
          <Route
            path="/tvshows/popular"
            element={<ShowPopular
                watchlist={showWatchlist}
                onAdd={handleAddShowToWatchlist}
                onRemove={handleRemoveShowFromWatchlist}
                onClick={setSelectedShow}
              />}
          />
          <Route
            path="/tvshows/watchlist"
            element={<ShowWatchlist
                watchlist={showWatchlist}
                onRemove={handleRemoveShowFromWatchlist}
                onSelect={setSelectedShow}
              />}
          />

          {/* Book Routes */}
          <Route
            path="/books/foryou"
            element={<BooksForYou
                readingList={readingList}
                onAdd={handleAddBookToWatchlist}
                onRemove={handleRemoveBookFromWatchlist}
                onClick={handleSelectBook}
              />}
          />
          <Route
            path="/books/bestsellers"
            element={<BestsellersList
                onAdd={handleAddBookToWatchlist}
                onRemove={handleRemoveBookFromWatchlist}
                onClick={handleSelectBook}
                watchlist={readingList}
              />}
          />
          <Route
            path="/books/watchlist"
            element={<ReadingList
              watchlist={readingList}
              onRemove={handleRemoveBookFromWatchlist}
              onSelect={handleSelectBook}
            />}
          />

          {/* Optional: Add search results page or keep search results on home */}
          <Route
            path="/search"
            element={
              isSearchLoading ? (
                <VStack justify="center" align="center" height="50vh">
                  <Spinner size="xl" />
                  <Text>Searching...</Text>
                </VStack>
              ) : (
                <VStack spacing={6} pt={6} pb={10} overflowX="hidden">
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={6} w="100%">
                    {searchResults.map((item) => (
                      <SearchResultCard
                        key={`${item.type}-${item.id || item.isbn}`}
                        item={item}
                        onAdd={() => handleAddItemToWatchlist(item)}
                        onRemove={(itemToRemove) => {
                          if (itemToRemove.type === 'movie') handleRemoveMovieFromWatchlist(itemToRemove.id);
                          if (itemToRemove.type === 'tv') handleRemoveShowFromWatchlist(itemToRemove.id);
                          if (itemToRemove.type === 'book') handleRemoveBookFromWatchlist(itemToRemove.isbn);
                        }}
                        onClick={handleSelectItem}
                        inWatchlist={
                          (item.type === 'movie' && movieWatchlistIds.has(item.id)) ||
                          (item.type === 'tv' && showWatchlistIds.has(item.id)) ||
                          (item.type === 'book' && readingListIsbns.has(item.isbn))
                        }
                      />
                    ))}
                  </SimpleGrid>
                </VStack>
              )
            }
          />
        </Routes>
      </Container>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          isOpen={!!selectedMovie}
          onClose={handleCloseModal}
          onAddToWatchlist={handleAddMovieToWatchlist}
          onRemoveFromWatchlist={handleRemoveMovieFromWatchlist}
          isWatchlist={isMovieInWatchlist}
          onPersonSearch={handlePersonSearch}
        />
      )}

      {selectedShow && (
        <ShowModal
          show={selectedShow}
          isOpen={!!selectedShow}
          onClose={handleCloseModal}
          onAddToWatchlist={handleAddShowToWatchlist}
          onRemoveFromWatchlist={handleRemoveShowFromWatchlist}
          isWatchlist={isShowInWatchlist}
          onPersonSearch={handlePersonSearch}
        />
      )}

      {selectedBook && (
        <BookModal
          book={selectedBook}
          isOpen={!!selectedBook}
          onClose={handleCloseModal}
          onAddToWatchlist={handleAddBookToWatchlist}
          onRemoveFromWatchlist={handleRemoveBookFromWatchlist}
          isWatchlist={isBookInWatchlist}
          onPersonSearch={handlePersonSearch}
        />
      )}
    </Router>
  );
}

export default App;
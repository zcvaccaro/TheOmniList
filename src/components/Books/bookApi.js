const NYT_API_KEY = process.env.REACT_APP_NYT_API_KEY;
const GOOGLE_BOOKS_API_KEY = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;

/**
 * Fetches the current New York Times hardcover fiction bestseller list.
 * @param {string} listName The encoded name of the list (e.g., 'hardcover-fiction').
 * @returns {Promise<Array<any>>} A promise that resolves to an array of bestseller books.
 */
async function getBestsellers(listName = 'combined-print-and-e-book-fiction') {
  const url = `https://api.nytimes.com/svc/books/v3/lists/current/${listName}.json?api-key=${NYT_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NYT API error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.results.books || [];
  } catch (error) {
    console.error("Error fetching bestsellers from NYT:", error);
    return [];
  }
}

/**
 * Fetches detailed book information from the Google Books API using an ISBN.
 * @param {string} isbn The 13-digit ISBN of the book.
 * @returns {Promise<object|null>} A promise that resolves to the book's volume info.
 */
async function getBookDetailsByISBN(isbn) {
  if (!isbn) return null;

  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${GOOGLE_BOOKS_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Books API error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.items && data.items.length > 0 ? data.items[0] : null;
  } catch (error) {
    console.error(`Error fetching details for ISBN ${isbn}:`, error);
    return null;
  }
}

/**
 * Fetches the NYT bestseller list and enriches each book with details from Google Books.
 * @param {string} listName The encoded name of the list to fetch.
 * @returns {Promise<Array<object>>} A promise that resolves to a combined and cleaned list of books.
 */
export async function fetchBestsellersWithDetails(listName) {
  const bestsellers = await getBestsellers(listName);
  if (!bestsellers.length) {
    return [];
  }

  // Create an array of promises, one for each book detail fetch
  const detailPromises = bestsellers.map(book => getBookDetailsByISBN(book.primary_isbn13));

  // Wait for all detail fetches to complete
  const bookDetails = await Promise.all(detailPromises);

  // Combine the bestseller info with the detailed info
  const combinedBooks = bestsellers.map((book, index) => {
    const details = bookDetails[index];
    const volumeInfo = details?.volumeInfo;
    const saleInfo = details?.saleInfo;

    return {
      // From NYT
      rank: book.rank,
      title: book.title,
      author: book.author,
      description: book.description,
      bestsellerWeeks: book.weeks_on_list,
      // From Google Books
      coverImage: volumeInfo?.imageLinks?.thumbnail,
      publishedDate: volumeInfo?.publishedDate,
      genres: volumeInfo?.categories || [],
      averageRating: volumeInfo?.averageRating,
      ratingsCount: volumeInfo?.ratingsCount,
      purchaseLink: saleInfo?.buyLink,
      isbn: book.primary_isbn13,
    };
  });

  console.log("Fetched and combined book data:", combinedBooks);
  return combinedBooks;
}

/**
 * Searches for books using the Google Books API.
 * @param {string} query The search term.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of book results.
 */
export async function searchBooks(query, searchType = 'general') {
  if (!query) return [];

  let enhancedQuery;
  if (searchType === 'author') {
    enhancedQuery = `inauthor:"${query}"`;
  } else {
    // A general search for the query OR a specific search in the author field gives a good balance.
    enhancedQuery = `${query} OR inauthor:${query}`;
  }

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(enhancedQuery)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=40`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Books search API error! Status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.items) return [];

    // Clean and format the data to match our app's structure
    const formattedBooks = data.items.map(item => {
      const volumeInfo = item.volumeInfo;
      const saleInfo = item.saleInfo;
      return {
        // Explicitly map properties needed by BookCard/BookModal
        // Spreading volumeInfo might bring in too much or not enough consistently
        type: 'book', // Add type for unified search results
        title: volumeInfo.title,
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
        coverImage: volumeInfo.imageLinks?.thumbnail,
        genres: volumeInfo.categories || [],
        averageRating: volumeInfo.averageRating,
        description: volumeInfo.description, // Ensure description is included
        ratingsCount: volumeInfo.ratingsCount,
        isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier,
        purchaseLink: saleInfo?.buyLink,
      };
    });
    return formattedBooks;
  } catch (error) {
    console.error("Error searching for books:", error);
    return [];
  }
}
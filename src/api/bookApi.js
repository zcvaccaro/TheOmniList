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

export const searchBooks = async (query, searchType = 'all') => {
  if (!query) return [];

  const cleanQuery = query.replace(/"/g, '');

  let apiQuery;
  if (searchType === 'author') {
    apiQuery = `inauthor:"${cleanQuery}"`;
  } else {
    // Use broad query to let Google's relevance engine find popular books (e.g. "Star Wars" for "star")
    apiQuery = cleanQuery;
  }
  
  // Fetch 10 pages (400 results) to increase the pool of candidates for sorting by popularity
  const urls = [];
  for (let i = 0; i < 10; i++) {
    urls.push(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(apiQuery)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=40&printType=books&langRestrict=en&orderBy=relevance&startIndex=${i * 40}`);
  }

  try {
    const responses = await Promise.all(urls.map(url => fetch(url)));
    const dataResults = await Promise.all(responses.map(async res => {
        if (!res.ok) return { items: [] };
        return res.json();
    }));

    const allItems = dataResults.flatMap(data => data.items || []);
    
    // Deduplicate items by ID
    const uniqueItemsMap = new Map();
    allItems.forEach(item => {
        if (item.id && !uniqueItemsMap.has(item.id)) {
            uniqueItemsMap.set(item.id, item);
        }
    });
    const uniqueItems = Array.from(uniqueItemsMap.values());

    if (uniqueItems.length === 0) return [];

    // Clean and format the data to match our app's structure
    const formattedBooks = uniqueItems.map((item, index) => {
      const volumeInfo = item.volumeInfo;
      const saleInfo = item.saleInfo;
      return {
        id: item.id,
        type: 'book',
        title: volumeInfo.title,
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
        coverImage: volumeInfo.imageLinks?.thumbnail,
        genres: volumeInfo.categories || [],
        averageRating: Number(volumeInfo.averageRating) || 0,
        description: volumeInfo.description,
        ratingsCount: Number(volumeInfo.ratingsCount) || 0,
        popularity: Number(volumeInfo.ratingsCount) || 0,
        subtitle: volumeInfo.subtitle,
        isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || item.id,
        purchaseLink: saleInfo?.buyLink,
        publishedDate: volumeInfo.publishedDate,
        release_date: volumeInfo.publishedDate, // Keep release_date for compatibility
        pageCount: volumeInfo.pageCount,
        originalIndex: index,
      };
    }).filter(book => {
      // 1. Basic Field Validation
      if (!book.title || !book.isbn || !book.publishedDate) return false;

      // 2. Content Quality Validation
      const authorLower = book.author.toLowerCase();
      if (
        book.author === 'Unknown Author' || 
        authorLower.includes('anonymous') || 
        authorLower === 'n/a'
      ) return false;

      // 3. Junk Filtering
      const titleLower = book.title.toLowerCase();
      const subtitleLower = (book.subtitle || '').toLowerCase();

      const badTitleKeywords = ['report', 'bulletin', 'journal', 'proceedings', 'acts', 'statutes', 'directory', 'almanac', 'yearbook', 'annual', 'catalogue', 'index', 'register', 'legislature', 'congressional', 'regulations', 'summary', 'digest'];
      const badAuthorKeywords = ['united states', 'congress', 'committee', 'department', 'bureau', 'office', 'commission', 'board', 'ministry', 'govt', 'government', 'archive', 'library', 'u.s.', 'dept.', 'inc.', 'ltd.', 'association', 'society', 'council', 'administration'];

      if (badTitleKeywords.some(kw => titleLower.includes(kw))) return false;
      if (badAuthorKeywords.some(kw => authorLower.includes(kw))) return false;

      // 4. Old Publications Check
      const yearMatch = book.publishedDate.match(/^(\d{4})/);
      if (!yearMatch || parseInt(yearMatch[1], 10) < 1900) return false;

      // 5. Page Count Check
      if (book.pageCount && book.pageCount < 40) return false;

      // 6. Relevance Check
      if (searchType !== 'author') {
        const queryTerms = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
        if (queryTerms.length > 0) {
           const matchesMeta = queryTerms.some(term => {
             return titleLower.includes(term) || subtitleLower.includes(term) || authorLower.includes(term);
           });
           if (!matchesMeta) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const ratingDiff = (b.ratingsCount || 0) - (a.ratingsCount || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return a.originalIndex - b.originalIndex;
    });

    return formattedBooks;
  } catch (error) {
    console.error("Error searching for books:", error);
    return [];
  }
};
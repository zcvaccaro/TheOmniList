const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export const searchBooks = async (query, type = 'all') => {
  let searchQuery = query;
  if (type === 'author') {
    searchQuery = `inauthor:${query}`;
  }
  
  const url = `${BASE_URL}?q=${encodeURIComponent(searchQuery)}&maxResults=20`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  if (!data.items) {
      return [];
  }

  return data.items.map((item) => {
    const info = item.volumeInfo;
    return {
      id: item.id,
      title: info.title,
      author: info.authors ? info.authors.join(', ') : 'Unknown Author',
      description: info.description,
      coverImage: info.imageLinks?.thumbnail,
      release_date: info.publishedDate,
      isbn: info.industryIdentifiers ? info.industryIdentifiers[0]?.identifier : item.id,
      type: 'book',
      genres: info.categories || []
    };
  });
};
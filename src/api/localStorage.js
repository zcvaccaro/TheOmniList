export const getWatchlist = () => {
  const stored = localStorage.getItem('watchlist');
  return stored ? JSON.parse(stored) : [];
};

export const saveWatchlist = (watchlist) => {
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
};

export const getShowWatchlist = () => {
    const stored = localStorage.getItem('showWatchlist');
    return stored ? JSON.parse(stored) : [];
};

export const saveShowWatchlist = (watchlist) => {
    localStorage.setItem('showWatchlist', JSON.stringify(watchlist));
};
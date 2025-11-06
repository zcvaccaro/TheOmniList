import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import ShowPopular from './ShowPopular';
import ShowWatchlist from './ShowWatchlist';
import ShowModal from './ShowModal';
import { getShowWatchlist, saveShowWatchlist } from '../../api/localStorage';

const TVShowsPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);

  useEffect(() => {
    setWatchlist(getShowWatchlist());
  }, []);

  const handleAddToWatchlist = (show) => {
    const newWatchlist = [...watchlist, show];
    setWatchlist(newWatchlist);
    saveShowWatchlist(newWatchlist);
  };

  const handleRemoveFromWatchlist = (show) => {
    const newWatchlist = watchlist.filter((item) => item.id !== show.id);
    setWatchlist(newWatchlist);
    saveShowWatchlist(newWatchlist);
  };

  const handleSelectShow = (show) => {
    setSelectedShow(show);
  };

  const closeModal = () => {
    setSelectedShow(null);
  };

  return (
    <Box>
      <ShowPopular onAdd={handleAddToWatchlist} onClick={handleSelectShow} />
      <ShowWatchlist
        watchlist={watchlist}
        onRemove={handleRemoveFromWatchlist}
        onSelect={handleSelectShow}
      />
      {selectedShow && (
        <ShowModal
          show={selectedShow}
          isOpen={!!selectedShow}
          onClose={closeModal}
          onAddToWatchlist={handleAddToWatchlist}
        />
      )}
    </Box>
  );
};

export default TVShowsPage;
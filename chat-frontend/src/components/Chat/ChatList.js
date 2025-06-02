import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { List, ListItem, ListItemText, Avatar, Typography, TextField, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  search: {
    padding: theme.spacing(2),
  },
  list: {
    flex: 1,
    overflowY: 'auto',
  },
  active: {
    backgroundColor: theme.palette.action.selected,
  },
}));

const ChatList = () => {
  const classes = useStyles();
  const { contacts, loading, selectedContact, selectContact, searchUsers } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef(null);

  // Memoized search function with proper debouncing
  const performSearch = useCallback(async (query) => {
    if (query.trim()) {
      setIsSearching(true);
      try {
        const results = await searchUsers(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  }, [searchUsers]);

  // Handle input changes with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Memoized contact click handler
  const handleContactClick = useCallback((contact) => {
    selectContact(contact);
  }, [selectContact]);

  // Determine what to display
  const displayItems = searchQuery ? searchResults : contacts;
  const showEmptyState = !loading && !isSearching && displayItems.length === 0;

  return (
    <Box className={classes.root}>
      <Box className={classes.search}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleInputChange}
        />
      </Box>
      <List className={classes.list}>
        {loading || isSearching ? (
          <Typography align="center">Loading...</Typography>
        ) : showEmptyState ? (
          <Typography align="center">
            {searchQuery ? 'No results found' : 'No contacts available'}
          </Typography>
        ) : (
          displayItems.map((contact) => (
            <ListItem
              key={contact._id}
              button
              onClick={() => handleContactClick(contact)}
              className={selectedContact?._id === contact._id ? classes.active : ''}
            >
              <Avatar>{contact.name.charAt(0)}</Avatar>
              <ListItemText
                primary={contact.name}
                secondary={contact.email}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default React.memo(ChatList);
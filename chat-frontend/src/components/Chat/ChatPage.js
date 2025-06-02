import React, { useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Box, makeStyles } from '@material-ui/core';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: '30%',
    borderRight: '1px solid #e0e0e0',
    backgroundColor: 'white',
    [theme.breakpoints.down('sm')]: {
      width: '40%',
    },
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
}));

const ChatPage = () => {
  const classes = useStyles();
  const { getContacts } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getContacts();
    }
  }, [user, getContacts]);

  return (
    <Box className={classes.root}>
      <Box className={classes.sidebar}>
        <ChatList />
      </Box>
      <Box className={classes.main}>
        <ChatWindow />
      </Box>
    </Box>
  );
};

export default ChatPage;

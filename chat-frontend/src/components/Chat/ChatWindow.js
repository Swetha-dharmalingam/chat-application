import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Avatar, makeStyles } from '@material-ui/core';
import Message from './Message';
import MessageInput from './MessageInput';
import ScheduleMessageModal from './ScheduleMessageModal';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: theme.spacing(2),
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: '#e5ddd5',
    backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png")',
  },
  empty: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
}));

const ChatWindow = () => {
  const classes = useStyles();
  const { selectedContact, messages, loading, sendMessage, scheduleMessage } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content) => {
    if (content.trim()) {
      sendMessage(content);
    }
  };

  const handleScheduleMessage = (content, dateTime) => {
    scheduleMessage(content, dateTime);
    setScheduleModalOpen(false);
  };

  if (!selectedContact) {
    return (
      <Box className={classes.root}>
        <Box className={classes.empty}>
          <Typography variant="h6">Select a contact to start chatting</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Avatar>{selectedContact.name.charAt(0)}</Avatar>
        <Box ml={2}>
          <Typography variant="h6">{selectedContact.name}</Typography>
          <Typography variant="body2" color="textSecondary">
            {selectedContact.email}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.messages}>
        {loading && !messages.length ? (
          <Typography align="center">Loading messages...</Typography>
        ) : (
          messages.map((message) => (
            <Message
              key={message._id}
              message={message}
              isCurrentUser={message.sender._id === user.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>
      <MessageInput 
        onSend={handleSendMessage} 
        onSchedule={() => setScheduleModalOpen(true)} 
      />
      <ScheduleMessageModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={handleScheduleMessage}
      />
    </Box>
  );
};

export default ChatWindow;


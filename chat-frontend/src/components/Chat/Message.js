import React from 'react';
import { Box, Typography, Avatar, makeStyles } from '@material-ui/core';
import { format } from 'date-fns';
import { Schedule } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  messageContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(2),
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  messageContent: {
    maxWidth: '70%',
  },
  messageBubble: {
    padding: theme.spacing(1, 2),
    borderRadius: '18px',
    backgroundColor: '#dcf8c6',
    display: 'inline-block',
  },
  otherUserBubble: {
    backgroundColor: 'white',
  },
  messageInfo: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: theme.spacing(0.5),
  },
  time: {
    fontSize: '0.75rem',
    color: 'rgba(0, 0, 0, 0.5)',
    marginLeft: theme.spacing(1),
  },
  scheduledIndicator: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: 'rgba(0, 0, 0, 0.5)',
    marginLeft: theme.spacing(1),
  },
  scheduledIcon: {
    fontSize: '0.875rem',
    marginRight: theme.spacing(0.5),
  },
}));

const Message = ({ message, isCurrentUser }) => {
  const classes = useStyles();
  console.log('Rendering message:', message);

  return (
    <Box className={`${classes.messageContainer} ${isCurrentUser ? classes.currentUserMessage : ''}`}>
      {!isCurrentUser && (
        <Avatar style={{ marginRight: '8px' }}>
          {message.sender?.name?.charAt(0) || '?'}
        </Avatar>
      )}
      <Box className={classes.messageContent}>
        <Box
          className={`${classes.messageBubble} ${!isCurrentUser ? classes.otherUserBubble : ''}`}
        >
          <Typography>{message.content}</Typography>
        </Box>
        <Box className={classes.messageInfo}>
          {message.isScheduled && (
            <Box className={classes.scheduledIndicator}>
              <Schedule className={classes.scheduledIcon} />
              <Typography>
                Scheduled for {format(new Date(message.scheduledTime), 'MMM d, hh:mm a')}
              </Typography>
            </Box>
          )}
          <Typography className={classes.time}>
            {format(new Date(message.timestamp || new Date()), 'hh:mm a')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Message;


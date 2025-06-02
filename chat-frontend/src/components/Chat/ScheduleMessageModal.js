import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@material-ui/core';
import { DateTimePicker } from '@material-ui/pickers';

const ScheduleMessageModal = ({ open, onClose, onSchedule }) => {
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date());

  const handleSchedule = () => {
    console.log('Scheduling message:', { message, scheduledTime });
    if (message.trim()) {
      onSchedule(message, scheduledTime);
      setMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Schedule Message</DialogTitle>
      <DialogContent>
        <TextField
          label="Message"
          multiline
          minRows={2}
          fullWidth
          variant="outlined"
          margin="normal"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <DateTimePicker
          label="Schedule Time"
          value={scheduledTime}
          onChange={(newTime) => {
            console.log('New scheduled time:', newTime);
            setScheduledTime(newTime);
          }}
          minDate={new Date()}
          showTodayButton
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSchedule} 
          color="primary" 
          variant="contained"
          disabled={!message.trim()}
        >
          Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleMessageModal;
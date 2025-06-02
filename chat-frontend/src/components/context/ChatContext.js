import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Check for scheduled messages every minute
  useEffect(() => {
    const checkScheduledMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        const res = await axios.get('http://localhost:5000/api/chat/scheduled', config);
        if (res.data.length > 0) {
          // Add any newly sent scheduled messages to the current chat
          const newMessages = res.data.filter(msg => 
            (msg.sender._id === selectedContact?._id && msg.receiver._id === user.id) ||
            (msg.receiver._id === selectedContact?._id && msg.sender._id === user.id)
          );
          if (newMessages.length > 0) {
            setMessages(prev => [...prev, ...newMessages]);
          }
        }
      } catch (err) {
        console.error('Error checking scheduled messages:', err);
      }
    };

    const interval = setInterval(checkScheduledMessages, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, selectedContact]);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      newSocket.emit('join', user.id);
      newSocket.on('newMessage', (message) => {
        if (
          (message.sender._id === selectedContact?._id && message.receiver._id === user.id) ||
          (message.receiver._id === selectedContact?._id && message.sender._id === user.id)
        ) {
          setMessages(prev => [...prev, message]);
        }
      });

      return () => newSocket.close();
    }
  }, [user, selectedContact]);

const getContacts = useCallback(async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const config = {
      headers: {
        'x-auth-token': token
      }
    };

    console.log('Fetching contacts...'); // Debug log
    const res = await axios.get('http://localhost:5000/api/chat/contacts', config);
    
    // Validate response structure
    if (!Array.isArray(res.data)) {
      throw new Error('Invalid contacts data format');
    }

    setContacts(res.data);
  } catch (err) {
    console.error('Failed to fetch contacts:', err);
    // Optionally set error state here
  } finally {
    setLoading(false);
  }
}, []);

  const getMessages = async (contactId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      const res = await axios.get(`http://localhost:5000/api/chat/messages/${contactId}`, config);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      const res = await axios.post('http://localhost:5000/api/chat/send', {
        receiverId: selectedContact._id,
        content
      }, config);
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  };
  const scheduleMessage = async (content, scheduledTime) => {
    try {
      console.log('Scheduling message:', { content, scheduledTime });
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      const res = await axios.post('http://localhost:5000/api/chat/schedule', {
        receiverId: selectedContact._id,
        content,
        scheduledTime
      }, config);
      
      console.log('Schedule response:', res.data);
      
      // Add the scheduled message to the UI with a scheduled indicator
      const scheduledMessage = {
        ...res.data,
        isScheduled: true,
        scheduledTime: new Date(scheduledTime)
      };
      console.log('Adding scheduled message to UI:', scheduledMessage);
      setMessages(prev => [...prev, scheduledMessage]);
    } catch (err) {
      console.error('Error scheduling message:', err);
      throw err;
    }
  };

  const searchUsers = async (query) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
  const res = await axios.get(`http://localhost:5000/api/auth/search?query=${query}`, config);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const selectContact = (contact) => {
    setSelectedContact(contact);
    if (contact) {
      getMessages(contact._id);
    }
  };

  return (
    <ChatContext.Provider value={{
      contacts,
      selectedContact,
      messages,
      loading,
  getContacts,
      sendMessage,
      scheduleMessage,
      searchUsers,
      selectContact
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

import React, { useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';

const socket = io(config.BOT_SERVER_ENDPOINT, {
  transports: ['websocket', 'polling', 'flashsocket'],
});

const ME = 'me';

const BOT = 'bot';

function Messages() {
  const [message, setMessage] = useState('');
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.off('bot-message');
    socket.on('bot-message', (message) => {
      setMessages([...messages, { message, user: BOT, id: Math.random() }]);
      playReceive();
      setLatestMessage(BOT, message);
    });
  }, [messages]);

  const sendMessage = () => {
    if (!message) {
      return;
    }
    setMessages([...messages, { message, user: ME, id: Math.random() }]);
    playSend();
    socket.emit('user-message', message);
    setMessage('');
    document.getElementById('user-message-input').value = '';
  };

  const onChangeMessage = ({ target: { value } }) => {
    setMessage(value);
  };

  return (
    <div className='messages'>
      <Header />
      <div className='messages__list' id='message-list'>
        {messages.map((m, i) => (
          <Message message={m} nextMessage={messages[i + 1]}></Message>
        ))}
      </div>
      <Footer
        message={message}
        sendMessage={sendMessage}
        onChangeMessage={onChangeMessage}
      />
    </div>
  );
}

export default Messages;

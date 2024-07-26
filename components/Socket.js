// components/Socket.js
import io from 'socket.io-client';

const socket = io('http://localhost:3009');

export default socket;

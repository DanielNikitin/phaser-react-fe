import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import socket from '../components/Socket';

const Main = dynamic(() => import('../components/Main'), { ssr: false });

const Game = () => {
  const [name, setName] = useState('');
  const [serverStatus, setServerStatus] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let updateInterval = null;

    const handleServerStatus = (status) => {
      setServerStatus(status);
      setConnectionStatus('connected');
    };

    const startUpdateInterval = () => {
      updateInterval = setInterval(() => {
        setConnectionStatus('reconnecting');
        socket.emit('checkStatus');
      }, 1000);
    };

    socket.on('server-status', handleServerStatus);
    socket.on('connect_error', () => setConnectionStatus('Connection Error'));

    if (serverStatus === '') {
      startUpdateInterval();
    }

    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
      socket.off('server-status', handleServerStatus);
    };
  }, [serverStatus]);

  const handleLogin = () => {
    if (serverStatus === '') {
      setErrorMessage('Server is offline. Please try again later.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (name.trim() === '') {
      setErrorMessage('Name cannot be empty');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsLoggedIn(true);
    socket.emit('join', { name });
  };

  useEffect(() => {
    const handleUpdateUsers = ({ users }) => {
      setUsers(users);
    };

    socket.on('updateUsers', handleUpdateUsers);

    return () => {
      socket.off('updateUsers', handleUpdateUsers);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
      <div className={`absolute inset-0 bg-center bg-no-repeat bg-cover ${isLoggedIn ? 'bg-bg10' : 'bg-bg11'}`}>
        <div className={`absolute bottom-4 left-4 ${connectionStatus === 'connected' ? 'text-green-500' : 'text-orange-500'}`}>
          {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'reconnecting' ? 'Connection Error' : 'Reconnecting...'}
        </div>

        {!isLoggedIn ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <input
                type="text"
                className="bg-slate-800 p-2 rounded border-2 border-gray-700 focus:border-gray-400"
                placeholder="ENTER YOUR NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
              <button
                onClick={handleLogin}
                className="bg-gray-500/30 border-color text-white mx-2 p-2 rounded transition-colors duration-300 hover:bg-gray-500/60"
              >
                ENTER
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-0 inset-0 flex items-center justify-center">
            <Main />
          </div>
        )}

        {errorMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;

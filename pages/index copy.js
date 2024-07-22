import React, { useEffect, useLayoutEffect, useState } from 'react';
import io from 'socket.io-client';
import Copyright from '../components/Copyright';

// Создаем сокет-клиент и подключаемся к серверу
const socket = io('http://localhost:5000');

const Chat = () => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [serverStatus, setServerStatus] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [totalRespect, setTotalRespect] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [textColorId, setTextColorId] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationCount, setAnimationCount] = useState(0);












  useLayoutEffect(() => {
    socket.on('server-status', (serverStatus) => {
      console.log(`SS 1 :: ${serverStatus}`);
      setServerStatus(serverStatus);
    });

    // Обработчики для состояния соединения
    socket.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('server-status');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);


  useLayoutEffect(() => {
    console.log('first this');
    let statusCheckInterval = null;

    const checkServerStatus = () => {
      if (serverStatus === '') {
        console.log('server offline');
        console.log(`SS 2 :: ${serverStatus}`);
        statusCheckInterval = setTimeout(checkServerStatus, 1000);
      }
    };

    if (serverStatus === '') {
      socket.on('server-status', (serverStatus) => {
      console.log('check status sended to server');
      setServerStatus(serverStatus);
    });
      console.log(`SS 3 :: ${serverStatus}`);
    } else if (serverStatus === 'online') {
      console.log(`SS 4 :: ${serverStatus}`);
      setServerStatus(serverStatus);

      // Stop checking if server status is 'online'
      if (statusCheckInterval) {
        clearTimeout(statusCheckInterval);
        statusCheckInterval = null;
      }
    }

    return () => {
      if (statusCheckInterval) {
        clearTimeout(statusCheckInterval);
      }
    };
  }, [serverStatus]);



--------------------------------------



  


  useLayoutEffect(() => {
    // Обработчик для состояния сервера
    socket.on('server-status', (status) => {
      console.log(`Server status received: ${status}`);
      setServerStatus(status);
    });

    return () => {
      socket.off('server-status');
    };
  }, []);

  useEffect(() => {
    let statusCheckInterval = null;

    const checkServerStatus = () => {
      if (serverStatus === '') {
        socket.emit('checkServerStatus'); // Emit event to check server status
        statusCheckInterval = setTimeout(checkServerStatus, 3000); // Check every 3 seconds
      }
    };

    if (serverStatus === '') {
      checkServerStatus(); // Start checking if server status is empty
    } else if (serverStatus === 'online') {
      // Stop checking if server status is 'online'
      if (statusCheckInterval) {
        clearTimeout(statusCheckInterval);
        statusCheckInterval = null;
      }
    }

    return () => {
      if (statusCheckInterval) {
        clearTimeout(statusCheckInterval);
      }
    };
  }, [serverStatus]);

































  const handleLogin = () => {
    if (serverStatus === 'offline') {
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

  const handleRespect = () => {
    socket.emit('respect');
    setAnimationCount(animationCount + 1);
  };

  const handleSetStatus = () => {
    if (status.trim() !== '') {
      socket.emit('setStatus', status);
    }
  };

  useEffect(() => {
    const handleUpdateUsers = ({ users, totalRespect }) => {
      setUsers(users);
      setTotalRespect(totalRespect);
    };

    socket.on('updateUsers', handleUpdateUsers);

    return () => {
      socket.off('updateUsers', handleUpdateUsers);
    };
  }, []);

  useEffect(() => {
    const handleAnimateRespect = () => {
      setAnimationCount((prevCount) => prevCount + 1);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1000);
    };

    const handleChangeTextColor = ({ colorId }) => {
      setTextColorId(colorId);
    };

    socket.on('animateRespect', handleAnimateRespect);
    socket.on('changeTextColor', handleChangeTextColor);

    return () => {
      socket.off('animateRespect', handleAnimateRespect);
      socket.off('changeTextColor', handleChangeTextColor);
    };
  }, []);

  useEffect(() => {
    const handleStatusUpdateError = (message) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 3000);
    };

    socket.on('statusUpdateError', handleStatusUpdateError);

    return () => {
      socket.off('statusUpdateError', handleStatusUpdateError);
    };
  }, []);

  const getColor = () => {
    switch (textColorId) {
      case 1:
        return 'text-red-500';
      case 2:
        return 'text-lime-500';
      case 3:
        return 'text-purple-500';
      case 4:
        return 'text-fuchsia-500';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-primary/60 h-full flex flex-col items-center relative">

      {/* Logging */}
      {!isLoggedIn ? (
        <div className="relative top-1/2 transform -translate-y-1/2">
          <input
            type="text"
            className="bg-slate-800 p-2 rounded border-2 border-gray-700 focus:border-gray-400"
            placeholder="Enter your name"
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
            Enter
          </button>
        </div>
      ) : (
        <div className="w-full h-full">
          {/* Online */}
          <div className="flex justify-between bg-amber-700/10">
            <p className="text-xl font-roboto text-white/40 animate-pulse relative mx-4">Online:</p>
            <div className="text-gray-500 animate-pulse bg-slate-400/20 mx-2">{name}</div>
          </div>

          {/* Online list */}
          <div className="bg-red-500/10 relative">
            <ul className="pl-4">
              {users.map((user, index) => (
                <li key={index} className="text-gray-500">
                  {user.name} [Respects: {user.respectCount}, Status: {user.status}]
                </li>
              ))}
            </ul>
          </div>

          {/* Respect */}
          <div className="flex flex-col items-center justify-center bg-slate-400/10 absolute inset-0">
            <button
              onClick={handleRespect}
              className="border-2 shadow-xl border-gray-300 text-gray-300 p-4 rounded transition-colors duration-300 hover:bg-primary/60 hover:text-white"
            >
              Respect
            </button>
            <div className={`text-xl mt-4 ${getColor()}`}>
              Total Respect Count: {totalRespect}
            </div>

            {/* Status */}
            <div className="mt-4 flex flex-col items-center">
              <input
                type="text"
                className="bg-slate-800 p-2 rounded border-2 border-gray-700 focus:border-gray-400"
                placeholder="Enter new status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
              <button
                onClick={handleSetStatus}
                className="bg-gray-500/30 border-color text-white mx-2 p-2 rounded transition-colors duration-300 hover:bg-gray-500/60 mt-2"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoggedIn && showAnimation && (
        <div className="absolute top-[38%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="text-7xl font-bold text-green-500 animate-bounce">
            +1
          </div>
        </div>
      )}

      <Copyright />

      {/* Connection Status */}
      <div className={`absolute bottom-4 left-4 ${connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
        {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
      </div>

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Chat;

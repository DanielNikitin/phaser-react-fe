import React, { useEffect, useLayoutEffect, useState } from 'react';
import io from 'socket.io-client';
import Copyright from '../components/Copyright';

const socket = io('https://socketio-be-bx30.onrender.com');  // https://socketio-be-bx30.onrender.com

const Chat = () => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');

  const [serverStatus, setServerStatus] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [state, setState] = useState([]);

  const [users, setUsers] = useState([]);

  const [totalRespect, setTotalRespect] = useState(0);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [textColorId, setTextColorId] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationCount, setAnimationCount] = useState(0);

  // Server Status Condition
  const sc = () => {
    socket.on('server-status', (serverStatus) => {
      console.log(serverStatus);
      if (serverStatus === 'online') {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    });
  };

  useLayoutEffect(() => {
    sc();
    console.log('useLayoutEffect activated');
  }, []);

  const handleLogin = () => {
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

  // Sending to server
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
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Copyright from '../components/Copyright';
import Menu from '../components/Menu';
import playSound from '../components/Audio';
import { items as skinItems } from '../components/Images';

const socket = io('http://localhost:3009');  // http://localhost:3009

const Chat = () => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [serverStatus, setServerStatus] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [totalRespect, setTotalRespect] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [textColorId, setTextColorId] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationCount, setAnimationCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [btnSkins, setBtnSkins] = useState([]);
  const [currentSkinIndex, setCurrentSkinIndex] = useState(0);

  // Запуск интервала проверки статуса сервера
  useEffect(() => {
    let updateInterval = null;

    const handleServerStatus = (serverStatus) => {
      console.log(`Server status received: ${serverStatus}`);
      setServerStatus(serverStatus);
      setConnectionStatus('connected');
    };

    const startUpdateInterval = () => {
      updateInterval = setInterval(() => {
        console.log('Attempting to receive server status');
        setConnectionStatus('reconnecting');
        socket.emit('checkStatus');
      }, 1000);
    };

    socket.on('server-status', handleServerStatus);
    socket.on('connect_error', () => setConnectionStatus('Connection Error'));

    if (serverStatus === '') {
      startUpdateInterval();
      console.log('Starting update interval..');
    }

    return () => {
      if (updateInterval) {
        console.log('clear interval');
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
      playSound('statusError');
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

  useEffect(() => {
    socket.on('lastSkin', ({ lastSkin }) => {
      // Find the index of the lastSkin in btnSkins array
      const index = btnSkins.findIndex(skin => skin === lastSkin);
      if (index !== -1) {
        setCurrentSkinIndex(index);
        console.log(currentSkinIndex);
      }
    });

    return () => {
      socket.off('lastSkin');
    };
  }, [btnSkins]);

  useEffect(() => {
    if (isLoggedIn) {
      logUserItems(name);
    }
  }, [isLoggedIn, name, users]);

  const logUserItems = (username) => {
    if (!username) {
      console.log('Username is not provided');
      return;
    }

    socket.emit('getLastSkin');
  
    const user = users.find((user) => user.name === username);
    if (user) {
      const items = JSON.parse(user.items || '[]');

      const availableSkins = skinItems
        .filter(item => items.includes(item.name) && item.name.startsWith('BtnSkin'))
        .map(item => item.imageUrl);
      
      setBtnSkins(availableSkins);
    } else {
      console.log(`User ${username} not found`);
    }
  };

  const handleNextSkin = () => {
    setCurrentSkinIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % btnSkins.length;
      socket.emit('setLastSkin', { skin: btnSkins[newIndex] });
      return newIndex;
    });
  };

  const handlePreviousSkin = () => {
    setCurrentSkinIndex((prevIndex) => {
      const newIndex = (prevIndex - 1 + btnSkins.length) % btnSkins.length;
      socket.emit('setLastSkin', { skin: btnSkins[newIndex] });
      return newIndex;
    });
  };

  return (
    <div className="bg-primary/60 h-full flex flex-col items-center relative">
      {/* Show Menu if open */}
      {isMenuOpen && <Menu socket={socket} name={name} onClose={() => setIsMenuOpen(false)} items={skinItems} />}

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
                  {user.name} [Respects: {user.respectCount}, Status: {user.status},
                   Level: {user.level}, Experience: {user.experiencePoints}, Rank: {user.rank}, Items: {user.items}]
                </li>
              ))}
            </ul>
          </div>

          {/* Client Respect */}
          <div className="flex flex-col items-center justify-center bg-slate-400/10 absolute inset-0">
            <button
              onClick={handleRespect}
              className="border-1 shadow-xl border-gray-500 p-4 rounded transition-colors duration-300 hover:bg-primary/60"
            >
              <img src={btnSkins[currentSkinIndex]} alt="Respect" className="w-32 h-32" />
            </button>

            <div className="flex mt-4">
              <button
                onClick={handlePreviousSkin}
                className="bg-gray-500 text-white p-2 rounded mr-2 transition-colors duration-300 hover:bg-gray-600"
              >
                Previous
              </button>
              <button
                onClick={handleNextSkin}
                className="bg-gray-500 text-white p-2 rounded transition-colors duration-300 hover:bg-gray-600"
              >
                Next
              </button>
            </div>

            <div className={`text-xl mt-4 ${getColor()}`}>
              Total Respect Count: {totalRespect}
            </div>

            {/* Client Status */}
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

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="absolute bottom-4 right-4 bg-neutral-800 text-white p-4 rounded shadow-lg transition-colors duration-300 hover:bg-neutral-700"
          >
            Menu
          </button>
        </div>
      )}

      {/* Hide all inside until client not logged in */}
      {isLoggedIn && showAnimation && (
        <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="text-7xl font-bold text-green-500 animate-bounce">
            +1
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className={`absolute bottom-4 left-4 ${connectionStatus === 'connected' ? 'text-green-500' : 'text-orange-500'}`}>
        {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'reconnecting' ? '' : 'Reconnecting...'}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Chat;

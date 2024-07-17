import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

import Copyright from '../components/Copyright';

const socket = io('https://socketio-be-bx30.onrender.com');  // https://socketio-be-bx30.onrender.com

const Chat = () => {
  const [name, setName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [state, setState] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalRespect, setTotalRespect] = useState(0);
  const [animationCount, setAnimationCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [textColorId, setTextColorId] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleLogin = () => {
    if (name.trim() === '') {
      setErrorMessage('Name cannot be empty');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Отправляем на сервер запрос на проверку статуса
    socket.emit('status');
    console.log('checking server status');

    // Прослушиваем ответ сервера на запрос статуса
    socket.once('status', (status) => {
      if (status === 'online') {
        console.log("server online");
        setIsLoggedIn(true);
        setSuccessMessage('You entered the room!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Server is offline. Please try again later.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    });
  };

  const handleRespect = () => {
    socket.emit('respect');
    setAnimationCount(animationCount + 1);
  };

  useEffect(() => {
    if (isLoggedIn) {
      socket.emit('join', { name });
    }

    return () => {
      if (isLoggedIn) {
        socket.disconnect();
      }
    };
  }, [isLoggedIn, name]);

  useEffect(() => {
    socket.on("message", ({ data }) => {
      setState((_state) => ([..._state, data]));
    });

    socket.on("updateUsers", ({ users, totalRespect }) => {
      setUsers(users);
      setTotalRespect(totalRespect);
    });

    socket.on("animateRespect", () => {
      setAnimationCount((prevCount) => prevCount + 1);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1000);
    });

    socket.on("changeTextColor", ({ colorId }) => {
      setTextColorId(colorId);
    });

    return () => {
      socket.off("message");
      socket.off("updateUsers");
      socket.off("animateRespect");
      socket.off("changeTextColor");
    };
  }, []); // Пустой массив зависимостей, чтобы установить слушатели событий только один раз

  const getColor = () => {
    switch (textColorId) {
      case 1:
        return "text-red-500";
      case 2:
        return "text-lime-500";
      case 3:
        return "text-purple-500";
      case 4:
        return "text-fuchsia-500";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-primary/60 h-full flex flex-col items-center relative">
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

          { /* online */ }
          <div className="flex justify-between bg-amber-700/10">
            <p className="text-xl font-roboto text-white/40 animate-pulse relative mx-4">Online:</p>
            { /* nickname */ }
            <div className="text-gray-500 animate-pulse bg-slate-400/20 mx-2">{name}</div>
          </div>

          { /* online list */ }
          <div className="bg-red-500/10 relative">
            <ul className="pl-4">
              {users.map((user, index) => (
                <li key={index} className="text-gray-500">
                  {user.name} [Respects: {user.respectCount}]
                </li>
              ))}
            </ul>
          </div>

          { /* respect */ }
          <div className="flex flex-col items-center justify-center
          bg-slate-400/10 absolute inset-0">
            <button
              onClick={handleRespect}
              className="border-2 shadow-xl border-gray-300 text-gray-300 p-4 rounded transition-colors duration-300 hover:bg-primary/60 hover:text-white"
            >
              Respect
            </button>
            <div className={`text-xl mt-4 ${getColor()}`}>
              Total Respect Count: {totalRespect}
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

      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default Chat;
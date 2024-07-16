import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://socketio-be-bx30.onrender.com');

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
  const [serverCheckStatus, setServerCheckStatus] = useState('');

  const handleLogin = () => {
    if (name.trim() === '') {
      setErrorMessage('Name cannot be empty');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Отправляем на сервер запрос на проверку статуса
    socket.emit('status');

    // Прослушиваем ответ сервера на запрос статуса
    socket.once('status', (status) => {
      if (status === 'online') {
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
  }, [isLoggedIn]);

  useEffect(() => {
    socket.on("message", ({ data }) => {
      setState((_state) => ([..._state, data]));
    });

    socket.on("updateUsers", ({ users, totalRespect }) => {
      setUsers(users);
      setTotalRespect(totalRespect);
    });

    socket.on("animateRespect", () => {
      setAnimationCount(animationCount + 1);
      setShowAnimation(true); // Показываем анимацию "+1"
      setTimeout(() => setShowAnimation(false), 1000); // Скрытие анимации через 1 секунду
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
  }, [animationCount]); // Добавлен animationCount для вызова useEffect при его изменении

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
    <div className="bg-primary/60 h-full">
      <div className="flex flex-col justify-center items-center h-full">
        {!isLoggedIn ? (
          <div className="mb-8">
            <input
              type="text"
              className="bg-slate-800 p-2 rounded border-gray-500/30 mb-4"
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
          <div className="w-full h-full absolute">
            <div className="flex justify-between p-4">
              <p className="text-xl font-bold text-white/40 animate-pulse">Online:</p>
              <div className="text-gray-500">{name}</div>
            </div>
            <ul className="pl-4">
              {users.map((user, index) => (
                <li key={index} className="text-gray-500">
                  {user.name} (Respects: {user.respectCount})
                </li>
              ))}
            </ul>
            <div className="flex flex-col items-center justify-center h-full">
              <button
                onClick={handleRespect}
                className="border-2 border-gray-300 text-gray-300 p-4 rounded mt-4 transition-colors duration-300 hover:bg-primary/60 hover:text-white"
              >
                Respect
              </button>
              <div className={`text-xl mt-4 ${getColor()}`}>
                Total Respect Count: {totalRespect}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Отображение анимации "+1" */}
      {showAnimation && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-50">
          <div className="text-7xl font-bold text-green-500 animate-bounce">
            +1
          </div>
        </div>
      )}

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

// Menu.js
import React, { useState, useEffect } from 'react';
import playSound from './Audio';

const Menu = ({ socket, name, onClose, items }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState('');

  // Фильтрация итемов (например, исключение BtnSkin3)
  const filteredItems = items.filter(item => item.name !== 'BtnSkin3');

  useEffect(() => {
    const handleBuyItemResponse = (response) => {
      if (response.success) {
        playSound('itemPurchased');
        setMessage(`${name} купил ${response.itemName}`);
      } else {
        playSound('itemPurchaseFailed');
        setMessage(`Ошибка покупки: ${response.message}`);
      }
    };

    socket.on('buyItemResponse', handleBuyItemResponse);

    return () => {
      socket.off('buyItemResponse', handleBuyItemResponse);
    };
  }, [socket, name]);

  const handleBuy = () => {
    if (selectedItem) {
      console.log(`${name} отправил запрос на покупку ${selectedItem.name}`);
      socket.emit('buyItem', { itemName: selectedItem.name });
      setMessage('Отправлен запрос на покупку...');
    } else {
      playSound('noSelection');
      setMessage(`${name} не выбрал ничего`);
    }
  };

  const handleClose = () => {
    playSound('menuClose');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-stone-700 p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">Menu</h2>
        <p className="text-white mb-4">Select an item to buy:</p>
        <div className="mb-4">
          {filteredItems.map((item) => (
            <label key={item.name} className="block mb-4 text-white">
              <input
                type="radio"
                name="item"
                value={item.name}
                onChange={() => setSelectedItem(item)}
                className="mr-2"
              />
              <div className="flex items-center">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 mr-2" />
                {item.description}
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleBuy}
          className="bg-green-500 text-white p-2 rounded mr-2 transition-colors duration-300 hover:bg-green-600"
        >
          Buy
        </button>

        <button
          onClick={handleClose}
          className="bg-gray-500 text-white p-2 rounded transition-colors duration-300 hover:bg-gray-600"
        >
          Close
        </button>

        {message && <p className="text-white mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default Menu;

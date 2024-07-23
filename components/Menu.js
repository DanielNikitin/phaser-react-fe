// Menu.js
import React, { useState } from 'react';
import playSound from './Audio';

const Menu = ({ name, onClose }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleBuy = () => {
    if (selectedItem) {
      // Воспроизведение звука при покупке выбранного элемента
      playSound('itemPurchased');
      console.log(`${name} купил ${selectedItem.id}`);
      onClose();
    } else {
      // Воспроизведение звука при отсутствии выбора
      playSound('noSelection');
      console.log(`${name} не выбрал ничего`);
    }
  };

  const handleClose = () => {
    // Воспроизведение звука при закрытии меню
    playSound('menuClose');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-stone-700 p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <p>Select an item to buy:</p>
        <div className="mb-4">
          <label className="block mb-2">
            <input
              type="radio"
              name="item"
              value="1"
              onChange={() => setSelectedItem({ id: 1 })}
              className="mr-2"
            />
            Item 1
          </label>

          <label>
            <input
              type="radio"
              name="item"
              value="2"
              onChange={() => setSelectedItem({ id: 2 })}
              className="mr-2"
            />
            Item 2
          </label>
        </div>

        <button
          onClick={handleBuy}
          className="bg-green-500 text-white p-2 rounded mr-2"
        >
          Buy
        </button>

        <button
          onClick={handleClose}
          className="bg-gray-500 text-white p-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Menu;

import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import procedure from '../public/assets/map/procedure.json';

const Main = () => {
  const gameRef = useRef(null);
  const [gridVisible, setGridVisible] = useState(true);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: window.innerHeight,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: {
        preload,
        create,
        update
      }
    };

    gameRef.current = new Phaser.Game(config);

    function preload() {
      this.load.image('procedure', '/assets/map/2.png'); // Путь к изображению тайлсета
      this.load.tilemapTiledJSON('map', '/assets/map/procedure.json'); // Путь к файлу карты
    }

    function create() {
      const map = this.add.tilemap('map');
      const tileset = map.addTilesetImage(procedure.tilesets[0].name, 'procedure');
      const layer = map.createLayer('Main', tileset, 0, 0);

      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.cameras.main.zoom = 0.5;

      let isDragging = false;
      let startX, startY;

      this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
        const zoomFactor = 0.001;
        const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom + deltaY * zoomFactor, 0.5, 2);

        const worldPoint = pointer.positionToCamera(this.cameras.main);

        const newScrollX = (this.cameras.main.scrollX + this.cameras.main.width / 2 - worldPoint.x) * (newZoom / this.cameras.main.zoom) + worldPoint.x - this.cameras.main.width / 2;
        const newScrollY = (this.cameras.main.scrollY + this.cameras.main.height / 2 - worldPoint.y) * (newZoom / this.cameras.main.zoom) + worldPoint.y - this.cameras.main.height / 2;

        this.cameras.main.zoom = newZoom;
        this.cameras.main.scrollX = newScrollX;
        this.cameras.main.scrollY = newScrollY;

        updateGridStyle();
      });

      this.input.on('pointerdown', (pointer) => {
        if (pointer.leftButtonDown()) {
          isDragging = true;
          startX = pointer.x;
          startY = pointer.y;
        }
      });

      this.input.on('pointermove', (pointer) => {
        if (isDragging) {
          const deltaX = pointer.x - startX;
          const deltaY = pointer.y - startY;

          this.cameras.main.scrollX -= deltaX / this.cameras.main.zoom;
          this.cameras.main.scrollY -= deltaY / this.cameras.main.zoom;

          startX = pointer.x;
          startY = pointer.y;
        }
      });

      this.input.on('pointerup', () => {
        isDragging = false;
      });

      this.input.on('pointerout', () => {
        isDragging = false;
      });

      // Функция для расчета стиля линии на основе зума
      const getLineStyle = (zoom) => {
        const baseThickness = 1.2; // Базовая толщина линии
        const baseAlpha = 0.2;   // Базовая прозрачность

        const thickness = baseThickness * (1.2 / zoom); // Чем меньше зум, тем толще линия
        const alpha = baseAlpha * (1.2 / zoom);         // Чем меньше зум, тем менее прозрачная линия

        return { thickness, alpha };
      };

      // Функция для отрисовки сетки
      const drawGrid = (numColumns, numRows, tileSize, offsetX = 0, offsetY = 0) => {
        const graphics = this.add.graphics();

        const { thickness, alpha } = getLineStyle(this.cameras.main.zoom);
        graphics.lineStyle(thickness, 0xf, alpha); // (thickness, color, alpha);

        for (let i = 0; i <= numColumns; i++) {
          const x = i * tileSize + offsetX;
          graphics.moveTo(x, 0 + offsetY);
          graphics.lineTo(x, numRows * tileSize + offsetY);
        }

        for (let j = 0; j <= numRows; j++) {
          const y = j * tileSize + offsetY;
          graphics.moveTo(0 + offsetX, y);
          graphics.lineTo(numColumns * tileSize + offsetX, y);
        }

        graphics.strokePath();
        return graphics;
      };

      // Функция для отрисовки меток
      const drawLabels = (numColumns, numRows, tileSize, offsetX = 0, offsetY = 0) => {
        const labels = [];
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let row = 0; row < numRows; row++) {
          for (let col = 0; col < numColumns; col++) {
            let label = '';
            let num = col;

            // Формируем букву для колонки
            do {
              label = letters[num % 26] + label;
              num = Math.floor(num / 26) - 2;  // -2 for AA AB ..
            } while (num >= 0);

            label += row;

            // Добавляем метку на графику
            this.add.text(col * tileSize + tileSize / 2 + offsetX, row * tileSize + tileSize / 2 + offsetY, label, {
              font: '10px Arial',
              fill: '#ff',
              padding: { x: 1, y: 1 }
            }).setOrigin(0.55, 1.2);  // положение метки
          }
        }
      };

      // Параметры сетки
      const numColumns = 60; // Количество колонок
      const numRows = 60;    // Количество строк
      const tileSize = 32;   // Размер плитки
      const offsetX = 630;   // Смещение по X
      const offsetY = 600;   // Смещение по Y

      // Рисуем сетку и метки
      let grid = drawGrid(numColumns, numRows, tileSize, offsetX, offsetY);
      grid.setVisible(gridVisible);

      drawLabels(numColumns, numRows, tileSize, offsetX, offsetY);

      // Функция для обновления стиля сетки
      const updateGridStyle = () => {
        grid.clear();
        grid = drawGrid(numColumns, numRows, tileSize, offsetX, offsetY);
        grid.setVisible(gridVisible);
      };

      // Функция для переключения видимости сетки
      const toggleGrid = () => {
        setGridVisible(prev => {
          const newVisible = !prev;
          grid.setVisible(newVisible);
          return newVisible;
        });
      };

      // Обработчик нажатий клавиш для переключения сетки
      this.input.keyboard.on('keydown-G', toggleGrid);

      // Обновляем сетку при изменении размера окна
      this.scale.on('resize', () => {
        updateGridStyle();
        drawLabels(numColumns, numRows, tileSize, offsetX, offsetY);
      });
    }

    function update() {
      // Логика обновления сцены (если необходимо)
    }

    // Очистка игры при размонтировании компонента
    return () => {
      gameRef.current.destroy(true);
    };
  }, [gridVisible]);

  return <div id="game-container" className="w-[800px] h-[100%] items-center justify-center"></div>;
};

export default Main;

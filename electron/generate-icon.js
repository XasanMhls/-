/**
 * Запусти: node generate-icon.js
 * Создаст icon.png из SVG (нужен только один раз)
 * Требует: npm install canvas
 */
const { createCanvas } = require('canvas');
const fs = require('fs');

const SIZE = 512;
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

// Background
const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
bg.addColorStop(0, '#7c6af5');
bg.addColorStop(1, '#a78bfa');
ctx.fillStyle = bg;
const r = SIZE * 0.18;
ctx.beginPath();
ctx.roundRect(0, 0, SIZE, SIZE, r);
ctx.fill();

// Clock circle
ctx.strokeStyle = 'rgba(255,255,255,0.9)';
ctx.lineWidth = SIZE * 0.06;
ctx.beginPath();
ctx.arc(SIZE / 2, SIZE / 2, SIZE * 0.3, 0, Math.PI * 2);
ctx.stroke();

// Clock hands
ctx.lineCap = 'round';
ctx.strokeStyle = '#fff';
ctx.lineWidth = SIZE * 0.055;
// hour hand (pointing to 10)
ctx.beginPath();
ctx.moveTo(SIZE / 2, SIZE / 2);
ctx.lineTo(SIZE / 2 - SIZE * 0.12, SIZE / 2 - SIZE * 0.18);
ctx.stroke();
// minute hand (pointing to 12)
ctx.lineWidth = SIZE * 0.04;
ctx.beginPath();
ctx.moveTo(SIZE / 2, SIZE / 2);
ctx.lineTo(SIZE / 2, SIZE / 2 - SIZE * 0.26);
ctx.stroke();

// Center dot
ctx.fillStyle = '#fff';
ctx.beginPath();
ctx.arc(SIZE / 2, SIZE / 2, SIZE * 0.04, 0, Math.PI * 2);
ctx.fill();

fs.writeFileSync('icon.png', canvas.toBuffer('image/png'));
console.log('✅ icon.png создана!');

import {
  penButton,
  paintBucketButton,
  paintAllPixelsOfTheSameColorButton,
  eraserButton,
  strokeButton,
  colorPickerButton,
  canvas,
  canvasContext,
  primaryColorInput,
  secondaryColorInput,
  primaryColorButton,
  secondaryColorButton,
  swapColorsButton,
  btn1px,
  btn2px,
  btn3px,
  btn4px,
  frame,
  frames,
  canvasWrapper,
  createNewFrameButton,
  deleteFrameAndCanvasButton,
  finalGif,
  refreshButton,
  downloadButton,
  fpsRange,
  fpsNumber
} from './trash-module.js';

canvas.number = 1;
primaryColorInput.value = '#000000';
secondaryColorInput.value = '#ffffff';
primaryColorButton.addEventListener('click', () => primaryColorInput.click());
secondaryColorButton.addEventListener('click', () => secondaryColorInput.click());
primaryColorInput.addEventListener('change', (event) => {
  palette.primaryColor = event.target.value;
  primaryColorButton.style.background = event.target.value;
});
secondaryColorInput.addEventListener('change', (event) => {
  palette.secondaryColor = event.target.value;
  secondaryColorButton.style.background = event.target.value;
});

function swapColors() {
  let transitColor = primaryColorInput.value;
  primaryColorInput.value = secondaryColorInput.value;
  palette.primaryColor = primaryColorInput.value;
  primaryColorButton.style.background = primaryColorInput.value;
  secondaryColorInput.value = transitColor;
  palette.secondaryColor = transitColor;
  secondaryColorButton.style.background = transitColor;
  transitColor = undefined;
}
swapColorsButton.addEventListener('click', swapColors);

const palette = {
  tool: 'pen',
  isDrawing: false,
  matrixCoefficient: 16,
  xStart: undefined,
  yStart: undefined,
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  activeCanvas: canvas,
  activeCanvasContext: canvasContext,
  activeFrameNumber: 1,
  fpsRate: 500,
  pixelSize: 1,

  drawBresenhamLine(canvasContext, xStart, yStart, xEnd, yEnd, matrixCoefficient) {
    const k = matrixCoefficient;

    function draw(x, y) {
      canvasContext.fillRect(x, y, k * palette.pixelSize, k * palette.pixelSize);
    }

    const bresenDraw = (xFrom, yFrom, xTo, yTo) => {
      let x0 = xFrom;
      let y0 = yFrom;
      const x1 = xTo;
      const y1 = yTo;

      if (x0 === x1 && y0 === y1) {
        draw(x0, y0);
        return;
      }

      const dx = x1 - x0;
      const sx = (dx < 0) ? -1 : 1;
      const dy = y1 - y0;
      const sy = (dy < 0) ? -1 : 1;

      if (Math.abs(dy) < Math.abs(dx)) {
        const m = dy / dx;
        const b = y0 - m * x0;

        while (x0 !== x1) {
          draw(x0, parseInt(Math.round(m * x0 + b), 10));
          x0 += sx * k;
        }
      } else {
        const m = dx / dy;
        const b = x0 - m * y0;

        while (y0 !== y1) {
          draw(parseInt(Math.round(m * y0 + b), 10), y0);
          y0 += sy * k;
        }
      }

      draw(x1, y1);
    };

    bresenDraw(xStart, yStart, xEnd, yEnd);
  },

  clearBresenhamLine(canvasContext, xStart, yStart, xEnd, yEnd, matrixCoefficient) {
    const k = matrixCoefficient;

    function draw(x, y) {
      if ( ((x/palette.matrixCoefficient)%2) == ((y/palette.matrixCoefficient)%2) ) {
        canvasContext.fillStyle = 'rgb(76, 76, 76)';
      } else {
        canvasContext.fillStyle = 'rgb(85, 85, 85)';
      }
      canvasContext.fillRect(x, y, k, k);
    }

    const bresenDraw = (xFrom, yFrom, xTo, yTo) => {
      let x0 = xFrom;
      let y0 = yFrom;
      const x1 = xTo;
      const y1 = yTo;

      if (x0 === x1 && y0 === y1) {
        draw(x0, y0);
        return;
      }

      const dx = x1 - x0;
      const sx = (dx < 0) ? -1 : 1;
      const dy = y1 - y0;
      const sy = (dy < 0) ? -1 : 1;

      if (Math.abs(dy) < Math.abs(dx)) {
        const m = dy / dx;
        const b = y0 - m * x0;

        while (x0 !== x1) {
          draw(x0, parseInt(Math.round(m * x0 + b), 10));
          x0 += sx * k;
        }
      } else {
        const m = dx / dy;
        const b = x0 - m * y0;

        while (y0 !== y1) {
          draw(parseInt(Math.round(m * y0 + b), 10), y0);
          y0 += sy * k;
        }
      }

      draw(x1, y1);
    };

    bresenDraw(xStart, yStart, xEnd, yEnd);
  },

  fillBucket(event, matrixCoefficient, canvas, canvasContext) {

    if (event.button === 0) {
      canvasContext.fillStyle = palette.primaryColor;
    } else {
      canvasContext.fillStyle = palette.secondaryColor;
    }

    const k = matrixCoefficient;

    const pixelImgData = canvasContext.getImageData(event.offsetX, event.offsetY, 1, 1);
    const pixelRgbaColor = JSON.stringify(Array.from(pixelImgData.data));

    const imgData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    const canvasColorArr = imgData.data;

    function getPixelColor(x, y) {
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const r = (y * canvas.width + x) * 4;
        const g = r + 1;
        const b = g + 1;
        const a = b + 1;
        return [canvasColorArr[r], canvasColorArr[g], canvasColorArr[b], canvasColorArr[a]];
      }
      return false;
    }

    const stack = [];
    const visited = {};

    function checkNeighbours(x, y) {
      const secondNeighbour = getPixelColor(x, y - k);
      const fourthNeighbour = getPixelColor(x - k, y);
      const fifthNeighbour = getPixelColor(x + k, y);
      const seventhNeighbour = getPixelColor(x, y + k);

      if (secondNeighbour) {
        if (JSON.stringify(secondNeighbour) === pixelRgbaColor || JSON.stringify(secondNeighbour) === '[85,85,85,255]' || JSON.stringify(secondNeighbour) === '[76,76,76,255]') {
          const neighbourCoordinates = `[${x},${y - k}]`;
          if (!visited[neighbourCoordinates]) {
            stack.push(neighbourCoordinates);
            visited[neighbourCoordinates] = true;
          }
        }
      }

      if (fourthNeighbour) {
        if (JSON.stringify(fourthNeighbour) === pixelRgbaColor || JSON.stringify(fourthNeighbour) === '[85,85,85,255]' || JSON.stringify(fourthNeighbour) === '[76,76,76,255]') {
          const neighbourCoordinates = `[${x - k},${y}]`;
          if (!visited[neighbourCoordinates]) {
            stack.push(neighbourCoordinates);
            visited[neighbourCoordinates] = true;
          }
        }
      }

      if (fifthNeighbour) {
        if (JSON.stringify(fifthNeighbour) === pixelRgbaColor || JSON.stringify(fifthNeighbour) === '[85,85,85,255]' || JSON.stringify(fifthNeighbour) === '[76,76,76,255]') {
          const neighbourCoordinates = `[${x + k},${y}]`;
          if (!visited[neighbourCoordinates]) {
            stack.push(neighbourCoordinates);
            visited[neighbourCoordinates] = true;
          }
        }
      }

      if (seventhNeighbour) {
        if (JSON.stringify(seventhNeighbour) === pixelRgbaColor || JSON.stringify(seventhNeighbour) === '[85,85,85,255]' || JSON.stringify(seventhNeighbour) === '[76,76,76,255]') {
          const neighbourCoordinates = `[${x},${y + k}]`;
          if (!visited[neighbourCoordinates]) {
            stack.push(neighbourCoordinates);
            visited[neighbourCoordinates] = true;
          }
        }
      }

      canvasContext.fillRect(x, y, k, k);
    }

    function floodFill(x, y) {
      stack.push(JSON.stringify([x, y]));

      while (stack.length) {
        const coordinates = JSON.parse(stack.pop());
        checkNeighbours(coordinates[0], coordinates[1]);
      }
    }

    floodFill(event.offsetX - ((event.offsetX) % k), event.offsetY - ((event.offsetY) % k));
  },

  paintAllPixelsOfTheSameColor(event, matrixCoefficient, canvas, canvasContext) {

    if (event.button === 0) {
      canvasContext.fillStyle = palette.primaryColor;
    } else {
      canvasContext.fillStyle = palette.secondaryColor;
    }

    const k = matrixCoefficient;

    const pixelImgData = canvasContext.getImageData(event.offsetX, event.offsetY, 1, 1);
    const pixelRgbaColor = Array.from(pixelImgData.data);

    const imgData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    const canvasColorArr = imgData.data;

    for (let i = 0; i < canvasColorArr.length; i = i + 512 * k * 4) {
      for (let j = i; j < (i + 512) * 4; j += k * 4) {
        if (pixelRgbaColor[0] === canvasColorArr[j] && pixelRgbaColor[1] === canvasColorArr[j + 1] && pixelRgbaColor[2] === canvasColorArr[j + 2] && pixelRgbaColor[3] === canvasColorArr[j + 3]) {
          canvasContext.fillRect(((j / 4) % 512), Math.floor((j / 4) / 512), k, k);
        }
      }
    }

  },

  rgba2hex(rgba) {
    const rgb = rgba.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? `#${
      (`0${parseInt(rgb[1], 10).toString(16)}`).slice(-2)
    }${(`0${parseInt(rgb[2], 10).toString(16)}`).slice(-2)
    }${(`0${parseInt(rgb[3], 10).toString(16)}`).slice(-2)}` : '';
  },
};

createBackground(canvasContext);

btn1px.addEventListener('click', () => {
  palette.pixelSize = 1;
  const arr = [btn1px, btn2px, btn3px, btn4px];
  for (let i = 0; i < 4; i += 1) {
    arr[i].classList.remove('tools__active-pen-size-button');
  }
  btn1px.classList.add('tools__active-pen-size-button');
});

btn2px.addEventListener('click', () => {
  palette.pixelSize = 2;
  const arr = [btn1px, btn2px, btn3px, btn4px];
  for (let i = 0; i < 4; i += 1) {
    arr[i].classList.remove('tools__active-pen-size-button');
  }
  btn2px.classList.add('tools__active-pen-size-button');
});

btn3px.addEventListener('click', () => {
  palette.pixelSize = 3;
  const arr = [btn1px, btn2px, btn3px, btn4px];
  for (let i = 0; i < 4; i += 1) {
    arr[i].classList.remove('tools__active-pen-size-button');
  }
  btn3px.classList.add('tools__active-pen-size-button');
});

btn4px.addEventListener('click', () => {
  palette.pixelSize = 4;
  const arr = [btn1px, btn2px, btn3px, btn4px];
  for (let i = 0; i < 4; i += 1) {
    arr[i].classList.remove('tools__active-pen-size-button');
  }
  btn4px.classList.add('tools__active-pen-size-button');
});

const toolsButtonsArr = [penButton, paintBucketButton, paintAllPixelsOfTheSameColorButton, eraserButton, strokeButton, colorPickerButton];
const toolsButtonsNamesArr = ['pen', 'paintBucket', 'paintAllPixelsOfTheSameColor', 'eraser', 'stroke', 'colorPicker'];

penButton.addEventListener('click', () => {
  palette.tool = 'pen';
  for (let i = 0; i < toolsButtonsArr.length; i += 1) {
    toolsButtonsArr[i].classList.remove('tools__active-button');
  }
  penButton.classList.add('tools__active-button');
});

paintBucketButton.addEventListener('click', () => {
  palette.tool = 'paintBucket';
  for (let i = 0; i < toolsButtonsArr.length; i += 1) {
    toolsButtonsArr[i].classList.remove('tools__active-button');
  }
  paintBucketButton.classList.add('tools__active-button');
});

paintAllPixelsOfTheSameColorButton.addEventListener('click', () => {
  palette.tool = 'paintAllPixelsOfTheSameColor';
  for (let i = 0; i < toolsButtonsArr.length; i += 1) {
    toolsButtonsArr[i].classList.remove('tools__active-button');
  }
  paintAllPixelsOfTheSameColorButton.classList.add('tools__active-button');
});

eraserButton.addEventListener('click', () => {
  palette.tool = 'eraser';
  for (let i = 0; i < toolsButtonsArr.length; i += 1) {
    toolsButtonsArr[i].classList.remove('tools__active-button');
  }
  eraserButton.classList.add('tools__active-button');
});

strokeButton.addEventListener('click', () => {
  palette.tool = 'stroke';
  for (let i = 0; i < toolsButtonsArr.length; i += 1) {
    toolsButtonsArr[i].classList.remove('tools__active-button');
  }
  strokeButton.classList.add('tools__active-button');
});

colorPickerButton.addEventListener('click', () => {
  palette.tool = 'colorPicker';
  for (let i = 0; i < toolsButtonsArr.length; i += 1) {
    toolsButtonsArr[i].classList.remove('tools__active-button');
  }
  colorPickerButton.classList.add('tools__active-button');
});

function canvasAddEventListeners(canvas) {
  const canvasContext = canvas.getContext('2d');

  canvas.addEventListener('contextmenu', event => event.preventDefault());

  canvas.addEventListener('mousedown', (event) => {
    palette.isDrawing = true;
    
    if (palette.tool === 'pen') {
      if (event.button === 0) {
        canvasContext.fillStyle = palette.primaryColor;
      } else {
        canvasContext.fillStyle = palette.secondaryColor;
      }
  
      palette.xStart = event.offsetX - ((event.offsetX) % palette.matrixCoefficient);
      palette.yStart = event.offsetY - ((event.offsetY) % palette.matrixCoefficient);
      palette.drawBresenhamLine(palette.activeCanvasContext, palette.xStart, palette.yStart,
        palette.xStart, palette.yStart,
        palette.matrixCoefficient);
    }
  
    if (palette.tool === 'eraser') {
      palette.xStart = event.offsetX - ((event.offsetX) % palette.matrixCoefficient);
      palette.yStart = event.offsetY - ((event.offsetY) % palette.matrixCoefficient);
      palette.clearBresenhamLine(palette.activeCanvasContext, palette.xStart, palette.yStart,
        palette.xStart, palette.yStart,
        palette.matrixCoefficient);
    }
  
    if (palette.tool === 'paintBucket') {
      palette.fillBucket(event, palette.matrixCoefficient, palette.activeCanvas, palette.activeCanvasContext);
    }
  
    if (palette.tool === 'colorPicker') {
      const imgData = palette.activeCanvasContext.getImageData(event.offsetX, event.offsetY, 1, 1);
      const hexColor = palette.rgba2hex(`rgba(${imgData.data[0]}, ${imgData.data[1]}, ${imgData.data[2]}, ${imgData.data[3] / 255})`);
      if (event.button === 0) {
        if (palette.primaryColor !== hexColor) {
          palette.primaryColor = hexColor;
          primaryColorButton.style.background = palette.primaryColor;
          primaryColorInput.value = palette.primaryColor;
        }
      } else {
        if (palette.secondaryColor !== hexColor) {
          palette.secondaryColor = hexColor;
          secondaryColorButton.style.background = palette.secondaryColor;
          secondaryColorInput.value = palette.secondaryColor;
        }
      }
    }

    if (palette.tool === 'paintAllPixelsOfTheSameColor') {
      palette.paintAllPixelsOfTheSameColor(event, palette.matrixCoefficient, palette.activeCanvas, palette.activeCanvasContext);
    }

  });
  
  canvas.addEventListener('mousemove', (event) => {
    if (palette.tool === 'pen') {
      if (palette.isDrawing) {
        palette.drawBresenhamLine(palette.activeCanvasContext, palette.xStart, palette.yStart,
          event.offsetX - ((event.offsetX) % palette.matrixCoefficient),
          event.offsetY - ((event.offsetY) % palette.matrixCoefficient),
          palette.matrixCoefficient);
        palette.xStart = event.offsetX - ((event.offsetX) % palette.matrixCoefficient);
        palette.yStart = event.offsetY - ((event.offsetY) % palette.matrixCoefficient);
      }
    }
  
    if (palette.tool === 'eraser') {
      if (palette.isDrawing) {
        palette.clearBresenhamLine(palette.activeCanvasContext, palette.xStart, palette.yStart,
          event.offsetX - ((event.offsetX) % palette.matrixCoefficient),
          event.offsetY - ((event.offsetY) % palette.matrixCoefficient),
          palette.matrixCoefficient);
        palette.xStart = event.offsetX - ((event.offsetX) % palette.matrixCoefficient);
        palette.yStart = event.offsetY - ((event.offsetY) % palette.matrixCoefficient);
      }
    }
  });
  
  canvas.addEventListener('mouseup', () => {
    palette.isDrawing = false;
    x();
  });
  
  canvas.addEventListener('mouseout', () => {
    palette.isDrawing = false;
    x();
  });
}
canvasAddEventListeners(canvas);

let canvasesArr = [canvas];
let canvasesContextsArr = [canvasContext];

frame.number = 1;
frame.addEventListener('click', (event) => {
  changeActiveFrame(event.target.number);
});

function x() {
  let img = palette.activeCanvas.toDataURL("image/png");
  document.querySelector('.frames').children[y(palette.activeCanvas.number)].children[0].src = img;
}
x();

function hideCanvases() {
  for (let i = 0; i < canvasesArr.length; i += 1) {
    canvasesArr[i].classList.add('hidden');
  }
}

function createNewFrame() {
  const num = canvasesArr[canvasesArr.length - 1].number + 1;

  const newFrame = document.createElement('div');
  newFrame.classList.add('frames__single-frame-wrapper');
  newFrame.classList.add(`frames__frame-${num}`);
  newFrame.innerHTML = `<img class="frame frame-${num}" src="" alt="" width=96 height=96><button class="frames__delete-frame-button"><img class="frames__delete-frame-image" src="./src/images/delete_frame.png" alt="delete frame button"></button>`;

  newFrame.children[0].number = num;
  newFrame.children[0].addEventListener('click', (event) => {
    changeActiveFrame(event.target.number);
  });
  newFrame.children[1].addEventListener('click', () => {
    deleteFrameAndCanvas(newFrame.children[1].previousElementSibling.number);
  });

  const newCanvas = document.createElement('canvas');
  newCanvas.classList.add(`canvas`);
  newCanvas.classList.add(`canvas-${num}`);
  newCanvas.innerHTML = `Your browser doesn't support canvas!`;
  newCanvas.setAttribute('height', '512px');
  newCanvas.setAttribute('width', '512px');

  newCanvas.number = num;

  palette.activeCanvas = newCanvas;
  const newCanvasCtx = newCanvas.getContext('2d');
  createBackground(newCanvasCtx);
  palette.activeCanvasContext = newCanvasCtx;

  canvasAddEventListeners(newCanvas);

  hideCanvases();
  canvasesArr.push(newCanvas);
  canvasesContextsArr.push(newCanvasCtx);

  frames.insertBefore(newFrame, frames.children[frames.children.length - 1]);
  canvasWrapper.appendChild(newCanvas);

  x();

  changeActiveFrame(num);
}

createNewFrameButton.addEventListener('click', createNewFrame);

function changeActiveFrame(num) {
  palette.activeFrameNumber = num;

  palette.activeCanvas = document.querySelector(`.canvas-${num}`);
  palette.activeCanvasContext = palette.activeCanvas.getContext('2d');
  hideCanvases();
  palette.activeCanvas.classList.remove('hidden');

  const frames = document.querySelector('.frames');
  for (let i = 0; i < frames.children.length; i += 1) {
    frames.children[i].classList.remove('frames__active-frame');
  }
  frames.children[y(num)].classList.add('frames__active-frame');
}

function deleteFrameAndCanvas(num) {
  if (canvasesArr.length > 1) {
    const index = y(num);

  if (palette.activeFrameNumber === num) {
    if (index > 0) {
      changeActiveFrame(canvasesArr[index - 1].number);
    } else {
      changeActiveFrame(canvasesArr[index + 1].number);
    }
  }

  const pos = yy(num);

  canvasWrapper.removeChild(canvasWrapper.children[pos]);
  frames.removeChild(frames.children[pos]);
  }
}

function y(num) {
  for (let i = 0; i < canvasesArr.length; i += 1) {
    if (canvasesArr[i].number === num) {
      return i;
    }
  }
}

function yy(num) {
  const i = y(num);

  const newArr = canvasesArr.slice(0, i);
  newArr.push(...canvasesArr.slice(i + 1, canvasesArr.length));
  canvasesArr = newArr;

  const newCtxArr = canvasesContextsArr.slice(0, i);
  newCtxArr.push(...canvasesContextsArr.slice(i + 1, canvasesContextsArr.length));
  canvasesContextsArr = newCtxArr;
  return i;
}

deleteFrameAndCanvasButton.addEventListener('click', () => {
  deleteFrameAndCanvas(deleteFrameAndCanvasButton.previousElementSibling.number);
});

function createGif() {
  const encoder = new GIFEncoder();
  encoder.setRepeat(0);
  encoder.setDelay(palette.fpsRate);
  encoder.start();
  for (let i = 0; i < canvasesContextsArr.length; i += 1) {
    encoder.addFrame(canvasesContextsArr[i]);
  }
  encoder.finish();
  
  const binary_gif = encoder.stream().getData();
  const data_url = 'data:image/gif;base64,'+encode64(binary_gif);

  finalGif.src = data_url;

  return encoder;
}

function downloadGif() {
  createGif().download("Sprite.gif");
}

function createBackground(ctx) {
  const matrixSize = 512 / palette.matrixCoefficient;
  const step = matrixSize / 2;
  for (let i = 0; i <= 512; i += matrixSize) {
    for (let j = 0; j <= 512; j += matrixSize) {

      ctx.fillStyle = 'rgb(76, 76, 76)';
      ctx.fillRect(i, j, step, step);
      ctx.fillRect(i + step, j + step, step, step);
      
      ctx.fillStyle = 'rgb(85, 85, 85)';
      ctx.fillRect(i, j + step, step, step);
      ctx.fillRect(i + step, j, step, step);
      
    }
  }
}

refreshButton.addEventListener('click', () => {
  finalGif.src = './src/images/creating_gif_wait.png';
  setTimeout(() => {
    createGif();
  }, 100);
});

downloadButton.addEventListener('click', () => {
  finalGif.src = './src/images/creating_gif_wait.png';
  setTimeout(() => {
    downloadGif();
  }, 100);
});

fpsRange.addEventListener('input', () => {
  palette.fpsRate = Math.round(1000 / fpsRange.value);
  fpsNumber.innerHTML = `${fpsRange.value}`;
});

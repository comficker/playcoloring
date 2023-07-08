export function trimCanvas(canvas) {
  const context = canvas.getContext('2d');

  const topLeft = {
    x: canvas.width,
    y: canvas.height,
    update(x, y) {
      this.x = Math.min(this.x, x);
      this.y = Math.min(this.y, y);
    }
  };

  const bottomRight = {
    x: 0,
    y: 0,
    update(x, y) {
      this.x = Math.max(this.x, x);
      this.y = Math.max(this.y, y);
    }
  };

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const alpha = imageData.data[((y * (canvas.width * 4)) + (x * 4)) + 3];
      if (alpha !== 0) {
        topLeft.update(x, y);
        bottomRight.update(x, y);
      }
    }
  }

  const width = bottomRight.x - topLeft.x + 1;
  const height = bottomRight.y - topLeft.y + 1;

  const croppedCanvas = context.getImageData(topLeft.x, topLeft.y, width, height);
  canvas.width = width;
  canvas.height = height
  context.putImageData(croppedCanvas, 0, 0);

  return canvas;
}

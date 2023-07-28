import {cloneDeep} from 'lodash'

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


export function convertSteps(steps, colors) {
  let currentColors = cloneDeep(colors)
  let results = {}
  let color = null
  steps.forEach((step) => {
    if ((!step.t || step.t === 'fill') && step.c !== undefined && step.k !== undefined) {
      if (step.c >= 0) {
        results[step.k] = step.c
        color = currentColors[step.c]
      } else {
        delete results[step.k]
        color = null
      }
    } else if (step.t === 'merge' && step.v) {
      const mergingList = cloneDeep(step.v)
      const old = cloneDeep(currentColors)
      const except = currentColors.indexOf(old[mergingList[0]])
      mergingList.sort((x, y) => y - x).forEach((index) => {
        if (index !== except)
          currentColors.splice(index, 1)
      })

      Object.keys(results).forEach((key) => {
        const newIndex = currentColors.indexOf(old[results[key]])
        results[key] = newIndex >= 0 ? newIndex : currentColors.indexOf(old[except])
      })

      color = old[except]
    } else if (step.t === 'init_colors' && step.v) {
      currentColors = cloneDeep(step.v)
      color = currentColors[0]
    } else if (step.t === 'init_results' && step.v) {
      results = cloneDeep(step.v)
    } else if (step.t === 'teleport' && step.v) {
      const newR = {}
      const arr = step.v.split("_")
      const p = arr[0] === 'v' ? 1 : 0
      Object.keys(results).forEach((k) => {
        const pa = k.split("_").map(x => Number.parseInt(x))
        pa[p] = pa[p] + Number.parseInt(arr[1])
        newR[pa.join("_")] = results[k]
      })
      results = newR
    }
  })
  return {
    results, color,
    colors: currentColors
  }
}


export function drawThumbnail(value) {
  const canvas = document.getElementById(`canvas_${value.id}`)
  const ctx = canvas?.getContext('2d')
  if (!ctx) return;
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  const cellSize = Math.round(canvas.offsetWidth / value.width)
  const out = convertSteps(value.steps, value.colors)
  const results = out.results
  Object.keys(results).forEach((k) => {
    const arr = k.split("_").map(x => Number.parseInt(x))
    ctx.fillStyle = value.colors[results[k]];
    ctx.fillRect(arr[0] * cellSize, arr[1] * cellSize, cellSize, cellSize);
  })
}

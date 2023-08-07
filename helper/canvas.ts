import pkg from 'lodash'
import {SharedPage, Step} from "~/interface";
import {pop} from "~/helper/animate";

const {cloneDeep} = pkg

export function trimCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) return;

  const topLeft = {
    x: canvas.width,
    y: canvas.height,
    update(x: number, y: number) {
      this.x = Math.min(this.x, x);
      this.y = Math.min(this.y, y);
    }
  };

  const bottomRight = {
    x: 0,
    y: 0,
    update(x: number, y: number) {
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


export function convertSteps({steps, colors, map_numbers}: SharedPage) {
  let currentColors = cloneDeep(colors)
  let results: { [key: string]: number } = {}
  let color = null
  steps.forEach((step) => {
    if ((!step.t || step.t === 'fill') && step.c !== undefined && step.k !== undefined) {
      if (typeof step.c === 'number' && step.c >= 0 && step.k) {
        results[step.k] = step.c
        color = currentColors[step.c]
      } else if (step.k) {
        delete results[step.k]
        color = null
      }
    } else if (step.t === 'merge' && step.v) {
      const mergingList = cloneDeep(step.v)
      const old = cloneDeep(currentColors)
      const except = currentColors.indexOf(old[mergingList[0]])
      mergingList.sort((x: number, y: number) => y - x).forEach((index: number) => {
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
      const newR: { [key: string]: number } = {}
      const arr = step.v.split("_")
      const p = arr[0] === 'v' ? 1 : 0
      Object.keys(results).forEach((k) => {
        const pa = k.split("_").map(x => Number.parseInt(x))
        pa[p] = pa[p] + Number.parseInt(arr[1])
        newR[pa.join("_")] = results[k]
      })
      results = newR
    } else if (step.t === 'fill_all') {
      const colorIndex = step.c
      const valueIndex = step.k
      const keys = Object.keys(map_numbers)
      // @ts-ignore
      color = currentColors[colorIndex]
      Object.values(map_numbers).forEach((value: number, index: number) => {
        if (valueIndex === value) {
          if (typeof colorIndex === 'number') {
            results[keys[index]] = colorIndex
          } else {
            delete results[keys[index]]
          }
        }
      })
    }
  })
  return {
    results, color,
    colors: currentColors
  }
}


export function drawThumbnail(value: SharedPage) {
  const canvas: HTMLCanvasElement | null = document.getElementById(`canvas_${value.id}`) as HTMLCanvasElement
  if (!canvas) return;
  const ctx = canvas?.getContext('2d')
  if (!ctx) return;
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  const cellSize = Math.round(canvas.offsetWidth / value.width)
  const out = convertSteps(value)
  const results = out.results
  Object.keys(results).forEach((k) => {
    const arr = k.split("_").map(x => Number.parseInt(x))
    ctx.fillStyle = value.colors[results[k]];
    ctx.fillRect(arr[0] * cellSize, arr[1] * cellSize, cellSize, cellSize);
  })
}

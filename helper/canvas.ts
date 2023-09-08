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


export function convertSteps({steps, colors, map_numbers, width, height}: SharedPage) {
  let currentColors = cloneDeep(colors)
  let results: { [key: string]: number } = {}
  let currentCursorColor = 0
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step.type && step.t) {
      if (step.t === 'fill_all') {
        step.type = 'bucket'
      } else {
        step.type = step.t
      }
      if (typeof step.k === 'string') {
        step.value = {
          key: step.k,
          color: step.c === null ? -1 : step.c
        }
      } else if (typeof step.k === 'undefined') {
        step.value = step.v
      } else {
        continue
      }
    }
    switch (step.type) {
      case 'init_results': {
        results = cloneDeep(step.value)
        break
      }
      case 'init_colors':
      case 'adjust': {
        currentColors = cloneDeep(step.value)
        break
      }
      case 'add_color': {
        currentColors.push('#ffffff')
        currentCursorColor = currentColors.length - 1
        break
      }
      case 'teleport': {
        const newR: { [key: string]: number } = {}
        const arr = step.value.split("_")
        const p = arr[0] === 'v' ? 1 : 0
        Object.keys(results).forEach((k) => {
          const pa = k.split("_").map(x => Number.parseInt(x))
          pa[p] = pa[p] + Number.parseInt(arr[1])
          newR[pa.join("_")] = results[k]
        })
        results = newR
        break
      }
      case 'fill': {
        const {key, color} = step.value
        if (color === -1) {
          delete results[key]
        } else {
          results[key] = color
          currentCursorColor = color
        }
        break
      }
      case 'bucket': {
        const {key, color} = step.value
        const correctColor = map_numbers[key]
        const keys = Object.keys(map_numbers)
        currentCursorColor = color
        Object.values(map_numbers).forEach((value: number, index: number) => {
          if (correctColor === value) {
            if (color >= 0) {
              results[keys[index]] = color
            } else {
              delete results[keys[index]]
            }
          }
        })
        break
      }
      case 'mirror': {
        const {key, color} = step.value
        const arr = key.split("_")
        const x = Number.parseInt(arr[0]), y = Number.parseInt(arr[1])
        const nx = width - 1 - x
        if (color >= 0) {
          results[key] = color
          results[`${nx}_${y}`] = color
        } else {
          delete results[key]
          delete results[`${nx}_${y}`]
        }
        break
      }
      case 'combine': {
        const mergingList = cloneDeep(step.value)
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
        currentCursorColor = except
        break
      }
      case 'resize': {
        width = step.value
        height = step.value
        break
      }
    }
  }
  return {
    results: results,
    color: currentCursorColor,
    colors: currentColors,
    width,
    height
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

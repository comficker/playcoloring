import pkg from 'lodash'
import {SharedPage, Step} from "~/interface";
import {pop} from "~/helper/animate";
import {rgbToHex} from "~/helper/color";

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


export function convertSteps({steps, colors, map_numbers, width, height, is_template}: SharedPage) {
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
        const correctColor = is_template ? results[key] : map_numbers[key]
        const keys = Object.keys(is_template ? results : map_numbers)
        currentCursorColor = color
        Object.values(is_template ? results : map_numbers).forEach((value: number, index: number) => {
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

export async function dataUrlToSamplesGrid(dataUrl: string) {
  // since I wrote the base64ImageUrlToRGBSamplesGrid algorithm without taking into account transparency, here's a hack to fix it:
  let colorThatRepresentsTransparent: number[] | null = null;
  let flag = true
  if (flag) { // <-- just to make a scope
    let img = new Image();
    img.src = dataUrl;
    // @ts-ignore
    await new Promise<void>(r => img.width ? r() : img.onload = r);
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext("2d");
    if (!ctx) return {
      colorThatRepresentsTransparent: null
    }
    ctx.drawImage(img, 0, 0, img.width, img.height);
    if (img.width < 70 || img.height < 70) {
      return test70(ctx)
    }
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // find an unused color to represent transparent:
    let unusedColor = null;
    for (let tries = 0; tries < 30; tries++) {
      let c = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
      let exists = false;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] == c[0] && imageData.data[i + 1] == c[1] && imageData.data[i + 2] == c[2]) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        unusedColor = c;
        break;
      }
    }

    // swap transparent pixels for the unused color:
    if (unusedColor) {
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] == 0) {
          imageData.data[i] = unusedColor[0];
          imageData.data[i + 1] = unusedColor[1];
          imageData.data[i + 2] = unusedColor[2];
          imageData.data[i + 3] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    dataUrl = canvas.toDataURL('image/png');
    colorThatRepresentsTransparent = unusedColor;
  }
  let rgbSamplesGrid = await base64ImageUrlToRGBSamplesGrid(dataUrl);
  return {rgbSamplesGrid, colorThatRepresentsTransparent};
}

async function base64ImageUrlToRGBSamplesGrid(url: string, opts = {}) {
  let img = new Image();
  img.src = url;
  // @ts-ignore
  await new Promise(r => img.width ? r() : img.onload = r);

  let canvasIn = imageToCanvas(img);
  let canvasOut = imageToCanvas(img);
  if (!canvasIn || !canvasOut) return

  let ctxIn = canvasIn.getContext("2d");
  let ctxOut = canvasOut.getContext("2d");
  if (!ctxIn || !ctxOut) return;

  let imageDataIn = ctxIn.getImageData(0, 0, canvasIn.width, canvasIn.height);
  let imageDataOut = ctxOut.getImageData(0, 0, canvasOut.width, canvasOut.height);

  let pixelWidth = canvasIn.width;
  let pixelHeight = canvasIn.height;

  const colorDifferenceThreshold = 0.05;
  let gradientData = computeImageDataGradient(imageDataIn, colorDifferenceThreshold);
  // erode gradient pixels if they're not part of a line of at least 5px in length
  let changes = true;
  for (let i = 0; i < 50; i++) {
    if (!changes) break;
    changes = false;
    const lineLength = 11; // (must be odd)
    let erasures = [];
    for (let y = 0; y < gradientData.length; y++) {
      for (let x = 0; x < gradientData[y].length; x++) {
        let g = gradientData[y][x];
        if (g > 0) {
          let {v, h} = extractCardinalLinesAtPoint(gradientData, x, y, lineLength);
          let centerIndex = Math.floor(lineLength / 2);
          let vSum = 1;
          for (let i = centerIndex + 1; i < v.length; i++) {
            if (v[i] > 0) vSum++; else break;
          }
          v.reverse();
          for (let i = centerIndex + 1; i < v.length; i++) {
            if (v[i] > 0) vSum++; else break;
          }
          let hSum = 1;
          for (let i = centerIndex + 1; i < h.length; i++) {
            if (h[i] > 0) hSum++; else break;
          }
          h.reverse();
          for (let i = centerIndex + 1; i < h.length; i++) {
            if (h[i] > 0) hSum++; else break;
          }
          if (hSum < 6 && vSum < 6) {
            changes = true;
            erasures.push({x, y});
          }
        }
      }
    }
    erasures.forEach((p) => gradientData[p.y][p.x] = 0);
  }

  for (let py = 0; py < pixelHeight; py++) {
    for (let px = 0; px < pixelWidth; px++) {
      let v = gradientData[py][px] * 255;
      let i = (px + py * pixelWidth) * 4;
      //imageDataOut.data[i] = imageDataOut.data[i+1] = imageDataOut.data[i+2] = v;
      imageDataOut.data[i] = imageDataOut.data[i + 1] = imageDataOut.data[i + 2] = v > 0 ? 127 : 0;
    }
  }
  ctxOut.putImageData(imageDataOut, 0, 0);

  // get crop coords based on gradient image:
  let crop = {x1: canvasIn.width / 2, y1: canvasIn.height / 2, x2: canvasIn.width / 2, y2: canvasIn.height / 2};
  for (let py = 0; py < pixelHeight; py++) {
    for (let px = 0; px < pixelWidth; px++) {
      let g = gradientData[py][px];
      if (g > 0) {
        if (px < crop.x1) crop.x1 = px;
        if (py < crop.y1) crop.y1 = py;
        if (px > crop.x2) crop.x2 = px;
        if (py > crop.y2) crop.y2 = py;
      }
    }
  }
  crop.x1 -= 1;
  crop.y1 -= 1;

  let croppedGradData = ctxOut.getImageData(crop.x1, crop.y1, crop.x2 - crop.x1, crop.y2 - crop.y1);
  canvasOut.width = crop.x2 - crop.x1;
  canvasOut.height = crop.y2 - crop.y1;
  ctxOut.putImageData(croppedGradData, 0, 0);

  let croppedGradientData = [];
  for (let py = 0; py < pixelHeight; py++) {
    if (py > crop.y1 && py < crop.y2) {
      croppedGradientData.push(gradientData[py].slice(crop.x1, crop.x2));
    }
  }

  // they get a point for each pixel that's part of a sequence of 4+ pixels:
  let rowScores = [];
  for (let i = 0; i < croppedGradientData.length; i++) {
    let row = croppedGradientData[i];
    let streak = 0;
    let score = 0;
    for (let pixel of row) {
      streak = pixel > 0 ? streak + 1 : 0;
      score = streak > 4 ? score + 1 : score;
    }
    rowScores[i] = score;
  }
  let columnScores = [];
  for (let c = 0; c < croppedGradientData[0].length; c++) {
    let streak = 0;
    let score = 0;
    for (let r = 0; r < croppedGradientData.length; r++) {
      let pixel = croppedGradientData[r][c];
      streak = pixel > 0 ? streak + 1 : 0;
      score = streak > 4 ? score + 1 : score;
    }
    columnScores[c] = score;
  }
  // erode a bit to remove noise. subtract same amount from each bin.
  // we need to do it iteratively because we don't want to subtract from a bin
  // that has a score of zero already.
  let rowScoreSum = rowScores.reduce((a, v) => a + v, 0);
  let columnScoreSum = columnScores.reduce((a, v) => a + v, 0);
  let remainingPortion = 1;
  while (remainingPortion > 0.8) {
    rowScores = rowScores.map(s => s - 1 < 0 ? 0 : s - 1);
    remainingPortion = rowScores.reduce((a, v) => a + v, 0) / rowScoreSum;
  }
  remainingPortion = 1;
  while (remainingPortion > 0.8) {
    columnScores = columnScores.map(s => s - 1 < 0 ? 0 : s - 1);
    remainingPortion = columnScores.reduce((a, v) => a + v, 0) / columnScoreSum;
  }

  // contiguous score groups are pooled into their biggest score:
  for (let scores of [rowScores, columnScores]) {
    let batchMax = 0;
    let batchMaxIndex = null;
    let batchSum = 0;
    for (let i = 0; i < scores.length; i++) {
      let s = scores[i];
      if (s === 0) { // end of contiguous batch:
        if (batchMaxIndex !== null) {
          scores[batchMaxIndex] = batchSum;
          batchMaxIndex = null;
          batchSum = 0;
          batchMax = 0;
        }
      } else {
        batchSum += s;
        if (s > batchMax) {
          batchMaxIndex = i;
          batchMax = s;
        }
        scores[i] = 0;
      }
    }
  }
  // get the "gap" histograms:
  let rowGapHist: { [key: string]: number } = {};
  let columnGapHist: { [key: string]: number } = {};
  for (let {scores, hist} of [{scores: rowScores, hist: rowGapHist}, {scores: columnScores, hist: columnGapHist}]) {
    let indexOfLastNonZero = null;
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] !== 0) {
        if (indexOfLastNonZero !== null) {
          hist[i - indexOfLastNonZero] = (hist[i - indexOfLastNonZero] || 0) + 1;
        }
        indexOfLastNonZero = i;
      }
    }
  }

  let rowGap: number;
  let columnGap: number;

  if (Object.values(rowGapHist).reduce((a, v) => a + v, 0) < 3 || Object.values(columnGapHist).reduce((a, v) => a + v, 0) < 3) {
    // we couldn't find the grid 'so' we give up and just got with a 5x5 cell sample grid:
    rowGap = 3;
    columnGap = 3;
    crop = {x1: 0, y1: 0, x2: canvasIn.width, y2: canvasIn.height};
    rowScores = new Array(Math.round(canvasIn.height)).fill(0).map((n, i) => i % rowGap ? 0 : 1);
    columnScores = new Array(Math.round(canvasIn.width)).fill(0).map((n, i) => i % columnGap ? 0 : 1);
  } else {
    rowGap = Number(Object.entries(rowGapHist).sort((a, b) => b[1] - a[1])[0][0]);
    columnGap = Number(Object.entries(columnGapHist).sort((a, b) => b[1] - a[1])[0][0]);
  }

  let gap;
  if (Math.abs(rowGap - columnGap) > 2) {
    gap = Math.min(rowGap, columnGap)
  } else {
    gap = Math.round((rowGap + columnGap) / 2);
  }

  // fill in gaps by finding gaps which are >1.5* of the gap size, and then get their
  // closest multiple and spread that number of rows/columns in that gap.
  // we also delete lines that fall outside the most dominant grid pattern.
  for (let scores of [rowScores, columnScores]) {
    let indexOfLastNonZero = -1;
    let processedFirstNonZero = false;
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] !== 0 || i === scores.length - 1) {
        let distance = i - indexOfLastNonZero;
        let multiple = distance / gap;
        let notchesToAdd = Math.round(multiple - 1);
        if (notchesToAdd > 0) {
          let notchSpacing = Math.round(distance / (notchesToAdd + 1));
          for (let j = 1; j <= notchesToAdd; j++) {
            scores[i - (j * notchSpacing)] = 0.5;
          }
        }
        if (multiple < 0.5 && processedFirstNonZero) {
          scores[i] = -1; // <-- delete line
        } else {
          indexOfLastNonZero = i;
        }
        processedFirstNonZero = true;
      }
    }
  }

  // get cropped image data so we can take samples:
  let croppedOrigImageData = ctxIn.getImageData(crop.x1, crop.y1, crop.x2 - crop.x1, crop.y2 - crop.y1);
  canvasOut.width = crop.x2 - crop.x1;
  canvasOut.height = crop.y2 - crop.y1;
  ctxOut.putImageData(croppedOrigImageData, 0, 0);

  // take samples:
  let samplesGrid: number[][][] = [];
  let lastNonZeroRowIndex = -1;
  let lastNonZeroColumnIndex = -1;
  for (let r = 0; r < rowScores.length; r++) {
    if (rowScores[r] > 0 || r === rowScores.length - 1) {
      if (r - lastNonZeroRowIndex < 0.5 * gap) { // handles case where first row is right at start of image
        lastNonZeroRowIndex = r;
        continue;
      }
      samplesGrid.push([]);
      lastNonZeroColumnIndex = -1;
      for (let c = 0; c < columnScores.length; c++) {
        if (columnScores[c] > 0 || c === columnScores.length - 1) {
          if (c - lastNonZeroColumnIndex < 0.5 * gap) { // handles case where first column is right at start of image
            lastNonZeroColumnIndex = c;
            continue;
          }
          let cellWidth = c - lastNonZeroColumnIndex;
          let cellHeight = r - lastNonZeroRowIndex;
          let centerX = c - (cellWidth / 2);
          let centerY = r - (cellHeight / 2);
          let sampleImageData = ctxOut.getImageData(
            Math.round(centerX - (cellWidth / 4)),
            Math.round(centerY - (cellHeight / 4)),
            Math.round(cellWidth / 2),
            Math.round(cellHeight / 2)
          );
          let cellPixels = [];
          for (let i = 0; i < sampleImageData.data.length; i += 4) {
            cellPixels.push(sampleImageData.data.slice(i, i + 3));
          }
          let cellPixelStrings = cellPixels.map(p => p.join(","));
          // @ts-ignore
          let cellPixelStringHist: {
            [key: string]: number
            // @ts-ignore
          } = cellPixelStrings.reduce((a, v) => (a[v] = (a[v] || 0) + 1, a), {});
          let histEntries: [string, number][] = Object.entries(cellPixelStringHist).sort((a, b) => b[1] - a[1]);
          let rgb: number[] = [];
          if (histEntries[0][1] === histEntries[histEntries.length - 1][1]) { // if they each occur just as often as one another, average them
            rgb = [0, 0, 0];
            let pixelCount = 0;
            for (let [strColor, freq] of histEntries) {
              // @ts-ignore
              pixelCount += freq;
              let rgbValues = strColor.split(",").map(n => Number(n));
              rgb[0] += rgbValues[0] * freq;
              rgb[1] += rgbValues[1] * freq;
              rgb[2] += rgbValues[2] * freq;
            }
            rgb[0] /= pixelCount;
            rgb[1] /= pixelCount;
            rgb[2] /= pixelCount;
          } else {
            rgb = histEntries[0][0].split(",").map(n => Number(n)); // otherwise choose the most common one
          }
          // @ts-ignore
          samplesGrid[samplesGrid.length - 1].push(rgb.map(n => Math.round(n)));
          lastNonZeroColumnIndex = c;
        }
      }
      lastNonZeroRowIndex = r;
    }
  }

  return samplesGrid;
}

function extractCardinalLinesAtPoint(gridYX: number[][], cx: number, cy: number, lineLength: number) {
  if (lineLength % 2 == 0) throw new Error("you need to pass an odd line length");
  let v = [];
  let h = [];
  let radius = Math.floor(lineLength / 2)
  for (let x = cx - radius; x < cx + radius + 1; x++) {
    h.push(gridYX[cy][x] !== undefined ? gridYX[cy][x] : 0);
  }
  for (let y = cy - radius; y < cy + radius + 1; y++) {
    v.push(gridYX[y] !== undefined ? gridYX[y][cx] : 0);
  }
  return {v, h};
}

function imageToCanvas(img: CanvasImageSource) {
  let canvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.width = <number>img.width;
  canvas.height = <number>img.height;
  let ctx = canvas.getContext("2d");
  if (!ctx) return
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, <number>img.width, <number>img.height);
  return canvas;
}

function computeImageDataGradient(imageDataIn: any, threshold: number) {
  let pixelWidth = imageDataIn.width;
  let pixelHeight = imageDataIn.height;
  let hGradient = [];
  let vGradient = [];
  let sumGradient: number[][] = [];

  // calculate gradient:
  // A B C ...
  // D E F ...
  // .........
  // AB diff is stored in B position
  // AD diff is stored in D position
  // etc.
  hGradient[0] = new Array(pixelWidth).fill(0);
  vGradient[0] = new Array(pixelWidth).fill(0);
  sumGradient[0] = new Array(pixelWidth).fill(0);
  for (let py = 1; py < pixelHeight; py++) {
    hGradient[py] = [];
    vGradient[py] = [];
    sumGradient[py] = [];
    hGradient[py][0] = 0;
    vGradient[py][0] = 0;
    sumGradient[py][0] = 0;
    for (let px = 1; px < pixelWidth; px++) {
      let diff, rgb1, rgb2;
      let i = (px + py * pixelWidth) * 4;
      // horizontal:
      rgb1 = imageDataIn.data.slice(i, i + 3);
      rgb2 = imageDataIn.data.slice((i - 4), (i - 4) + 3);
      diff = deltaE(rgb1, rgb2);
      hGradient[py][px] = diff;
      // vertical:
      rgb1 = imageDataIn.data.slice(i, i + 3);
      rgb2 = imageDataIn.data.slice(i - (pixelWidth * 4), i - (pixelWidth * 4) + 3);
      diff = deltaE(rgb1, rgb2);
      vGradient[py][px] = diff;
      sumGradient[py][px] = (vGradient[py][px] + hGradient[py][px]) / 200; // normalised (0, 1) inclusive
      if (sumGradient[py][px] < threshold) sumGradient[py][px] = 0;
    }
  }
  return sumGradient;
}

function deltaE(rgbA: number[], rgbB: number[]) {
  let labA = rgb2lab(rgbA);
  let labB = rgb2lab(rgbB);
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  let deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / (1.0);
  let deltaCkcsc = deltaC / (sc);
  let deltaHkhsh = deltaH / (sh);
  let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

function rgb2lab(rgb: number[]) {
  let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722);
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
  y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
  z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;
  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

async function canvasToImage(canvas: HTMLCanvasElement) {
  let img = new Image();
  img.src = canvas.toDataURL();
  // wait for load because function user could reasonably expect
  // the image to actually be loaded:
  // @ts-ignore
  await new Promise(r => img.width ? r() : img.onload = r);
  return img;
}

async function test70(ctx: CanvasRenderingContext2D) {
  const out = []
  for (let y = 0; y < ctx.canvas.height; y++) {
    const temp = []
    for (let x = 0; x < ctx.canvas.width; x++) {
      const pixelData: any = ctx?.getImageData(x, y, 1, 1);
      if ((pixelData.data[0] + pixelData.data[1] + pixelData.data[2] + pixelData.data[3]) !== 0) {
        temp.push(pixelData.data)
      } else {
        temp.push([255, 255, 255])
      }
    }
    out.push(temp)
  }
  return {
    rgbSamplesGrid: out,
    colorThatRepresentsTransparent: null
  }
}

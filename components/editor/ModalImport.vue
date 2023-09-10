<script setup lang="ts">
import {useEditor} from "~/stores/editor";
import {trimCanvas} from "~/helper/canvas";
import {rgbToHex} from "~/helper/color";

const editorStore = useEditor()
const loadErrs = ref<string[]>([])
const basePixelSize = ref(16)
const pixelSize = ref(16)
const range = ref("1")
const hasImage = ref(false)
const loadFile = () => {
  hasImage.value = true
  loadErrs.value = []
  const fileElm: HTMLInputElement | null = document.getElementById("inputFile") as HTMLInputElement
  const canvas = document.getElementById('import_preview') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d', {
    willReadFrequently: true
  })
  const imagePreview = document.getElementById('image_preview')
  const preview = document.getElementById('preview')
  if (preview && fileElm && ctx && imagePreview) {
    const img = new Image;
    img.onload = function () {
      ctx.imageSmoothingEnabled = false;
      const temp = preview.offsetWidth / img.width
      pixelSize.value = preview.offsetWidth > img.width ? temp : img.width / preview.offsetWidth
      basePixelSize.value = pixelSize.value
    }
    img.onerror = function () {
      loadErrs.value.push('Sorry, I can\'t load your image!')
    }
    const files = fileElm.files
    if (files && files[0]) {
      const reader = new FileReader
      reader.onload = (e: any) => {
        img.src = e?.target?.result
        imagePreview.src = e?.target?.result
        canvas.width = imagePreview.offsetWidth
        canvas.height = imagePreview.offsetHeight
      }
      reader.readAsDataURL(files[0])
    }
  }
}

watch(range, () => {
  pixelSize.value = basePixelSize.value * 2 * Number.parseInt(range.value)
})
</script>

<template>
  <div class="p-4 py-3 space-y-3 cursor-pointer" :style="{'--zoom-size': `${pixelSize}px ${pixelSize}px`,}">
    <div v-show="hasImage" id="preview" class="relative">
      <img class="w-full" id="image_preview" src="" alt="">
      <canvas id="import_preview" class="absolute inset-0"/>
      <div id="mask" class="absolute inset-0"/>
    </div>
    <input
      v-show="hasImage"
      type="range" v-model="range" step="1" min="1"
      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
    >
    <div class="p-4 bg-blue-100 py-2 text-sm border rounded-[2px]">
      <p>You can load your pixel art by click to select file!</p>
    </div>
    <input
      id="inputFile" type="file" class="w-full" placeholder="Load"
      @input="loadFile"
    >
    <div v-if="loadErrs.length" class="p-4 bg-yellow-100 py-2 text-sm border rounded-[2px]">
      <div v-for="e in loadErrs" :key="e">{{ e }}</div>
    </div>
  </div>
</template>

<style>
#image_preview {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

#mask {
  border-color: #DDDDDD;
  background-size: var(--zoom-size);
  background-image: linear-gradient(to right, #F0F0F0 1px, transparent 1px),
  linear-gradient(to bottom, #F0F0F0 1px, transparent 1px);
}
</style>

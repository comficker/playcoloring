<script setup lang="ts">
import {useEditor} from "~/stores/editor";
import {trimCanvas} from "~/helper/canvas";
import {rgbToHex} from "~/helper/color";

const editorStore = useEditor()
const loadErrs = ref<string[]>([])
const loadFile = () => {
  loadErrs.value = []
  const fileElm: HTMLInputElement | null = document.getElementById("inputFile") as HTMLInputElement
  const canvas = document.getElementById('workspace') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d', {
    willReadFrequently: true
  })
  if (fileElm && ctx) {
    const img = new Image;
    img.onload = function () {}
    img.onerror = function () {
      loadErrs.value.push('Sorry, I can\'t load your image!')
    }
    const files = fileElm.files
    if (files && files[0]) {
      const reader = new FileReader
      reader.onload = (e: any) => {
        img.src = e?.target?.result
      }
      reader.readAsDataURL(files[0])
    }
  }
}
</script>

<template>
  <div class="p-4 py-3 space-y-3 cursor-pointer">
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

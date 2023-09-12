<script setup lang="ts">
import {useEditor} from "~/stores/editor";
import {dataUrlToSamplesGrid} from "~/helper/canvas";

const editorStore = useEditor()
const loadErrs = ref<string[]>([])

const loadFile = () => {
  loadErrs.value = []
  const fileElm: HTMLInputElement | null = document.getElementById("inputFile") as HTMLInputElement
  if (fileElm) {
    const files = fileElm.files
    if (files && files[0]) {
      const reader = new FileReader
      reader.onload = async (e: any) => {
        let dataUrl = e.target.result;
        let {rgbSamplesGrid, colorThatRepresentsTransparent} = await dataUrlToSamplesGrid(dataUrl);
        console.log(rgbSamplesGrid);
        if (rgbSamplesGrid) {
          editorStore.loadFromFile(rgbSamplesGrid, colorThatRepresentsTransparent);
        }
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

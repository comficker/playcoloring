<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const editorStore = useEditor()
const newSize = ref(editorStore.workspace.width)
const suggestSizes = [8, 16, 24, 32]

const preSave = () => {
  editorStore.addStep({type: 'resize', value: newSize.value})
  editorStore.toggleModal('resize')
}
</script>

<template>
  <div class="p-4 py-3 space-y-3">
    <div class="flex justify-between items-center text-xs">
      <div class="text-2xl font-bold">Resize</div>
      <div class="i-con-minimize w-4 h-4 cursor-pointer" @click="editorStore.toggleModal('resize')"/>
    </div>
    <div class="flex gap-4 text-xs font-bold">
      <div
        v-for="s in suggestSizes" :key="s"
        class="border w-12 h-12 p-1 hover:border-blue-500 cursor-pointer duration-200"
        :class="{'border-blue-500': newSize === s}"
        @click="newSize = s"
      >{{ s }}</div>
      <div
        class="border w-12 h-12 p-1 hover:border-blue-500 cursor-pointer duration-200"
        :class="{'border-blue-500': !suggestSizes.includes(newSize)}"
      >
        <input v-model="newSize" class="w-full outline-none" type="number">
      </div>
    </div>
    <div class="flex gap-4">
      <div class="btn bg-green-500 text-white font-semibold text-sm" @click="preSave">Resize</div>
    </div>
  </div>
</template>

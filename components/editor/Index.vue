<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const editorStore = useEditor()
const isPWA = computed(() => process.client && window.isPWA)
</script>

<template>
  <div
    id="editor"
    class="fill-available flex flex-col relative font-semibold -mx-4"
    style="--min-height: calc(100vh - 60px)"
    :style="{'--min-height': `calc(100vh - ${isPWA ? '95': '75'}px)`}"
  >
    <div class="flex-1 w-full relative">
      <editor-board/>
    </div>
    <div id="control-area">
      <div v-if="!editorStore.isCompleted" class="border-y">
        <div class="max-w-xl py-2 w-full mx-auto">
          <editor-palette/>
        </div>
      </div>
      <div class="md:absolute md:top-4 md:left-4">
        <editor-controller/>
      </div>
      <div v-if="editorStore.isCompleted" class="palette py-2 flex flex-row justify-center gap-2">
        <div
          class="btn bg-green-500 text-white"
          @click="editorStore.loadFromCloud('random')"
        >
          <div class="i-con-pad w-4 h-4"/>
          <span class="uppercase text-xs font-bold">Continue</span>
        </div>
        <div
          class="btn bg-green-500 text-white"
          @click="editorStore.toggleModal('save')"
        >
          <div class="i-con-share w-4 h-4"/>
          <span class="uppercase text-xs font-bold">Share</span>
        </div>
        <div
          class="btn bg-gray-200"
          @click="editorStore.clear()"
        >
          <div class="i-con-refresh w-4 h-4"/>
          <span class="uppercase text-xs font-bold">Replay</span>
        </div>
      </div>
      <div v-if="editorStore.isCompleted" class="text-center text-2xl font-bold text-white opacity-50 mx-auto">
        <span class="block bg-yellow-500 uppercase p-4">Completed!</span>
      </div>
    </div>
    <editor-modal/>
  </div>
</template>

<style>
#editor {
  min-height: calc(100vh - 60px);
}

@media only screen and (max-width: 640px) {
  #editor {
    min-height: var(--min-height);
  }
}
</style>

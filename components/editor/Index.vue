<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const editorStore = useEditor()
</script>

<template>
  <div id="editor" class="fill-available flex flex-col relative font-semibold -mx-4">
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
#control-area {
  @apply bg-gray-50 bottom-0 left-0 right-0 duration-200 z-10;
}

#editor {
  min-height: calc(100vh - 55px);
}

@media only screen and (max-width: 640px)  {
  #control-area {
    @apply sticky;
  }
}
</style>

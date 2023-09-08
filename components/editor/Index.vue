<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const editorStore = useEditor()
</script>

<template>
  <div id="editor" class="fill-available flex flex-col relative font-semibold -mx-4">
    <div class="flex-1 w-full relative px-4">
      <editor-board/>
      <div class="absolute top-4 left-4">
        <editor-controller/>
      </div>
    </div>
    <div
      v-if="!editorStore.isCompleted"
      class="palette border-y bottom-0 left-0 right-0 duration-200 z-10 relative bg-gray-50"
      :class="{'sticky': !editorStore.modalShowing}">
      <div class="mx-auto px-4 md:px-0 max-w-xl py-3 md:py-2 w-full mx-auto">
        <editor-palette/>
      </div>
    </div>
    <editor-modal/>
  </div>
</template>

<style>
#editor {
  min-height: calc(100vh - 54px);
}
</style>

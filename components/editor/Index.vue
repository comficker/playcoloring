<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const editorStore = useEditor()
</script>

<template>
  <div id="editor" class="fill-available flex flex-col relative font-semibold -mx-4">
    <div class="flex-1 w-full relative px-4">
      <editor-board/>
    </div>
    <div
      v-if="!editorStore.isCompleted"
      class="border-y bottom-0 left-0 right-0 duration-200 z-10 bg-white"
      :class="{'sticky': !editorStore.modalShowing}">
      <div class="max-w-xl py-2 w-full mx-auto">
        <editor-palette/>
      </div>
    </div>
    <div class="sticky left-0 bottom-0 md:absolute md:top-4 md:left-4">
      <editor-controller/>
    </div>
    <editor-modal/>
  </div>
</template>

<style>
#editor {
  min-height: calc(100vh - 54px);
}
</style>

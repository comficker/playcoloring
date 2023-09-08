<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const editorStore = useEditor()
</script>

<template>
  <div id="editor" class="fill-available flex flex-col relative font-semibold -mx-4">
    <div class="md:flex-1 w-full relative px-4">
      <editor-board/>
    </div>
    <div id="control-area">
      <div
        v-if="!editorStore.isCompleted"
        class="border-y"
      >
        <div class="max-w-xl py-2 w-full mx-auto">
          <editor-palette/>
        </div>
      </div>
      <div class="md:absolute md:top-4 md:left-4">
        <editor-controller/>
      </div>
    </div>
    <editor-modal/>
  </div>
</template>

<style>
#control-area {
  @apply bg-white bottom-0 left-0 right-0 duration-200 z-10;
}

@media only screen and (min-width: 640px)  {
  #editor {
    min-height: calc(100vh - 54px);
  }
}

@media only screen and (max-width: 640px)  {
  #control-area {
    @apply sticky;
  }
}
</style>

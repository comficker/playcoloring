<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const editorStore = useEditor()
</script>

<template>
  <div id="editor" class="fill-available flex flex-col relative font-semibold -mx-4">
    <div class="flex-1 w-full relative">
      <editor-board/>
    </div>
    <div v-if="!editorStore.isCompleted" id="control-area">
      <div class="border-y">
        <div class="max-w-xl py-2 w-full mx-auto">
          <editor-palette/>
        </div>
      </div>
      <div class="md:absolute md:top-4 md:left-4">
        <editor-controller/>
      </div>
    </div>
    <editor-modal/>
    <editor-complete/>
  </div>
</template>

<style>
#control-area {
  @apply bg-white bottom-0 left-0 right-0 duration-200 z-10;
}

#editor {
  min-height: calc(100vh - 54px);
}

@media only screen and (max-width: 640px)  {
  #control-area {
    @apply sticky;
  }
}
</style>

<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const editorStore = useEditor()
</script>

<template>
  <Transition
    enter-active-class="animated animated-duration-300 animate-slide-fade-in"
    leave-active-class="animated animated-duration-300 animate-slide-fade-out"
  >
    <div v-if="editorStore.modalShowing" class="fixed inset-0" @click="editorStore.toggleModal('')"/>
  </Transition>
  <Transition
    enter-active-class="animated animated-duration-300 animate-slide-in-up"
    leave-active-class="animated animated-duration-300 animate-slide-out-down"
  >
    <div v-if="editorStore.modalShowing" class="z-20 fixed bottom-0 -right-[1px] -left-[1px] z-60">
      <div class="absolute inset-0" @click="editorStore.toggleModal('')"/>
      <div class="relative max-w-xl mx-auto bg-white shadow-xl rounded-tl-lg rounded-tr-lg border md:border-b-0">
        <editor-modal-save v-if="editorStore.modalShowing == 'save'"/>
        <editor-modal-resize v-else-if="editorStore.modalShowing == 'resize'"/>
        <editor-modal-import v-else-if="editorStore.modalShowing == 'import'"/>
        <editor-modal-confirm v-else-if="editorStore.modalShowing.startsWith('confirm_')"/>
      </div>
    </div>
  </Transition>
</template>

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
    enter-active-class="animated animated-duration-300 animate-slide-in-down"
    leave-active-class="animated animated-duration-300 animate-slide-out-up"
  >
    <div v-if="editorStore.modalShowing" class="z-20 fixed top-[55px] -right-[1px] -left-[1px] z-60">
      <div class="absolute inset-0" @click="editorStore.toggleModal('')"/>
      <div class="relative max-w-xl mx-auto bg-white shadow-xl rounded-bl-lg rounded-br-lg border md:border-t-0">
        <editor-modal-save v-if="editorStore.modalShowing == 'save'"/>
        <editor-modal-resize v-else-if="editorStore.modalShowing == 'resize'"/>
        <editor-modal-import v-else-if="editorStore.modalShowing == 'import'"/>
        <editor-modal-confirm v-else-if="editorStore.modalShowing.startsWith('confirm_')"/>
      </div>
    </div>
  </Transition>
</template>

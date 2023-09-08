<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const es = useEditor()
</script>

<template>
  <Transition
    enter-active-class="animated animated-faster animated-fade-in"
    leave-active-class="animated animated-faster animated-fade-out-down"
  >
    <div
      v-if="es.isCompleted && !es.modalShowing"
      class="absolute inset-0 flex flex-col items-center justify-center"
    >
      <div class="text-center">
        <div class="text-4xl font-extrabold text-white opacity-75">
          <span class="block bg-yellow-500 p-2 px-4">Completed!</span>
        </div>
      </div>
      <div class="flex flex-row justify-center gap-3 absolute bottom-4 left-0 right-0">
        <div
          class="btn bg-green-500 text-white"
          @click="es.loadFromCloud('random')"
        >
          <div class="i-con-pad w-4 h-4"/>
          <span class="uppercase text-xs font-bold">Continue</span>
        </div>
        <div
          class="btn bg-green-500 text-white"
          @click="es.toggleModal('save')"
        >
          <div class="i-con-share w-4 h-4"/>
          <span class="uppercase text-xs font-bold">Share</span>
        </div>
        <div
          class="btn bg-gray-200"
          @click="es.clear()"
        >
          <div class="i-con-refresh w-4 h-4"/>
          <span class="uppercase text-xs font-bold">Replay</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

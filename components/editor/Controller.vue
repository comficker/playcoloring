<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const eStore = useEditor()
</script>

<template>
  <div class="overflow-auto no-scrollbar">
    <div class="controller palette md:flex-col flex-nowrap">
      <template v-if="!eStore.isCompleted">
        <div
          class="btn" :class="{'active': eStore.options.boardFunc === ''}"
          @click="eStore.boardSetFunc('')">
          <div class="i-con-spray w-4 h-4"/>
        </div>
        <div
          class="btn" :class="{'active': eStore.options.boardFunc === 'mirror'}"
          @click="eStore.boardSetFunc('mirror')">
          <div class="i-con-compare w-4 h-4"/>
        </div>
        <div
          class="btn" :class="{'active': eStore.options.boardFunc === 'bucket'}"
          @click="eStore.boardSetFunc('bucket')"
        >
          <div class="i-con-fill w-4 h-4"/>
        </div>
        <div
          v-if="eStore.isEditor"
          class="btn" :class="{'active': eStore.options.boardFunc === 'move'}"
          @click="eStore.boardSetFunc('move')">
          <div class="i-con-move w-4 h-4"/>
        </div>
      </template>
      <div class="btn" @click="eStore.handleZoom(true)">
        <div class="i-con-zoom-in w-4 h-4"/>
      </div>
      <div class="btn" @click="eStore.handleZoom(false)">
        <div class="i-con-zoom-out w-4 h-4"/>
      </div>
      <div
        v-if="eStore.isEditor"
        class="btn" :class="{'active': eStore.modalShowing == 'resize'}"
        @click="eStore.toggleModal( 'resize')"
      >
        <div class="i-con-ruler w-4 h-4"/>
      </div>
      <div v-if="!eStore.isCompleted" class="btn relative" @click="eStore.clear()">
        <div class="i-con-refresh w-4 h-4"/>
        <div
          v-if="eStore.fetchingPercent < 101"
          class="absolute top-0 bottom-0 left-0 bg-gray-100 opacity-75 duration-75 rounded-[2px]"
          :style="{width: `${eStore.fetchingPercent}%`}"
        />
      </div>
      <div
        v-if="eStore.isEditor"
        class="btn" @click="eStore.toggleModal('import')">
        <div class="i-con-import w-4 h-4"/>
      </div>
      <div class="md:hidden w-2 h-4 h-full flex-none"/>
    </div>
  </div>
</template>

<style>
.controller {
  @apply py-2 p-4 bg-gray-50 md:bg-white border-b md:px-1 md:rounded md:border flex gap-1.5 text-sm;
}

.controller .btn {
  @apply border flex-none justify-center hover:shadow border-gray-300 md:border-transparent;
}

.controller .btn:hover,
.controller .btn.active {
  @apply border-blue;
}
</style>

<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const eStore = useEditor()
</script>

<template>
  <div class="overflow-auto no-scrollbar">
    <div class="controller palette md:grid-cols-1 grid-cols-2" :class="{'grid-cols-3': !eStore.isCompleted}">
      <template v-if="!eStore.isCompleted">
        <div
          class="btn" :class="{'active': eStore.options.boardFunc === ''}"
          @click="eStore.boardSetFunc('')">
          <div class="i-con-plus w-4 h-4"/>
          <span class="md:hidden">Brush</span>
        </div>
        <div
          class="btn" :class="{'active': eStore.options.boardFunc === 'mirror'}"
          @click="eStore.boardSetFunc('mirror')">
          <div class="i-con-compare w-4 h-4"/>
          <span class="md:hidden">Mirror</span>
        </div>
        <div
          v-if="!eStore.isEditor"
          class="btn" :class="{'active': eStore.options.boardFunc === 'bucket'}"
          @click="eStore.boardSetFunc('bucket')"
        >
          <div class="i-con-fill w-4 h-4"/>
          <span class="md:hidden">Bucket</span>
        </div>
        <div
          v-if="eStore.isEditor"
          class="btn" :class="{'active': eStore.options.boardFunc === 'move'}"
          @click="eStore.boardSetFunc('move')">
          <div class="i-con-move w-4 h-4"/>
          <span class="md:hidden">Move</span>
        </div>
      </template>
      <div class="btn" @click="eStore.handleZoom(true)">
        <div class="i-con-zoom-in w-4 h-4"/>
        <span class="md:hidden">Z. Out</span>
      </div>
      <div class="btn" @click="eStore.handleZoom(false)">
        <div class="i-con-zoom-out w-4 h-4"/>
        <span class="md:hidden">Z. In</span>
      </div>
      <div
        v-if="eStore.isEditor"
        class="btn" :class="{'active': eStore.modalShowing == 'resize'}"
        @click="eStore.toggleModal( 'resize')"
      >
        <div class="i-con-ruler w-4 h-4"/>
        <span class="md:hidden">Resize</span>
      </div>
      <div v-if="!eStore.isCompleted" class="btn relative" @click="eStore.clear()">
        <div class="i-con-refresh w-4 h-4"/>
        <span class="md:hidden">Clear</span>
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
        <span class="md:hidden">Import</span>
      </div>
    </div>
  </div>
</template>

<style>
.controller {
  @apply p-4 bg-white border-b md:px-1 md:rounded md:border grid gap-1.5 text-sm;
}

.controller .btn {
  @apply border flex-none justify-center hover:shadow rounded border-gray-300 md:border-transparent;
}

.controller .btn:hover,
.controller .btn.active {
  @apply border-blue;
}
</style>

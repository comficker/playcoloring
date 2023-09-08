<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const eStore = useEditor()
</script>

<template>
  <div class="controller palette">
    <div
      class="btn hover:shadow rounded" :class="{'border border-blue': eStore.options.boardFunc === ''}"
      @click="eStore.boardSetFunc('')">
      <div class="i-con-plus w-4 h-4"/>
    </div>
    <div
      class="btn hover:shadow rounded" :class="{'border border-blue': eStore.options.boardFunc === 'mirror'}"
      @click="eStore.boardSetFunc('mirror')">
      <div class="i-con-compare w-4 h-4"/>
    </div>
    <div
      v-if="!eStore.isEditor"
      class="btn hover:shadow rounded" :class="{'border border-blue': eStore.options.boardFunc === 'bucket'}"
      @click="eStore.boardSetFunc('bucket')"
    >
      <div class="i-con-fill w-4 h-4"/>
    </div>
    <div
      v-if="eStore.isEditor"
      class="btn hover:shadow rounded" :class="{'border border-blue': eStore.options.boardFunc === 'move'}"
      @click="eStore.boardSetFunc('move')">
      <div class="i-con-move w-4 h-4"/>
    </div>
    <div class="btn hover:shadow rounded" @click="eStore.handleZoom(true)">
      <div class="i-con-zoom-in w-4 h-4"/>
    </div>
    <div class="btn hover:shadow rounded" @click="eStore.handleZoom(false)">
      <div class="i-con-zoom-out w-4 h-4"/>
    </div>
    <div
      v-if="eStore.isEditor"
      class="btn hover:shadow rounded" :class="{'border border-blue': eStore.modalShowing == 'resize'}"
      @click="eStore.toggleModal( 'resize')"
    >
      <div class="i-con-ruler w-4 h-4"/>
    </div>
    <div class="btn hover:shadow rounded relative" @click="eStore.clear()">
      <div class="i-con-refresh w-4 h-4"/>
      <div
        v-if="eStore.fetchingPercent < 101"
        class="absolute top-0 bottom-0 left-0 bg-gray-100 opacity-75 duration-75 rounded-[2px]"
        :style="{width: `${eStore.fetchingPercent}%`}"
      />
    </div>
    <div
      v-if="eStore"
      class="btn hover:shadow rounded" @click="eStore.toggleModal('import')">
      <div class="i-con-import w-4 h-4"/>
    </div>
  </div>
</template>

<style>
.controller {
  @apply flex gap-1.5 px-4 p-2 bg-white border-b md:px-1 md:flex-col md:rounded md:border md:items-center md:justify-center;
}
</style>

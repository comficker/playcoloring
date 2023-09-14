<script setup lang="ts">
import {useEditor} from "~/stores/editor";

const es = useEditor()

const doThis = () => {
  const f = es.modalShowing.split("_")
  if (f[1] === "clear") {
    es.clear(Boolean(es.modalParams))
  }
  es.toggleModal(es.modalShowing)
}
</script>

<template>
  <div class="p-4 py-3 space-y-3">
    <div class="flex justify-between items-center text-xs">
      <div class="text-2xl font-bold">Are you sure?</div>
      <div class="i-con-minimize w-4 h-4 cursor-pointer" @click="es.toggleModal(es.modalShowing)"/>
    </div>
    <div class="flex gap-4 font-semibold text-sm">
      <div class="btn bg-green-500 text-white" @click="doThis">Yes, I'm sure</div>
      <div class="btn" @click="es.toggleModal(es.modalShowing)">Nope</div>
    </div>
  </div>
</template>

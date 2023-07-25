<script setup lang="ts">
import {useRoute, useRouter} from "#app";

const route = useRoute()
const handleClick = () => {
  const refresh = Number.parseInt(route.query.r ? route.query.r.toString() : "0") + 1
  useRouter().push(`/?id=random&r=${refresh}`)
}
</script>

<template>
  <div class="btn relative">
    <div class="absolute inset-0" @click="handleClick"/>
    <div class="hover:bg-gray-50 hover:text-black duration-200 rounded-lg relative z-10 p-1 -my-1">
      <div class="i-con-down w-4 h-4"/>
    </div>
    <span>Random</span>
  </div>
</template>

<style scoped>

</style>

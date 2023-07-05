<template>
  <div class="max-w-xl mx-auto w-full px-4 md:px-0">
    <div class="flex justify-between">
      <h1>
        <nuxt-link class="flex gap-1" to="/">
          <div class="i-con-pad fill-red-400 h-8 w-8"/>
          <img class="w-auto h-8" src="/logo.png" alt="Play Coloring">
        </nuxt-link>
      </h1>
      <nuxt-link class="p-2.5 cursor-pointer" to="/editor">
        <div class="w-4 h-4 i-con-design"></div>
      </nuxt-link>
    </div>
  </div>
</template>

<style>
</style>

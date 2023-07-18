<template>
  <div class="max-w-xl mx-auto w-full px-4 md:px-0 py-2">
    <div class="flex justify-between items-center">
      <h1>
        <nuxt-link class="flex gap-1" to="/">
          <div class="i-con-pad fill-red-400 h-8 w-8"/>
          <img class="hidden md:block w-auto h-8" src="/logo.png" alt="Play Coloring">
        </nuxt-link>
      </h1>
      <nuxt-link class="btn hover:shadow rounded" to="/editor">
        <div class="w-4 h-4 i-con-design"></div>
        <span>Editor</span>
      </nuxt-link>
    </div>
  </div>
</template>

<style>
</style>

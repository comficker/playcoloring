<template>
  <main id="main" class="flex flex-col bg-emerald-50 text-emerald-800 min-h-full px-4">
    <Header/>
    <div class="flex-1">
      <slot class="w-full"/>
    </div>
    <Footer/>
  </main>
</template>
<script lang="ts">
</script>
<style>
html {
  scroll-behavior: smooth;
}

body {
  background: #faf8ef;
  color: #776e65;
}

#main {
}
</style>

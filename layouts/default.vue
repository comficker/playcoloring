<template>
  <main id="main" class="flex flex-col min-h-full pt-6">
    <Header/>
    <div class="flex-1 p-4">
      <slot class="w-full"/>
    </div>
    <Footer/>
  </main>
</template>

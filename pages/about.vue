<script setup lang="ts">
import {useSeoMeta} from "nuxt/app";

useSeoMeta({
  title: "About Us",
  description: 'Our mission and objective!'
})
</script>

<template>
  <div class="space-y-4 max-w-xl mx-auto">
    <h1 class="text-3xl md:text-5xl font-bold">About</h1>
    <div class="space-y-3">
      <blockquote>
        Play Coloring was created to provide a Coloring by Number that promotes mindfulness and stress relief in an enjoyable and accessible way.
      </blockquote>
      <p>We believe in the power of art therapy and the therapeutic benefits of coloring. <b>Play Coloring</b> app allows users to unwind, de-stress, and express themselves through the art of coloring.</p>
      <h2 class="text-2xl md:text-3xl font-bold">We try:</h2>
      <ul class="pl-8 list-decimal space-y-2">
        <li>Provide a wide variety of high-quality coloring pages featuring different themes, ranging from nature and animals to fantasy and abstract designs.</li>
        <li>Offer a user-friendly interface that allows users to easily select colors, customize brush sizes, and effortlessly navigate through the coloring app.</li>
        <li>Foster a vibrant and supportive community within the app where users can share their artwork, provide feedback, and engage in creative discussions.</li>
        <li>Continuously update and expand the collection of coloring pages to keep users engaged and inspired, incorporating special seasonal themes and events.</li>
        <li>Integrate relaxation techniques and mindfulness exercises into the app, such as soothing background music or guided meditation sessions, to enhance the stress-relieving aspect of coloring.</li>
        <li>Collaborate with artists and illustrators to feature their original artwork in the app, promoting their work and giving users access to a diverse range of styles and techniques.</li>
        <li>Ensure compatibility across various devices and operating systems to ensure widespread accessibility and user convenience.</li>
      </ul>
      <p>By fulfilling this mission and objectives, our coloring app aims to provide a joyful and therapeutic experience for users, enabling them to unleash their creativity, reduce stress, and find moments of tranquility in their busy lives.</p>
    </div>
  </div>
</template>

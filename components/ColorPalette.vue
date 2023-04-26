<template>
  <div class="py-1">
    <div class="grid grid-cols-4 gap-1">
      <div
        v-for="(c, i) in data" :key="c"
        class="cursor-pointer"
        @click="onClickColor(c)"
      >
        <div class="w-6 h-6 text-center text-white text-xs leading-6" :style="{backgroundColor: c}">
          <div class="invert" :style="{'color': c}">{{ i }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  value: { type: Array, required: true }
})

const data = ref(props.value)

const onClickColor = (c: string) => {

}

watch(props.value, () => {
  data.value = props.value
})
</script>

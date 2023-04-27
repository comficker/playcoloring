<template>
  <div class="py-1">
    <div class="grid grid-cols-6 gap-1 max-h-64 overflow-auto">
      <div
        v-for="(c, i) in data" :key="c"
        class="cursor-pointer"
        @click="onClickColor(c)"
      >
        <div class="w-8 h-8 p-1 text-white text-xs" :style="{backgroundColor: c}">
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

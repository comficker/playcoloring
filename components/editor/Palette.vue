<script setup lang="ts">
import {useEditor} from "~/stores/editor";
import pkg from "lodash";

const {cloneDeep} = pkg;

const es = useEditor()

const palettes = ref<string[][]>([])
const adjustColors = ref<string[]>(cloneDeep(es.workspace.colors))
const combineColors = ref<number[]>([])

const onClickColor = (i: number) => {
  if (es.options.paletteFunc === 'combine') {
    const index = combineColors.value.indexOf(i)
    if (index < 0) {
      combineColors.value.push(i)
    } else {
      combineColors.value.splice(index, 1)
    }
  } else {
    es.paletteSetColor(i)
  }
}

const checkColor = (i: number) => {
  return es.options.paletteFunc === 'combine' ? combineColors.value.includes(i) : i === es.options.color
}

const preSelect = (f: string) => {
  combineColors.value = []
  adjustColors.value = cloneDeep(es.workspace.colors)
  es.paletteSetFunc(f)
}

const preSave = () => {
  switch (es.options.paletteFunc) {
    case 'adjust':
      palettes.value.push(es.workspace.colors)
      es.addStep({
        type: 'adjust',
        value: adjustColors.value
      })
      break
    case 'combine':
      es.addStep({
        type: 'combine',
        value: combineColors.value
      })
      break
  }
  es.paletteSetFunc('')
}
</script>

<template>
  <div class="flex gap-2 text-sm flex-nowrap md:items-center" :class="{'flex-col md:flex-row': es.isEditor}">
    <!--Palette area-->
    <div class="flex-1 overflow-auto no-scrollbar relative">
      <div class="flex flex-nowrap gap-2 w-full">
        <div
          v-if="es.options.paletteFunc === 'adjust'"
          class="btn hover:border-gray-2 sticky left-0 bg-white pr-4"
        >
          <div class="w-4 h-4 i-con-down"/>
          <span>Palette</span>
        </div>
        <template v-if="es.options.paletteFunc === 'adjust'">
          <div
            v-for="(_, i) in adjustColors" :key="i"
            class="flex-none rounded-full overflow-hidden md:rounded-[2px] w-10 h-10">
            <input type="color" class="w-full h-full" v-model="adjustColors[i]">
          </div>
        </template>
        <template v-else>
          <div
            v-for="(c, i) in es.workspace.colors"
            :key="i"
            class="flex-none cursor-pointer p-2.5 rounded-[2px] relative"
            :class="{'text-white': !c.startsWith('#f')}"
            :style="{backgroundColor: c}"
            @click="onClickColor(i)"
          >
            <div v-if="checkColor(i)" class="absolute right-0.5 top-0.5 i-con-check w-4 h-4"/>
            <div class="w-4 h-4">
              <div>{{ i }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="flex gap-2">
      <div
        v-if="!es.options.paletteFunc"
        class="btn hover:border-gray-2"
        :class="{'border-blue': es.options.color == -1}"
        @click="es.paletteSetColor(-1)"
      >
        <div class="w-4 h-4 i-con-eraser"/>
      </div>
      <div
        v-if="es.isEditor"
        class="btn border-gray-100 hover:border-gray-200"
        @click="es.paletteAddColor()"
      >
        <div class="w-4 h-4 i-con-plus"/>
      </div>
      <!--Palette function control-->
      <template v-if="es.isEditor">
        <div
          class="btn hover:border-gray-200" :class="{'border-blue': es.options.paletteFunc === 'adjust'}"
          @click="preSelect('adjust')">
          <div class="w-4 h-4 i-con-adjust"/>
        </div>
        <div
          class="btn hover:border-gray-200" :class="{'border-blue': es.options.paletteFunc === 'combine'}"
          @click="preSelect('combine')">
          <div class="w-4 h-4 i-con-combine"/>
        </div>
      </template>
      <div
        v-if="es.isEditor && es.options.paletteFunc"
        class="btn hover:border-gray-2"
        @click="preSave"
      >
        <div class="w-4 h-4 i-con-ok"/>
        <span>Save</span>
      </div>
    </div>
  </div>
</template>
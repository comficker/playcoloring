import {defineStore} from 'pinia'
import {Options, SaveForm, SharedPage, Step} from "~/interface";
import pkg from "lodash";
import {convertSteps} from "~/helper/canvas";
import {useUserStore} from "~/stores/user";
import {rgbToHex, isSameColor} from "~/helper/color";

const {debounce, cloneDeep, isEqual} = pkg
const DEFAULT_COLORS = [
  "#FFF2CC",
  "#FFD966",
  "#F4B183",
  "#DFA67B",
  "#245953",
]
const DEFAULT_WORKSPACE: SharedPage = {
  id: 0,
  name: '',
  id_string: '',
  desc: '',
  width: 16,
  height: 16,
  colors: cloneDeep(DEFAULT_COLORS),
  map_numbers: {},
  steps: [{
    type: 'init_colors',
    value: cloneDeep(DEFAULT_COLORS)
  }],
  db_status: 0,
  is_template: true,
  meta: undefined,
  user: null,
  taxonomies: [],

  tags: [],
  results: {},
  status: 'draft'
}

const DEFAULT_OPTION: Options = {
  color: 0,
  zoom: 1.5,
  pointer: '',
  isMoving: false,
  isPainting: false,
  paletteFunc: '',
  boardFunc: ''
}

export const useEditor = defineStore('editor', () => {
  const {$touch} = useNuxtApp()
  const userStore = useUserStore()
  const isEditor = ref(false)

  const itv = ref<NodeJS.Timer | null>(null)
  const workspace: SharedPage = reactive<SharedPage>(DEFAULT_WORKSPACE)
  const options = reactive<Options>(DEFAULT_OPTION)
  const modalShowing = ref<string>('')
  const modalParams = ref<any>(null)
  const fetchingPercent = ref(101)
  const drawSignal = ref(false)

  const isCompleted = computed(() =>
    fetchingPercent.value === 101 && workspace.results &&
    Object.keys(workspace.map_numbers).length && Object.keys(workspace.results).length &&
    isEqual(!isEditor.value && workspace.map_numbers, workspace.results)
  )

  const progress = computed(() => {
    const total = Object.keys(workspace.map_numbers).length
    let result = 0
    let detail: { [key: number]: { total: number, result: number, out: number } } = {}
    Object.keys(workspace.map_numbers).forEach((key: string) => {
      const colorIndex = workspace.map_numbers[key]
      if (!detail[colorIndex]) {
        detail[colorIndex] = {
          total: 0,
          result: 0,
          out: 0
        }
      }
      detail[colorIndex].total++
      if (workspace.results && workspace.results[key] === workspace.map_numbers[key]) {
        result++
        detail[colorIndex].result++
      }
    })
    Object.keys(detail).forEach((key) => {
      detail[Number.parseInt(key)].out = (detail[Number.parseInt(key)].result / detail[Number.parseInt(key)].total) * 100
    })
    return {
      result: result / total,
      detail: detail
    }
  })
  const loadFromFile = (pxColor: number[][][], ignoreColor: number[] | null) => {
    const maps_results: { [key: string]: number } = {}
    const colors: string[] = []
    let size = pxColor.length
    for (let y = 0; y < pxColor.length; y++) {
      for (let x = 0; x < pxColor[y].length; x++) {
        if (pxColor[y].length > size) size = pxColor[y].length;

        const key = `${x}_${y}`
        let hex = rgbToHex(pxColor[y][x][0], pxColor[y][x][1], pxColor[y][x][2])
        for (let i = 0; i < colors.length; i++) {
          if (isSameColor(colors[i].replace("#", ""), hex.replace("#", ""))) {
            hex = colors[i]
          }
        }
        if (hex !== '#ffffff' && !isSameColor('ffffff', hex.replace("#", ""))) {
          if (!colors.includes(hex)) {
            colors.push(hex)
          }
          maps_results[key] = colors.indexOf(hex)
        }
      }
    }
    clear()
    workspace.steps = [{
      type: 'init_colors',
      value: colors
    }, {
      type: 'init_results',
      value: maps_results
    }, {
      type: 'resize',
      value: size + 1
    }]
    steps2Result()
    draw()
  }

  const loadFromCloud = async (id: string) => {
    Object.assign(workspace, cloneDeep(DEFAULT_WORKSPACE))
    modalShowing.value = ''
    if (process.client) {
      if (fetchingPercent.value < 101) return
      fetchingPercent.value = 0
      let timeLeft = 50
      itv.value = setInterval(() => {
        fetchingPercent.value = fetchingPercent.value + timeLeft / 2
        timeLeft = timeLeft / 2
      }, 100)
    }
    const response: SharedPage = await $touch(`/coloring/shared-pages/${id}/`).catch(() => null)
    if (!response) {
      fetchingPercent.value = 101
      if (isEditor.value) {
        clear(true)
      } else {
        await loadFromCloud('random')
      }
      return
    }
    Object.assign(workspace, response)
    workspace.tags = workspace.taxonomies.map(x => x.name)
    if (!isEditor.value && response.is_template) {
      workspace.name = ''
      workspace.desc = ''
      workspace.is_template = false
      workspace.template = workspace.template ? workspace.template : workspace.id
      workspace.id = 0
      workspace.id_string = ''
      workspace.steps = []
    }
    options.color = 0
    steps2Result()
    workspace.steps = [{
      type: 'init_colors',
      value: workspace.colors
    }, {
      type: 'init_results',
      value: workspace.results
    }]
    if (process.client) {
      if (itv.value) { // @ts-ignore
        clearInterval(itv.value)
      }
      fetchingPercent.value = 100
      setTimeout(() => {
        fetchingPercent.value = 101
        draw()
      }, 300)
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
  }

  const clear = (force: boolean = false) => {
    if (isEditor.value) {
      workspace.map_numbers = {}
      workspace.results = {}
      workspace.steps = [{
        type: 'init_results',
        value: {}
      }]
      if (force) {
        workspace.id = 0
        workspace.id_string = ''
        workspace.name = ''
        workspace.desc = ''
        workspace.tags = []
        workspace.colors = cloneDeep(DEFAULT_COLORS)
        workspace.steps = [{
          type: 'init_colors',
          value: cloneDeep(DEFAULT_COLORS)
        }]
      }
      draw()
    } else {
      workspace.steps = []
      steps2Result()
      draw()
      saveLate()
    }
  }

  const draw = () => {
    drawSignal.value = !drawSignal.value
  }

  const steps2Result = () => {
    const out = convertSteps(workspace)
    workspace.results = out.results as { [key: string]: number }
    workspace.colors = out.colors
    workspace.width = out.width
    workspace.height = out.height
  }

  const addStep = (step: Step) => {
    workspace.steps.push(step)
    steps2Result()
    draw()
    saveLate()
  }

  const saveLate = debounce(async () => {
    if (!!workspace.id && (!workspace.user || !userStore.isLogged || workspace.user.id !== userStore.logged.id)) return
    let uri = '/coloring/shared-pages/'
    let method: "POST" | "PUT" = 'POST'
    if (workspace.id_string) {
      method = 'PUT'
      uri = uri + workspace.id_string + '/'
    }
    if (workspace.is_template && workspace.results) {
      workspace.map_numbers = workspace.results
    }
    const response: SharedPage = await $touch(uri, {
      method: method,
      body: {
        ...workspace,
        user: undefined,
        taxonomies: undefined,
        id_string: workspace.new_id_string ? workspace.new_id_string: undefined
      }
    })
    Object.assign(workspace, response)
    workspace.tags = workspace.taxonomies.map(x => x.name)
    userStore.setEditorKey(isEditor.value ? 'editor' : 'current', response.id_string)
  }, 800)

  const paletteAddColor = () => {
    addStep({
      type: 'add_color',
      value: '#ffffff'
    })
  }

  const paletteSetColor = (c: number) => {
    options.color = c
  }

  const paletteSetFunc = (f: string) => {
    if (options.paletteFunc === f) {
      options.paletteFunc = ''
    } else {
      options.paletteFunc = f
    }
  }

  const boardSetFunc = (f: string) => {
    options.boardFunc = f
  }

  const handleZoom = (increase: boolean) => {
    if (increase) {
      options.zoom += 0.5
    } else {
      options.zoom -= 0.5
    }
    draw()
  }

  const handleTeleport = (direction: string, value: number) => {
    addStep({
      type: 'teleport',
      value: `${direction}_${value}`
    })
  }

  const toggleModal = (m: string, params: any = null) => {
    if (modalShowing.value == m) {
      modalShowing.value = ''
    } else {
      modalShowing.value = m
    }
    modalParams.value = params
  }

  const updateWorkspace = (form: SaveForm) => {
    Object.assign(workspace, form)
    saveLate()
  }

  const preCheckStep = (step: Step): boolean => {
    const results: { [key: string]: number } = {}
    switch (step.type) {
      case 'fill': {
        const {key, color} = step.value
        results[key] = color
        break
      }
      case 'bucket': {
        const {key, color} = step.value
        if (!workspace.results) {
          workspace.results = {}
        }
        const correctColor = isEditor.value ? workspace.results[key] : workspace.map_numbers[key]
        const keys = Object.keys(isEditor.value ? workspace.results : workspace.map_numbers)
        Object.values(isEditor.value ? workspace.results : workspace.map_numbers).forEach((value: number, index: number) => {
          if (correctColor === value) {
            results[keys[index]] = color
          }
        })
        break
      }
      case 'mirror': {
        const {key, color} = step.value
        const arr = key.split("_")
        const x = Number.parseInt(arr[0]), y = Number.parseInt(arr[1])
        const nx = workspace.width - 1 - x
        results[key] = color
        results[`${nx}_${y}`] = color
        break
      }
    }
    const keys = Object.keys(results)
    for (let i = 0; i < keys.length; i++) {
      if (!workspace.results ||
        !workspace.results.hasOwnProperty(keys[i]) ||
        workspace.results[keys[i]] !== results[keys[i]]
      ) {
        return true
      }
    }
    return false
  }

  const load = async (key: string = 'random') => {
    if (userStore.isLogged && key === 'random') {
      if (!isEditor.value && userStore.logged?.meta?.coloring?.current) {
        key = userStore.logged.meta.coloring.current
      } else if (isEditor.value && userStore.logged?.meta?.coloring?.editor) {
        key = userStore.logged.meta.coloring.editor
      } else if (isEditor.value) {
        key = ''
      }
    }
    if (key.length) {
      await loadFromCloud(key)
    } else {
      clear()
    }
  }

  const setIsEditor = (v: boolean) => {
    isEditor.value = v
  }

  return {
    workspace,
    options,
    isEditor,
    isCompleted,
    progress,
    modalShowing,
    modalParams,
    fetchingPercent,
    drawSignal,
    loadFromFile,
    loadFromCloud,
    addStep,
    saveLate,
    paletteAddColor,
    paletteSetColor,
    paletteSetFunc,
    boardSetFunc,
    clear,
    handleZoom,
    handleTeleport,
    toggleModal,
    updateWorkspace,
    preCheckStep,
    load,
    setIsEditor
  }
})

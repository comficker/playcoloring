import {defineStore} from 'pinia'
import {Options, SaveForm, SharedPage, Step} from "~/interface";
import pkg from "lodash";
import {convertSteps} from "~/helper/canvas";
import {useUserStore} from "~/stores/user";
import {useRoute} from "#app";

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
  const route = useRoute()
  const isEditor = ref(route.name == 'editor')

  const workspace: SharedPage = reactive<SharedPage>(DEFAULT_WORKSPACE)
  const options = reactive<Options>(DEFAULT_OPTION)
  const modalShowing = ref<string>('')
  const fetchingPercent = ref(101)
  const drawSignal = ref(false)

  const isCompleted = computed(() =>
    Object.keys(workspace.map_numbers).length &&
    isEqual(!isEditor.value && workspace.map_numbers, workspace.results)
  )

  const progress = computed(() => {
    const total = Object.keys(workspace.map_numbers).length
    let result = 0
    let detail: {[key: number]: { total: number, result: number, out: number }} = {}
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
  const loadFromFile = (fileElm: HTMLInputElement) => {

  }

  const loadFromCloud = async (id: string) => {
    Object.assign(workspace, cloneDeep(DEFAULT_WORKSPACE))
    modalShowing.value = ''
    if (fetchingPercent.value < 101) return
    fetchingPercent.value = 0
    let timeLeft = 50
    const itv = setInterval(() => {
      fetchingPercent.value = fetchingPercent.value + timeLeft / 2
      timeLeft = timeLeft / 2
    }, 100)
    const response: SharedPage = await $touch(`/coloring/shared-pages/${id}/`)
    if (!response) return
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
    clearInterval(itv)
    fetchingPercent.value = 100
    setTimeout(() => {
      fetchingPercent.value = 101
      draw()
    }, 300)
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  const clear = () => {
    if (isEditor.value) {
      workspace.map_numbers = {}
      workspace.colors = cloneDeep(DEFAULT_COLORS)
      workspace.steps = [{
        type: 'init_colors',
        value: cloneDeep(DEFAULT_COLORS)
      }]
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
        taxonomies: undefined
      }
    })
    Object.assign(workspace, response)
    workspace.tags = workspace.taxonomies.map(x => x.name)
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

  const toggleModal = (m: string) => {
    if (modalShowing.value == m) {
      modalShowing.value = ''
    } else {
      modalShowing.value = m
    }
  }

  const updateWorkspace = (form: SaveForm) => {
    Object.assign(workspace, form)
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
        const correctColor = workspace.map_numbers[key]
        const keys = Object.keys(workspace.map_numbers)
        Object.values(workspace.map_numbers).forEach((value: number, index: number) => {
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

  const load = () => {
    let key = 'random'
    if (route.query.id) {
      key = route.query.id.toString()
    } else if (userStore.isLogged) {
      if (!isEditor.value && userStore.logged?.meta?.coloring?.current) {
        key = userStore.logged.meta.coloring.current
      } else if (isEditor.value && userStore.logged?.meta?.coloring?.editor) {
        key = userStore.logged.meta.coloring.editor
      }
    }
    loadFromCloud(key).then()
  }

  watch(() => route.path, () => {
    if (route.name && ['editor', 'index'].includes(route.name.toString())) {
      isEditor.value = route.name == 'editor'
      load()
    }
  })

  onMounted(() => {
    if (route.name && ['editor', 'index'].includes(route.name.toString())) {
      isEditor.value = route.name == 'editor'
      load()
    }
  })

  return {
    workspace,
    options,
    isEditor,
    isCompleted,
    progress,
    modalShowing,
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
    preCheckStep
  }
})

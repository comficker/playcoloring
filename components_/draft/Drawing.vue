<template>
  <div class="flex flex-col md:flex-row gap-2 md:-mx-11">
    <div class="flex flex-col gap-2">
      <div class="flex md:flex-col gap-2">
        <div
            v-for="m in modes" :key="m"
            class="cursor-pointer border-2 p-1"
            :class="{'border-[#776e65]': m === options.mode}"
            @click="options.mode = m"
        >
          <div class="w-6 h-6" :class="`i-con-${m.toLowerCase()}`"/>
        </div>
      </div>
    </div>
    <div class="flex-1">
      <div class="pt-full w-full relative">
        <div class="absolute inset-0 bg-white p-4 rounded" ref="editor">
          <div class="bg-white w-full h-full rounded overflow-hidden">
            <canvas class="w-full h-full" id="editor"/>
          </div>
        </div>
      </div>
    </div>
    <div class="flex md:flex-col gap-2 flex-wrap">
      <div
          v-for="c in colors" :key="c"
          class="cursor-pointer border-2 p-1"
          :class="{'border-[#776e65]': c === options.color}"
          @click="options.color = c"
      >
        <div class="w-6 h-6" :style="{backgroundColor: c}"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Drawing",
  data() {
    return {
      canvas: null,
      colors: [
        "#FFF2CC",
        "#FFD966",
        "#F4B183",
        "#DFA67B",
        "#245953",
        "#408E91",
        "#E49393",
        "#D8D8D8",
        "#FFF4E0",
        "#FFBF9B",
        "#B46060",
      ],
      modes: ["Pencil", "Circle", "Spray", "Eraser",],
      sizes: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      options: {
        mode: 'Pencil',
        size: 10,
        color: '#005E7A'
      },
      image: "http://127.0.0.1:8000/files/media/coloring-adult-numerous-fish.jpg"
    }
  },
  methods: {
    init(loadImage = false) {
      const init = () => {
        this.canvas.setHeight(this.$refs.editor.clientHeight);
        this.canvas.setWidth(this.$refs.editor.clientWidth);
        this.canvas.freeDrawingBrush = new fabric[this.options.mode + 'Brush'](this.canvas);
        if (this.canvas.freeDrawingBrush) {
          const brush = this.canvas.freeDrawingBrush;
          brush.color = this.options.color;
          brush.width = parseInt(this.options.size, 10) || 1;
        }
      }
      if (loadImage) {
        fabric.Image.fromURL(this.image, (myImg) => {
          const dimensions = myImg.width > myImg.height ? myImg.width : myImg.height
          this.canvas.zoomToPoint(
              {x: 0, y: 0},
              this.$refs.editor.clientHeight * 1.5 / dimensions
          );
          myImg.set('erasable', false);
          const img1 = myImg.set({});
          this.canvas.add(img1);
          init();
        });
      } else {
        init();
      }

    },
    clear() {
      this.canvas.clear()
    }
  },
  watch: {
    "options.mode"() {
      this.init()
    },
    "options.size"() {
      this.canvas.freeDrawingBrush.width = parseInt(this.options.size, 10) || 1;
    },
    "options.color"() {
      const brush = this.canvas.freeDrawingBrush;
      brush.color = this.options.color;
      if (brush.getPatternSrc) {
        brush.source = brush.getPatternSrc.call(brush);
      }
    }
  },
  mounted() {
    if (!window.fabric) return;
    const canvas = new fabric.Canvas('editor', {
      isDrawingMode: true
    });
    canvas.on('mouse:wheel', function (opt) {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.zoomToPoint({x: opt.e.offsetX, y: opt.e.offsetY}, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    })
    this.canvas = canvas
    this.init(true);
  }
}
</script>

import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { animatedUno } from 'animated-unocss'

export default defineConfig({
  shortcuts: [
    ['btn', 'cursor-pointer flex gap-2 items-center p-2 md:p-2.5 rounded-[2px] leading-4 border-box duration-200 border border-transparent'],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      collections: {
        'con': FileSystemIconLoader(
          './assets/icons',
          svg => svg,
        ),
      },
    }),
    animatedUno(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    fontSize: {
      '2xs': '.5rem',
    },
    dropShadow: {
      't': '-1px -3px 3px 0px rgba(0,0,0,0.75)',
    }
  },
  safelist: [
    'i-con-facebook',
    'i-con-twitter',
    'i-con-pinterest',
    'i-con-telegram',
    'i-con-discord',
    'i-con-template',
    'i-con-picture',
    'i-con-shared',
    'i-con-color',
    'i-con-hash'
  ],
})

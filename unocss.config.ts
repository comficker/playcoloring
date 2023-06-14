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
    ['btn', 'px-3 py-1.5 cursor-pointer inline-flex items-center gap-2 rounded-[2px]'],
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
    colors: {
      black: '#171717',
      grey: {
        0: '#C1C1D4',
        normal: '#C1C1D4',
        light: '#F2F2FA',
      },
      purple: {
        0: '#3E3091',
        digital: '#4F1CFF',
        light: '#B49EFF',
      },
      green: {
        0: '#4DCB92',
      },
    },
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
    'i-con-discord'
  ],
})

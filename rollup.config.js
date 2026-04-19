import terser from '@rollup/plugin-terser'

function minifyTemplateLiterals() {
  return {
    name: 'minify-template-literals',
    transform(code) {
      const result = code.replace(/`([\s\S]*?)`/g, (match, content) => {
        const parts = content.split(/(\$\{[^}]*\})/)
        const minified = parts
          .map((part, i) => {
            if (i % 2 !== 0) return part
            return part
              .replace(/\n[ \t]*/g, '')
              .replace(/[ ]{2,}/g, ' ')
              .replace(/>[ ]+</g, '><')
          })
          .join('')
        return '`' + minified + '`'
      })
      return { code: result, map: null }
    },
  }
}

export default {
  input: './wc-location-field.js',
  output: {
    file: 'dist/wc-location-field.min.js',
    format: 'iife',
    sourcemap: 'inline',
  },
  plugins: [
    minifyTemplateLiterals(),
    terser(),
  ],
}

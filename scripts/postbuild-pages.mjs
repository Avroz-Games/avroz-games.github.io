import { copyFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const dist = resolve('dist')
copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
writeFileSync(resolve(dist, '.nojekyll'), '')
console.log('GitHub Pages: 404.html e .nojekyll criados')

import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const prototype = fileURLToPath(new URL('../prototypes/provider-reorder.html', import.meta.url))
const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open'
const args = process.platform === 'win32' ? ['/c', 'start', '', prototype] : [prototype]

execFile(command, args, error => {
  if (error !== null) {
    console.error('Unable to open provider-reorder.html:', error.message)
    process.exitCode = 1
  }
})

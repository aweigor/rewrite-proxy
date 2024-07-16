#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'

import chalk from 'chalk'
import { PackageJson } from 'type-fest'

import { fileURLToPath } from 'node:url'
import { createApp } from './server.js'

function help() {
  console.log(`Usage: json-server [options] <file>

  Options:
    -p, --port <port>  Host Port (default: 3001)
    -t, --target <url> Proxy target (default: http://127.0.0.1:3000)
    --help             Show this message
    --version          Show version number
  `)
}

// Parse args
function args(): {
  file: string
  port: number
  target: string
} {
  try {
    const { values, positionals } = parseArgs({
      options: {
        port: {
          type: 'string',
          short: 'p',
          default: process.env['PORT'] ?? '3000',
        },
        target: {
          type: 'string',
          short: 't',
          default: process.env['TARGET'] ?? 'http://127.0.0.1:3000',
        },
        help: {
          type: 'boolean',
        },
        version: {
          type: 'boolean',
        },
      },
      allowPositionals: true,
    })

    // --version
    if (values.version) {
      const pkg = JSON.parse(
        readFileSync(
          fileURLToPath(new URL('../package.json', import.meta.url)),
          'utf-8',
        ),
      ) as PackageJson
      console.log(pkg.version)
      process.exit()
    }

    if (values.help || positionals.length === 0) {
      help()
      process.exit()
    }

    // App args and options
    return {
      file: positionals[0] ?? '',
      port: parseInt(values.port as string),
      target: values.target as string,
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
      console.log(chalk.red((e as NodeJS.ErrnoException).message.split('.')[0]))
      help()
      process.exit(1)
    } else {
      throw e
    }
  }
}

const { file, port, target } = args()

if (!existsSync(file)) {
  console.log(chalk.red(`File ${file} not found`))
  process.exit(1)
}

// Handle empty string JSON file
if (readFileSync(file, 'utf-8').trim() === '') {
  writeFileSync(file, '{}')
}

// todo: routes
const app = createApp({ target });

app.listen(port)
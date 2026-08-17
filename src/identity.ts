import { createRequire } from 'node:module'
import { attributionHeaders } from '@deepseek-ai/dsh-llm'

const { name: PACKAGE_NAME, version: PACKAGE_VERSION } = createRequire(import.meta.url)('../package.json') as {
  name: string
  version: string
}

/** Chat API origin used by the Cursor CLI session entry. */
export const CURSOR_API_URL = 'https://api2.cursor.sh'
/** Pinned CLI version the session entry currently accepts. Bump in changelog when it breaks. */
export const CURSOR_CLIENT_VERSION = 'cli-2026.01.09-231024f'
/** Plugin identity sent beside the required CLI compatibility headers. */
export const CURSOR_PLUGIN_IDENTITY_HEADER = `${PACKAGE_NAME}/${PACKAGE_VERSION}`

export function cursorRequestHeaders(accessToken: string): Record<string, string> {
  return {
    ...attributionHeaders(),
    authorization: `Bearer ${accessToken}`,
    'x-ghost-mode': 'true',
    'x-cursor-client-version': CURSOR_CLIENT_VERSION,
    'x-cursor-client-type': 'cli',
    'x-dsh-plugin': CURSOR_PLUGIN_IDENTITY_HEADER,
    'x-request-id': crypto.randomUUID(),
  }
}

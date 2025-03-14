import type { LinkSet } from '@/client/utils'
import * as utils from '@/client/utils'
import { describe, expect, it } from 'vitest'

interface TestCase {
  source: string
  expected: LinkSet
}

const data: TestCase[] = [
  {
    source: `<https://api.github.com/repositories/42/tags?per_page=1&page=2>; rel="next", <https://api.github.com/repositories/42/tags?per_page=1&page=51>; rel="last"`,
    expected: {
      next: 'https://api.github.com/repositories/42/tags?per_page=1&page=2',
      last: 'https://api.github.com/repositories/42/tags?per_page=1&page=51',
    },
  },
  {
    source: `<https://api.github.com/repositories/42/tags?per_page=2&page=1>; rel="prev", <https://api.github.com/repositories/42/tags?per_page=2&page=3>; rel="next", <https://api.github.com/repositories/42/tags?per_page=2&page=26>; rel="last", <https://api.github.com/repositories/42/tags?per_page=2&page=1>; rel="first"`,
    expected: {
      first: 'https://api.github.com/repositories/42/tags?per_page=2&page=1',
      prev: 'https://api.github.com/repositories/42/tags?per_page=2&page=1',
      next: 'https://api.github.com/repositories/42/tags?per_page=2&page=3',
      last: 'https://api.github.com/repositories/42/tags?per_page=2&page=26',
    },
  },
]

describe.each(data)('parse link header', ({ source, expected }: TestCase) => {
  it('$source', async () => {
    const result = utils.parseLinkHeader(source)

    expect(result).toMatchObject(expected)
  })
})

import * as parser from '@/parser/parser'
import fs from 'node:fs/promises'
import { describe, expect, it, test } from 'vitest'

import type { TableOfContents, Thing } from '@/parser/parser'

interface TestCase {
  source: string
  expected: Thing[]
}

const data: TestCase[] = [
  {
    source: 'Header 1-2',
    expected: [],
  },
  {
    source: 'Header 1-3',
    expected: [],
  },
  {
    source: 'Header 1-5-1-1',
    expected: [
      {
        name: '@martii/domini-sensim',
        desc: 'Parcam decessu scomata.',
        url: 'zzril://florem.hac/laesit/wisi/sunt/sunt/accessum/israel-paucis',
      },
      {
        name: 'nisi-fronte-nam',
        desc: 'Eros-tractu CUM.',
        url: 'minim://minaci.sem/zzril/wisi-platea-eos',
      },
      {
        name: 'odit-capiat-impiorum',
        desc: 'Ullam NAM ingeminabit.',
        url: 'totam://dantis.per/magister/ullo-pungit-potiorue',
      },
      {
        name: 'ullo-victum-modo',
        desc: 'Experientia nisl Esse.id gaudere orandum.',
        url: 'liber://lectus.mus/eum-ad/nisi-victor-quod',
      },
    ],
  },
  {
    source: 'Header 1-5-2',
    expected: [],
  },
  {
    source: 'Header 1-5-2-2',
    expected: [
      {
        name: 'ullo-tortor-massa',
        desc: 'Sint lucern neque netus adiurando.',
        url: 'optio://secuti.quo/pygmaeus/nisi-hostis-porro',
      },
    ],
  },
]

describe.each(data)('parser/parser $source', ({ source, expected }) => {
  it('extract things', async () => {
    const content = await fs.readFile(__dirname + '/__mocks__/dummy.md', 'utf-8')
    const result = parser.extractThings(content, source)

    expect(result).toEqual(expected)
  })
})

test('extract flat table of content', async () => {
  const content = await fs.readFile(__dirname + '/__mocks__/dummy.md', 'utf-8')
  const result = parser.extractTableOfContents(content)

  const expected: TableOfContents[] = [
    {
      name: 'Header 1',
      offset: 1,
      total: 0,
    },
    {
      name: 'Header 1-1',
      offset: 2,
      total: 0,
    },
    {
      name: 'Header 1-2',
      offset: 2,
      total: 0,
    },
    {
      name: 'Header 1-3',
      offset: 2,
      total: 0,
    },
    {
      name: 'Header 1-4',
      offset: 2,
      total: 3,
    },
    {
      name: 'Header 1-4-1',
      offset: 3,
      total: 0,
    },
    {
      name: 'Header 1-4-1-1',
      offset: 4,
      total: 2,
    },
    {
      name: 'Header 1-4-1-2',
      offset: 4,
      total: 3,
    },
    {
      name: 'Header 1-4-1-3',
      offset: 4,
      total: 1,
    },
    {
      name: 'Header 1-4-2',
      offset: 3,
      total: 1,
    },
    {
      name: 'Header 1-4-2-1',
      offset: 4,
      total: 1,
    },
    {
      name: 'Header 1-4-2-2',
      offset: 4,
      total: 0,
    },
    {
      name: 'Header 1-5',
      offset: 2,
      total: 0,
    },
    {
      name: 'Header 1-5-1',
      offset: 3,
      total: 0,
    },
    {
      name: 'Header 1-5-1-1',
      offset: 4,
      total: 4,
    },
    {
      name: 'Header 1-5-1-2',
      offset: 4,
      total: 2,
    },
    {
      name: 'Header 1-5-2',
      offset: 3,
      total: 0,
    },
    {
      name: 'Header 1-5-2-1',
      offset: 4,
      total: 3,
    },
    {
      name: 'Header 1-5-2-2',
      offset: 4,
      total: 1,
    },
    {
      name: 'Header 1-5-3',
      offset: 3,
      total: 0,
    },
    {
      name: 'Header 1-5-3-1',
      offset: 4,
      total: 2,
    },
  ]

  expect(result).toEqual(expected)
})

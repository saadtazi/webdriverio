import path from 'node:path'
import { expect, describe, it, beforeAll, afterEach, vi } from 'vitest'

// @ts-ignore mocked (original defined in webdriver package)
import got from 'got'
import { remote } from '../../../src/index.js'

vi.mock('got')
vi.mock('@wdio/logger', () => import(path.join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('isClickable test', () => {
    let browser: WebdriverIO.Browser
    let elem: any

    beforeAll(async () => {
        browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar'
            }
        })
        elem = await browser.$('#foo')
        vi.mocked(got).mockClear()
    })

    it('should allow to check if element is displayed', async () => {
        await elem.isClickable()
        expect(vi.mocked(got).mock.calls[0][0]!.pathname)
            .toBe('/session/foobar-123/execute/sync')
        expect(vi.mocked(got).mock.calls[0][1]!.json.args[0]).toEqual({
            'element-6066-11e4-a52e-4f735466cecf': 'some-elem-123',
            ELEMENT: 'some-elem-123'
        })
    })

    it('should return false if element can\'t be found after refetching it', async () => {
        const elem = await browser.$('#nonexisting')
        expect(await elem.isClickable()).toBe(false)
        expect(got).toBeCalledTimes(2)
    })

    it('should throw if in mobile native context', async () => {
        const scope = {
            isDisplayed: vi.fn().mockResolvedValue(true),
            execute: vi.fn(),
            options: {},
            isMobile: true,
            getContext: vi.fn().mockResolvedValue('NATIVE_APP')
        }
        await expect(() => elem.isClickable.call(scope)).rejects.toThrow()
    })

    afterEach(() => {
        vi.mocked(got).mockClear()
    })
})

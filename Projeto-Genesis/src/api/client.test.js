import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { apiCall } from './client'

describe('API Client', () => {
  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock

    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }
  })

  it('sends Authorization header with token', async () => {
    global.localStorage.getItem.mockReturnValue('test-token-123')
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'success' }),
    })

    await apiCall('/test/', { method: 'GET' })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/test/',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Token test-token-123',
        }),
      })
    )
  })

  it('does not send Authorization header without token', async () => {
    global.localStorage.getItem.mockReturnValue(null)
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'success' }),
    })

    await apiCall('/test/', { method: 'GET' })

    const callArgs = fetchMock.mock.calls[0][1]
    expect(callArgs.headers.Authorization).toBeUndefined()
  })

  it('throws error on non-OK response', async () => {
    global.localStorage.getItem.mockReturnValue(null)
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Not Found' }),
    })

    await expect(apiCall('/test/')).rejects.toThrow('Not Found')
  })

  it('handles error response without detail field', async () => {
    global.localStorage.getItem.mockReturnValue(null)
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ erro: 'Bad Request' }),
    })

    await expect(apiCall('/test/')).rejects.toThrow('Bad Request')
  })

  it('handles JSON parse error gracefully', async () => {
    global.localStorage.getItem.mockReturnValue(null)
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON')
      },
    })

    await expect(apiCall('/test/')).rejects.toThrow('Erro desconhecido')
  })

  it('returns parsed JSON on success', async () => {
    global.localStorage.getItem.mockReturnValue(null)
    const mockData = { id: 1, name: 'Test' }
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    const result = await apiCall('/test/')

    expect(result).toEqual(mockData)
  })

  it('passes custom headers', async () => {
    global.localStorage.getItem.mockReturnValue(null)
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    await apiCall('/test/', {
      headers: { 'X-Custom': 'value' },
    })

    const callArgs = fetchMock.mock.calls[0][1]
    expect(callArgs.headers['X-Custom']).toBe('value')
  })

  it('preserves Content-Type header', async () => {
    global.localStorage.getItem.mockReturnValue(null)
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    await apiCall('/test/', { method: 'POST' })

    const callArgs = fetchMock.mock.calls[0][1]
    expect(callArgs.headers['Content-Type']).toBe('application/json')
  })
})

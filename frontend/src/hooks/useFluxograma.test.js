import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFluxograma } from './useFluxograma'
import * as fluxogramasApi from '../api/fluxogramas'

vi.mock('../api/fluxogramas')

describe('useFluxograma', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns initial loading state', () => {
    const { result } = renderHook(() => useFluxograma(101))

    expect(result.current.loading).toBe(true)
    expect(result.current.fluxo).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('does not fetch when id is not provided', async () => {
    renderHook(() => useFluxograma(null))

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(fluxogramasApi.getFluxograma).not.toHaveBeenCalled()
  })

  it('fetches fluxograma by id', async () => {
    const mockData = { id: 101, titulo: 'Protocol A', etapas: [] }
    fluxogramasApi.getFluxograma.mockResolvedValue(mockData)

    const { result } = renderHook(() => useFluxograma(101))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(fluxogramasApi.getFluxograma).toHaveBeenCalledWith(101)
    expect(result.current.fluxo).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('sets error on failed fetch', async () => {
    const error = new Error('Not Found')
    fluxogramasApi.getFluxograma.mockRejectedValue(error)

    const { result } = renderHook(() => useFluxograma(999))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.fluxo).toBeNull()
    expect(result.current.error).toBe('Not Found')
  })

  it('sets error on network error', async () => {
    const networkError = new Error('Network failed')
    fluxogramasApi.getFluxograma.mockRejectedValue(networkError)

    const { result } = renderHook(() => useFluxograma(101))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.fluxo).toBeNull()
    expect(result.current.error).toBe('Network failed')
  })

  it('clears error on successful fetch after error', async () => {
    const mockData = { id: 101, titulo: 'Protocol A' }
    fluxogramasApi.getFluxograma.mockRejectedValueOnce(new Error('First error'))

    const { result, rerender } = renderHook(({ id }) => useFluxograma(id), {
      initialProps: { id: 101 },
    })

    await waitFor(() => {
      expect(result.current.error).toBe('First error')
    })

    fluxogramasApi.getFluxograma.mockResolvedValueOnce(mockData)

    rerender({ id: 102 })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.fluxo).toEqual(mockData)
  })

  it('refetches when id changes', async () => {
    const mockData1 = { id: 101, titulo: 'Protocol A' }
    const mockData2 = { id: 102, titulo: 'Protocol B' }

    fluxogramasApi.getFluxograma.mockResolvedValueOnce(mockData1)

    const { result, rerender } = renderHook(({ id }) => useFluxograma(id), {
      initialProps: { id: 101 },
    })

    await waitFor(() => {
      expect(result.current.fluxo).toEqual(mockData1)
    })

    fluxogramasApi.getFluxograma.mockResolvedValueOnce(mockData2)

    rerender({ id: 102 })

    await waitFor(() => {
      expect(result.current.fluxo).toEqual(mockData2)
    })

    expect(fluxogramasApi.getFluxograma).toHaveBeenCalledTimes(2)
    expect(fluxogramasApi.getFluxograma).toHaveBeenNthCalledWith(1, 101)
    expect(fluxogramasApi.getFluxograma).toHaveBeenNthCalledWith(2, 102)
  })

  it('handles api errors', async () => {
    const error = new Error('API Error')
    fluxogramasApi.getFluxograma.mockRejectedValue(error)

    const { result } = renderHook(() => useFluxograma(101))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('API Error')
    expect(result.current.fluxo).toBeNull()
  })

  it('sets loading to true on fetch start', async () => {
    const mockData = { id: 101, titulo: 'Protocol A' }
    let resolveGetFluxograma
    fluxogramasApi.getFluxograma.mockReturnValue(
      new Promise((resolve) => {
        resolveGetFluxograma = () => resolve(mockData)
      })
    )

    const { result } = renderHook(() => useFluxograma(101))

    expect(result.current.loading).toBe(true)

    resolveGetFluxograma()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('does not refetch when id is removed', async () => {
    const mockData = { id: 101, titulo: 'Protocol A' }
    fluxogramasApi.getFluxograma.mockResolvedValue(mockData)

    const { result, rerender } = renderHook(({ id }) => useFluxograma(id), {
      initialProps: { id: 101 },
    })

    await waitFor(() => {
      expect(result.current.fluxo).toEqual(mockData)
    })

    const callsBefore = fluxogramasApi.getFluxograma.mock.calls.length

    rerender({ id: null })

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(fluxogramasApi.getFluxograma.mock.calls.length).toBe(callsBefore)
  })
})

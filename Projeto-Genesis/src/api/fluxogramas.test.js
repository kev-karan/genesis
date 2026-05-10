import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchFluxogramas, getFluxograma } from './fluxogramas'
import * as client from './client'

vi.mock('./client')

describe('Fluxogramas API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchFluxogramas', () => {
    it('fetches all fluxogramas without search', async () => {
      const mockData = [
        { id: 1, titulo: 'Protocol A', descricao: 'Description A' },
        { id: 2, titulo: 'Protocol B', descricao: 'Description B' },
      ]
      client.apiCall.mockResolvedValue(mockData)

      const result = await fetchFluxogramas()

      expect(client.apiCall).toHaveBeenCalledWith('/fluxogramas/')
      expect(result).toEqual(mockData)
    })

    it('fetches fluxogramas with search query', async () => {
      const mockData = [{ id: 1, titulo: 'Protocol A', descricao: 'Description A' }]
      client.apiCall.mockResolvedValue(mockData)

      const result = await fetchFluxogramas('Protocol')

      expect(client.apiCall).toHaveBeenCalledWith('/fluxogramas/?busca=Protocol')
      expect(result).toEqual(mockData)
    })

    it('encodes special characters in search query', async () => {
      client.apiCall.mockResolvedValue([])

      await fetchFluxogramas('test search & query')

      expect(client.apiCall).toHaveBeenCalledWith('/fluxogramas/?busca=test%20search%20%26%20query')
    })

    it('returns empty array when no matches', async () => {
      client.apiCall.mockResolvedValue([])

      const result = await fetchFluxogramas('nonexistent')

      expect(result).toEqual([])
    })

    it('handles API errors', async () => {
      const error = new Error('Network error')
      client.apiCall.mockRejectedValue(error)

      await expect(fetchFluxogramas()).rejects.toThrow('Network error')
    })
  })

  describe('getFluxograma', () => {
    it('fetches fluxograma by id', async () => {
      const mockData = { id: 1, titulo: 'Protocol A', descricao: 'Description A', etapas: [] }
      client.apiCall.mockResolvedValue(mockData)

      const result = await getFluxograma(1)

      expect(client.apiCall).toHaveBeenCalledWith('/fluxogramas/1/')
      expect(result).toEqual(mockData)
    })

    it('handles non-existent fluxograma', async () => {
      const error = new Error('Not Found')
      client.apiCall.mockRejectedValue(error)

      await expect(getFluxograma(999)).rejects.toThrow('Not Found')
    })

    it('passes numeric id as string in URL', async () => {
      client.apiCall.mockResolvedValue({})

      await getFluxograma(42)

      expect(client.apiCall).toHaveBeenCalledWith('/fluxogramas/42/')
    })
  })
})

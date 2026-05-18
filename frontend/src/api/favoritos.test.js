import { describe, it, expect, beforeEach, vi } from 'vitest'
import { listFavoritos, addFavorito, removeFavorito } from './favoritos'
import * as client from './client'

vi.mock('./client')

describe('Favoritos API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listFavoritos', () => {
    it('fetches user favorites', async () => {
      const mockData = [
        { id: 1, fluxograma_id: 101, titulo: 'Protocol A' },
        { id: 2, fluxograma_id: 102, titulo: 'Protocol B' },
      ]
      client.apiCall.mockResolvedValue(mockData)

      const result = await listFavoritos()

      expect(client.apiCall).toHaveBeenCalledWith('/favoritos/meus-favoritos/')
      expect(result).toEqual(mockData)
    })

    it('returns empty array when no favorites', async () => {
      client.apiCall.mockResolvedValue([])

      const result = await listFavoritos()

      expect(result).toEqual([])
    })

    it('handles API errors', async () => {
      const error = new Error('Unauthorized')
      client.apiCall.mockRejectedValue(error)

      await expect(listFavoritos()).rejects.toThrow('Unauthorized')
    })
  })

  describe('addFavorito', () => {
    it('adds fluxograma to favorites', async () => {
      const mockData = { id: 1, fluxograma_id: 101, titulo: 'Protocol A' }
      client.apiCall.mockResolvedValue(mockData)

      const result = await addFavorito(101)

      expect(client.apiCall).toHaveBeenCalledWith('/favoritos/favoritar/101/', {
        method: 'POST',
      })
      expect(result).toEqual(mockData)
    })

    it('sends numeric fluxograma id', async () => {
      client.apiCall.mockResolvedValue({})

      await addFavorito(42)

      expect(client.apiCall).toHaveBeenCalledWith('/favoritos/favoritar/42/', {
        method: 'POST',
      })
    })

    it('handles duplicate favorite error', async () => {
      const error = new Error('Already favorited')
      client.apiCall.mockRejectedValue(error)

      await expect(addFavorito(101)).rejects.toThrow('Already favorited')
    })

    it('handles not found error', async () => {
      const error = new Error('Fluxograma not found')
      client.apiCall.mockRejectedValue(error)

      await expect(addFavorito(999)).rejects.toThrow('Fluxograma not found')
    })

    it('returns favorite object with id', async () => {
      const mockData = { id: 5, fluxograma_id: 101 }
      client.apiCall.mockResolvedValue(mockData)

      const result = await addFavorito(101)

      expect(result.id).toBe(5)
      expect(result.fluxograma_id).toBe(101)
    })
  })

  describe('removeFavorito', () => {
    it('removes fluxograma from favorites', async () => {
      client.apiCall.mockResolvedValue(null)

      const result = await removeFavorito(101)

      expect(client.apiCall).toHaveBeenCalledWith('/favoritos/remover/101/', {
        method: 'DELETE',
      })
      expect(result).toBeNull()
    })

    it('sends numeric fluxograma id', async () => {
      client.apiCall.mockResolvedValue(null)

      await removeFavorito(42)

      expect(client.apiCall).toHaveBeenCalledWith('/favoritos/remover/42/', {
        method: 'DELETE',
      })
    })

    it('handles not found error', async () => {
      const error = new Error('Favorite not found')
      client.apiCall.mockRejectedValue(error)

      await expect(removeFavorito(999)).rejects.toThrow('Favorite not found')
    })

    it('succeeds even if favorite does not exist', async () => {
      // Some APIs return 204 No Content regardless
      client.apiCall.mockResolvedValue(null)

      const result = await removeFavorito(101)

      expect(result).toBeNull()
    })

    it('handles server errors', async () => {
      const error = new Error('Server error')
      client.apiCall.mockRejectedValue(error)

      await expect(removeFavorito(101)).rejects.toThrow('Server error')
    })
  })
})

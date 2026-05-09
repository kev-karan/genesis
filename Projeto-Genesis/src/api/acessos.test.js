import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registrarAcesso, listAcessosRecentes } from './acessos'
import * as client from './client'

vi.mock('./client')

describe('Acessos API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registrarAcesso', () => {
    it('registers fluxograma access', async () => {
      const mockData = { id: 1, fluxograma_id: 101, timestamp: '2026-05-09T15:00:00Z' }
      client.apiCall.mockResolvedValue(mockData)

      const result = await registrarAcesso(101)

      expect(client.apiCall).toHaveBeenCalledWith('/acessos/registrar/101/', {
        method: 'POST',
      })
      expect(result).toEqual(mockData)
    })

    it('sends numeric fluxograma id', async () => {
      client.apiCall.mockResolvedValue({})

      await registrarAcesso(42)

      expect(client.apiCall).toHaveBeenCalledWith('/acessos/registrar/42/', {
        method: 'POST',
      })
    })

    it('returns access record with timestamp', async () => {
      const mockData = {
        id: 1,
        fluxograma_id: 101,
        timestamp: '2026-05-09T15:00:00Z',
        user_id: 1,
      }
      client.apiCall.mockResolvedValue(mockData)

      const result = await registrarAcesso(101)

      expect(result.id).toBe(1)
      expect(result.fluxograma_id).toBe(101)
      expect(result.timestamp).toBeDefined()
    })

    it('handles fluxograma not found error', async () => {
      const error = new Error('Fluxograma not found')
      client.apiCall.mockRejectedValue(error)

      await expect(registrarAcesso(999)).rejects.toThrow('Fluxograma not found')
    })

    it('handles authentication error', async () => {
      const error = new Error('Unauthorized')
      client.apiCall.mockRejectedValue(error)

      await expect(registrarAcesso(101)).rejects.toThrow('Unauthorized')
    })

    it('handles server errors', async () => {
      const error = new Error('Server error')
      client.apiCall.mockRejectedValue(error)

      await expect(registrarAcesso(101)).rejects.toThrow('Server error')
    })
  })

  describe('listAcessosRecentes', () => {
    it('fetches recent accesses', async () => {
      const mockData = [
        { id: 1, fluxograma_id: 101, timestamp: '2026-05-09T15:00:00Z' },
        { id: 2, fluxograma_id: 102, timestamp: '2026-05-09T14:30:00Z' },
        { id: 3, fluxograma_id: 103, timestamp: '2026-05-09T14:00:00Z' },
      ]
      client.apiCall.mockResolvedValue(mockData)

      const result = await listAcessosRecentes()

      expect(client.apiCall).toHaveBeenCalledWith('/acessos/recentes/')
      expect(result).toEqual(mockData)
    })

    it('returns empty array when no recent accesses', async () => {
      client.apiCall.mockResolvedValue([])

      const result = await listAcessosRecentes()

      expect(result).toEqual([])
    })

    it('returns accesses sorted by timestamp', async () => {
      const mockData = [
        { id: 1, fluxograma_id: 101, timestamp: '2026-05-09T15:00:00Z' },
        { id: 2, fluxograma_id: 102, timestamp: '2026-05-09T14:30:00Z' },
      ]
      client.apiCall.mockResolvedValue(mockData)

      const result = await listAcessosRecentes()

      expect(result[0].timestamp).toBe('2026-05-09T15:00:00Z')
      expect(result[1].timestamp).toBe('2026-05-09T14:30:00Z')
    })

    it('handles authentication error', async () => {
      const error = new Error('Unauthorized')
      client.apiCall.mockRejectedValue(error)

      await expect(listAcessosRecentes()).rejects.toThrow('Unauthorized')
    })

    it('handles server errors', async () => {
      const error = new Error('Server error')
      client.apiCall.mockRejectedValue(error)

      await expect(listAcessosRecentes()).rejects.toThrow('Server error')
    })
  })
})

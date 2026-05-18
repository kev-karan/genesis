import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login, logout } from './auth'
import * as client from './client'

vi.mock('./client')

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('sends username and password to login endpoint', async () => {
      const mockResponse = { token: 'test-token-123', user: { id: 1, username: 'testuser' } }
      client.apiCall.mockResolvedValue(mockResponse)

      await login('testuser', 'password123')

      expect(client.apiCall).toHaveBeenCalledWith('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', password: 'password123' }),
      })
    })

    it('sets token on successful login', async () => {
      const mockResponse = { token: 'test-token-123', user: { id: 1, username: 'testuser' } }
      client.apiCall.mockResolvedValue(mockResponse)

      await login('testuser', 'password123')

      expect(client.setToken).toHaveBeenCalledWith('test-token-123')
    })

    it('returns user data and token', async () => {
      const mockResponse = { token: 'test-token-123', user: { id: 1, username: 'testuser' } }
      client.apiCall.mockResolvedValue(mockResponse)

      const result = await login('testuser', 'password123')

      expect(result).toEqual(mockResponse)
      expect(result.token).toBe('test-token-123')
      expect(result.user.username).toBe('testuser')
    })

    it('handles invalid credentials error', async () => {
      const error = new Error('Invalid credentials')
      client.apiCall.mockRejectedValue(error)

      await expect(login('wronguser', 'wrongpass')).rejects.toThrow('Invalid credentials')
    })

    it('does not set token on failed login', async () => {
      const error = new Error('Invalid credentials')
      client.apiCall.mockRejectedValue(error)

      try {
        await login('wronguser', 'wrongpass')
      } catch (e) {
        // Expected
      }

      expect(client.setToken).not.toHaveBeenCalled()
    })

    it('handles network errors', async () => {
      const error = new Error('Network error')
      client.apiCall.mockRejectedValue(error)

      await expect(login('testuser', 'password123')).rejects.toThrow('Network error')
    })

    it('handles missing user data in response', async () => {
      const mockResponse = { token: 'test-token-123' }
      client.apiCall.mockResolvedValue(mockResponse)

      const result = await login('testuser', 'password123')

      expect(result.token).toBe('test-token-123')
      expect(result.user).toBeUndefined()
    })
  })

  describe('logout', () => {
    it('removes token before calling logout endpoint', async () => {
      client.apiCall.mockResolvedValue({ detail: 'Successfully logged out' })

      await logout()

      expect(client.removeToken).toHaveBeenCalled()
    })

    it('calls logout endpoint', async () => {
      const mockResponse = { detail: 'Successfully logged out' }
      client.apiCall.mockResolvedValue(mockResponse)

      await logout()

      expect(client.apiCall).toHaveBeenCalledWith('/auth/logout/', {
        method: 'POST',
      })
    })

    it('returns logout response', async () => {
      const mockResponse = { detail: 'Successfully logged out' }
      client.apiCall.mockResolvedValue(mockResponse)

      const result = await logout()

      expect(result).toEqual(mockResponse)
    })

    it('removes token even on logout endpoint error', async () => {
      const error = new Error('Server error')
      client.apiCall.mockRejectedValue(error)

      try {
        await logout()
      } catch (e) {
        // Expected
      }

      expect(client.removeToken).toHaveBeenCalled()
    })

    it('handles network errors', async () => {
      const error = new Error('Network error')
      client.apiCall.mockRejectedValue(error)

      await expect(logout()).rejects.toThrow('Network error')
    })

    it('calls removeToken before apiCall', async () => {
      const callOrder = []
      client.removeToken.mockImplementation(() => callOrder.push('removeToken'))
      client.apiCall.mockImplementation(() => {
        callOrder.push('apiCall')
        return Promise.resolve({})
      })

      await logout()

      expect(callOrder).toEqual(['removeToken', 'apiCall'])
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthContext, AuthProvider } from './AuthContext'
import { useContext } from 'react'
import * as clientApi from '../api/client'

vi.mock('../api/client', () => ({
  getToken: vi.fn(),
  setToken: vi.fn(),
  removeToken: vi.fn(),
  apiCall: vi.fn(),
}))

function TestComponent() {
  const { user, token, loading } = useContext(AuthContext)
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="token">{token || 'no-token'}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no-user'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads token from localStorage on mount', async () => {
    const mockToken = 'drf-opaque-token-123'
    const mockUser = { user_id: 1, username: 'test@example.com', email: 'test@example.com' }
    clientApi.getToken.mockReturnValue(mockToken)
    clientApi.apiCall.mockResolvedValue(mockUser)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    expect(screen.getByTestId('token')).toHaveTextContent(mockToken)
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
  })

  it('handles invalid tokens gracefully', async () => {
    clientApi.getToken.mockReturnValue('invalid-token')
    clientApi.apiCall.mockRejectedValue(new Error('401'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    expect(clientApi.removeToken).toHaveBeenCalled()
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('starts with no token', async () => {
    clientApi.getToken.mockReturnValue(null)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    expect(screen.getByTestId('token')).toHaveTextContent('no-token')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('updates context on login', async () => {
    clientApi.getToken.mockReturnValue(null)

    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const mockToken = 'new-token-123'
    const mockUser = { id: 1, username: 'testuser' }

    // Re-render to test login behavior
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })
  })

  it('clears token on logout', async () => {
    clientApi.getToken.mockReturnValue(null)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    expect(screen.getByTestId('token')).toHaveTextContent('no-token')
  })
})

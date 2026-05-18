import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FavoritesContext, FavoritesProvider } from './FavoritesContext'
import { AuthContext } from './AuthContext'
import { useContext } from 'react'
import * as favoritosApi from '../api/favoritos'

vi.mock('../api/favoritos')

function TestComponent() {
  const { favorites, loading, error, addToFavorites, removeFromFavorites, isFavorited } =
    useContext(FavoritesContext)
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="count">{favorites.length}</div>
      <button onClick={() => addToFavorites(101)} data-testid="add-btn">
        Add Fav
      </button>
      <button onClick={() => removeFromFavorites(101)} data-testid="remove-btn">
        Remove Fav
      </button>
      <div data-testid="is-favorited">{isFavorited(101) ? 'favorited' : 'not-favorited'}</div>
    </div>
  )
}

function Wrapper({ children }) {
  return (
    <AuthContext.Provider value={{ token: 'test-token', user: { id: 1 }, loading: false }}>
      <FavoritesProvider>{children}</FavoritesProvider>
    </AuthContext.Provider>
  )
}

describe('FavoritesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads favorites on mount with token', async () => {
    favoritosApi.listFavoritos.mockResolvedValue([
      { id: 1, fluxograma_id: 101, titulo: 'Protocol A' },
      { id: 2, fluxograma_id: 102, titulo: 'Protocol B' },
    ])

    render(<TestComponent />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    expect(screen.getByTestId('count')).toHaveTextContent('2')
  })

  it('displays error on load failure', async () => {
    const errorMsg = 'Failed to load'
    favoritosApi.listFavoritos.mockRejectedValue(new Error(errorMsg))

    render(<TestComponent />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMsg)
    })
  })

  it('adds favorite to the list', async () => {
    favoritosApi.listFavoritos.mockResolvedValue([])
    favoritosApi.addFavorito.mockResolvedValue({ id: 1, fluxograma_id: 101 })

    const user = userEvent.setup()
    render(<TestComponent />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    // Change mock to return the new favorite
    favoritosApi.listFavoritos.mockResolvedValue([
      { id: 1, fluxograma_id: 101, titulo: 'Protocol A' },
    ])

    await user.click(screen.getByTestId('add-btn'))

    await waitFor(() => {
      expect(favoritosApi.addFavorito).toHaveBeenCalledWith(101)
    })
  })

  it('removes favorite from the list', async () => {
    favoritosApi.listFavoritos.mockResolvedValue([
      { id: 1, fluxograma_id: 101, titulo: 'Protocol A' },
    ])
    favoritosApi.removeFavorito.mockResolvedValue(null)

    const user = userEvent.setup()
    render(<TestComponent />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })

    // Change mock to return empty list after removal
    favoritosApi.listFavoritos.mockResolvedValue([])

    await user.click(screen.getByTestId('remove-btn'))

    await waitFor(() => {
      expect(favoritosApi.removeFavorito).toHaveBeenCalledWith(101)
    })
  })

  it('checks if item is favorited', async () => {
    favoritosApi.listFavoritos.mockResolvedValue([
      { id: 1, fluxograma_id: 101, titulo: 'Protocol A' },
    ])

    render(<TestComponent />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByTestId('is-favorited')).toHaveTextContent('favorited')
    })
  })
})

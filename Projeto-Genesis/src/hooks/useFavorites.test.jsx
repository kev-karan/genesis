import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFavorites } from './useFavorites'
import { FavoritesProvider } from '../contexts/FavoritesContext'
import { AuthProvider } from '../contexts/AuthContext'

describe('useFavorites', () => {
  beforeEach(() => {
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }
  })

  it('returns context when inside FavoritesProvider', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </AuthProvider>
    )
    const { result } = renderHook(() => useFavorites(), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current).toHaveProperty('favorites')
    expect(result.current).toHaveProperty('loading')
    expect(result.current).toHaveProperty('error')
  })

  it('throws error when used outside FavoritesProvider', () => {
    expect(() => {
      renderHook(() => useFavorites())
    }).toThrow('useFavorites deve ser usado dentro de FavoritesProvider')
  })

  it('returns favorites context with favorites property', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </AuthProvider>
    )
    const { result } = renderHook(() => useFavorites(), { wrapper })

    expect(result.current).toHaveProperty('favorites')
    expect(Array.isArray(result.current.favorites)).toBe(true)
  })

  it('returns favorites context with loading property', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </AuthProvider>
    )
    const { result } = renderHook(() => useFavorites(), { wrapper })

    expect(result.current).toHaveProperty('loading')
    expect(typeof result.current.loading).toBe('boolean')
  })

  it('returns favorites context with error property', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </AuthProvider>
    )
    const { result } = renderHook(() => useFavorites(), { wrapper })

    expect(result.current).toHaveProperty('error')
  })

  it('returns context with addToFavorites function', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </AuthProvider>
    )
    const { result } = renderHook(() => useFavorites(), { wrapper })

    expect(result.current).toHaveProperty('addToFavorites')
    expect(typeof result.current.addToFavorites).toBe('function')
  })

  it('returns context with removeFromFavorites function', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </AuthProvider>
    )
    const { result } = renderHook(() => useFavorites(), { wrapper })

    expect(result.current).toHaveProperty('removeFromFavorites')
    expect(typeof result.current.removeFromFavorites).toBe('function')
  })

  it('returns context with isFavorited function', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </AuthProvider>
    )
    const { result } = renderHook(() => useFavorites(), { wrapper })

    expect(result.current).toHaveProperty('isFavorited')
    expect(typeof result.current.isFavorited).toBe('function')
  })

  it('error message is in Portuguese', () => {
    expect(() => {
      renderHook(() => useFavorites())
    }).toThrow('useFavorites deve ser usado dentro de FavoritesProvider')
  })
})

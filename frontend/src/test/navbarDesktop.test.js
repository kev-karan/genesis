import { describe, it, expect } from 'vitest'

function getActiveSection(tela) {
  if (['emergencia', 'dengue', 'sedacao'].includes(tela)) return 'emergencia'
  if (tela === 'calculadora') return 'calculadora'
  return 'home'
}

describe('getActiveSection', () => {
  it('returns home for home tela', () => {
    expect(getActiveSection('home')).toBe('home')
  })

  it('returns emergencia for hub', () => {
    expect(getActiveSection('emergencia')).toBe('emergencia')
  })

  it('returns emergencia for dengue protocol', () => {
    expect(getActiveSection('dengue')).toBe('emergencia')
  })

  it('returns emergencia for sedacao protocol', () => {
    expect(getActiveSection('sedacao')).toBe('emergencia')
  })

  it('returns calculadora', () => {
    expect(getActiveSection('calculadora')).toBe('calculadora')
  })

  it('falls back to home for unknown tela', () => {
    expect(getActiveSection('qualquercoisa')).toBe('home')
  })
})

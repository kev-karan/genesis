import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api'

export const handlers = [
  http.post(`${API_BASE}/auth/login/`, async ({ request }) => {
    const body = await request.json()
    if (body.username === 'testuser' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'test-token-12345',
        user: { id: 1, username: 'testuser' },
      })
    }
    return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 400 })
  }),

  http.post(`${API_BASE}/auth/logout/`, () => {
    return HttpResponse.json({ detail: 'Successfully logged out' })
  }),

  http.get(`${API_BASE}/favoritos/meus-favoritos/`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json({ detail: 'Authentication required' }, { status: 401 })
    }
    return HttpResponse.json({
      favoritos: [
        { id: 1, fluxograma_id: 101, titulo: 'Protocol A' },
        { id: 2, fluxograma_id: 102, titulo: 'Protocol B' },
      ],
    })
  }),

  http.post(`${API_BASE}/favoritos/favoritar/:id`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json({ detail: 'Authentication required' }, { status: 401 })
    }
    return HttpResponse.json(
      { id: 1, fluxograma_id: 101, titulo: 'Protocol A' },
      { status: 201 }
    )
  }),

  http.delete(`${API_BASE}/favoritos/remover/:id`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json({ detail: 'Authentication required' }, { status: 401 })
    }
    return HttpResponse.json(null, { status: 204 })
  }),
]

export const server = setupServer(...handlers)

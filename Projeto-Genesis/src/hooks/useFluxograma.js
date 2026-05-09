import { useState, useEffect } from 'react'

export function useFluxograma(id) {
  const [fluxo, setFluxo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchFluxo = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/api/fluxogramas/${id}/`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        setFluxo(data)
        setError(null)
      } catch (err) {
        setError(err.message)
        setFluxo(null)
      } finally {
        setLoading(false)
      }
    }

    fetchFluxo()
  }, [id])

  return { fluxo, loading, error }
}

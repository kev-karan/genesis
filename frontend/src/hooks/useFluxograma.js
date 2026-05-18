import { useState, useEffect } from 'react'
import { getFluxograma } from '../api/fluxogramas'

export function useFluxograma(id) {
  const [fluxo, setFluxo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchFluxo = async () => {
      try {
        setLoading(true)
        const data = await getFluxograma(id)
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

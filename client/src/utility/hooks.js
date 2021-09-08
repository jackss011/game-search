import { useState, useEffect } from 'react'

const BASE_URL = 'http://localhost:2000/'

export function useJsonFetch(path) {
  const [status, setStatus] = useState({ pending: false, data: null })

  useEffect(() => {
    const doFetch = async () => {
      if (path === null) {
        setStatus(oldStatus => ({ data: oldStatus.data, pending: false }))
        return
      }

      setStatus(oldStatus => ({ data: oldStatus.data, pending: true }))

      try {
        const response = await fetch(BASE_URL + path)
        const data = await response.json()

        setStatus(() => ({ data, pending: false }))
      } catch (e) {
        console.error(e)
      }
    }

    doFetch()
  }, [path])

  return [status.pending, status.data]
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { loadDemoClimate, loadLiveClimate } from '../lib/climateLoader'

export function useClimateData(location) {
  const [attempt, setAttempt] = useState({ count: 0, forceRefresh: false })
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const activeRequest = useRef(null)
  const demoSelected = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    activeRequest.current = controller
    demoSelected.current = false
    setState({ status: 'loading', data: null, error: null })

    loadLiveClimate(location, { signal: controller.signal, forceRefresh: attempt.forceRefresh })
      .then((data) => {
        if (!controller.signal.aborted && !demoSelected.current) {
          setState({ status: 'ready', data, error: null })
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted && !demoSelected.current) {
          setState({ status: 'error', data: null, error: error.message || 'Unknown error' })
        }
      })

    return () => controller.abort()
  }, [location, attempt])

  const retry = useCallback(() => {
    activeRequest.current?.abort()
    demoSelected.current = false
    setAttempt((current) => ({ count: current.count + 1, forceRefresh: true }))
  }, [])

  const useDemo = useCallback(() => {
    demoSelected.current = true
    activeRequest.current?.abort()
    setState({ status: 'ready', data: loadDemoClimate(), error: null })
  }, [])

  return { ...state, retry, useDemo }
}

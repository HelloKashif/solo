import React from 'react'
import useSWR from 'swr'
import qs from 'query-string'
import api from '../api.js'

async function fetcher(path) {
  const { data, error, status } = await api.get(path)
  if (error) throw error
  return data
}

const DEFAULT_OPTS = {
  refreshinterval: 0,
  disable: false,
  shouldRetryOnError: false,
}
function useApi(path, query = {}, opts = DEFAULT_OPTS) {
  let url = `${path}`
  if (Object.keys(query).length) {
    url += `?${qs.stringify(query, { arrayFormat: 'comma' })}`
  }
  const { data, error, isValidating, mutate } = useSWR(url, fetcher, opts)
  const loading = !data && data !== null && !error

  React.useEffect(() => {
    if (!error) return
    let err = JSON.parse(JSON.stringify(error))
  }, [error])

  return {
    data,
    loading,
    error: error?.message,
    isValidating,
    mutate,
    errorData: error?.errorData,
  }
}

export default useApi

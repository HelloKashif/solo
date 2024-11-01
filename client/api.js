const axios = require('axios')

const baseURL = '/api'
const axiosInstance = axios.create({ baseURL })

const parseAxiosError = err => {
  if (err.response?.data?.error) {
    return err.response.data.error
  }
  if (err.response?.data) {
    return err.response.data
  }
  return err.message
}

const sleep = ms => new Promise(r => setTimeout(r, ms))
const sleepIfTooFast = async (timeTaken, timeExpected) => {
  if (timeExpected <= timeTaken) return
  await sleep(timeExpected - timeTaken)
}

const apiClient = async opts => {
  let data
  let error
  let status
  try {
    const startTime = window.performance.now()
    const resp = await axiosInstance(opts)
    data = resp.data
    status = resp.status
    const endTime = window.performance.now()

    //To provide a consistent UX we make sure that APIs
    //don't resolve too fast. That way we can show some nice
    //loading spinners that don't just disappear instantly.
    if (opts.minDelay && ['POST', 'PUT', 'DELETE'].includes(opts.method)) {
      await sleepIfTooFast(endTime - startTime, minDelay)
    }
  } catch (err) {
    error = parseAxiosError(err)
    status = err.response?.status || 400
  }

  return { data, error, status }
}

const get = (url, data, headers = null) => {
  return apiClient({ url, method: 'GET', data, headers })
}
const post = (url, data, opts) => {
  return apiClient({ url, method: 'POST', data, ...opts })
}
const put = (url, data, headers = null) => {
  return apiClient({ url, method: 'PUT', data, headers })
}
const del = (url, data, opts) => {
  return apiClient({ url, method: 'DELETE', data, ...opts })
}

const modules = {
  get,
  put,
  post,
  delete: del,
}

export default modules

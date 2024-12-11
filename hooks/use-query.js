import * as uqp from 'use-query-params'

//Sample
// import useQuery from 'hooks/use-query'
// const queryMeta = {
//   items: { type: 'array' },
//   json: { type: 'json' },
//   bool: { type: 'bool', default: false },
//   number: { type: 'number', default: 42 },
//   object: { type: 'object' },
// }
// const { query, setQuery } = useQuery(queryMeta)

const makeOptions = config => {
  const opts = {}
  Object.entries(config).forEach(([k, v]) => {
    if (v.type === 'string') {
      opts[k] = uqp.withDefault(uqp.StringParam, v.default || '')
    }
    if (v.type === 'array') {
      opts[k] = uqp.withDefault(uqp.ArrayParam, v.default || [])
    }
    if (v.type === 'number') {
      opts[k] = uqp.withDefault(uqp.NumberParam, v.default)
    }
    if (v.type === 'bool') {
      opts[k] = uqp.withDefault(uqp.BooleanParam, v.default)
    }
    if (v.type === 'object') opts[k] = uqp.ObjectParam
    if (v.type === 'json') opts[k] = uqp.JsonParam
  })
  return opts
}

export default function useQuery(config) {
  const opts = makeOptions(config)
  const [query, setQuery] = uqp.useQueryParams(opts)
  return { query, setQuery }
}

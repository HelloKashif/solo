export default function Error({ error, className = '' }) {
  if (!error) return null
  return (
    <p
      className={`my-2 py-1 px-4 duration-75 ${
        error ? 'opacity-100' : 'opacity-0'
      } animate-shake transform transition-opacity text-center text-red-700 rounded bg-red-100 font-medium text-sm ${className}`}
    >
      {error}
    </p>
  )
}

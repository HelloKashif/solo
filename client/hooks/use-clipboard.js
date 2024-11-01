import React from 'react'
import copy from 'copy-to-clipboard'

/*
 Usage:
    import useClipboard from './clipboard.js'
    const [copied, setCopied] = useClipboard()
*/

export default function useClipboard(opts = {}) {
  const [copied, setCopied] = React.useState(false)

  const timeout = opts.timeout || 2000

  React.useEffect(() => {
    if (copied && timeout > 0) {
      const _timer = setTimeout(() => {
        setCopied(false)
      }, timeout)
      return () => clearTimeout(_timer)
    }
  }, [copied, timeout])

  const copyToClipboard = text => {
    const didCopy = copy(text)
    setCopied(didCopy)
  }

  return [copied, copyToClipboard]
}

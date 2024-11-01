import React from 'react'

export default function useRecaptcha(disable = false) {
  const ref = React.createRef()

  const onCaptchaChange = code => {
    if (!code) return
    ref.current.reset()
  }

  const getCaptcha = () => {
    if (disable) {
      return Promise.resolve('dummy')
    }
    return ref.current.executeAsync()
  }

  return { ref, onCaptchaChange, getCaptcha }
}

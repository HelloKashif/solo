import React from 'react'

export default function useRecaptcha() {
  const ref = React.createRef()

  const onCaptchaChange = code => {
    if (!code) return
    ref.current.reset()
  }

  const getCaptcha = () => {
    if (!ref.current) {
      return Promise.resolve('dummy')
    }
    return ref.current.executeAsync()
  }

  return { ref, onCaptchaChange, getCaptcha }
}

import ReCAPTCHA from 'react-google-recaptcha'

export default function Recaptcha({
  captchaRef,
  onCaptchaChange,
  disable,
  key,
  backend = 'gooogle', //Only google supported atm
}) {
  if (disable) return null

  return (
    <ReCAPTCHA
      ref={captchaRef}
      size='invisible'
      sitekey={key}
      onChange={onCaptchaChange}
    />
  )
}

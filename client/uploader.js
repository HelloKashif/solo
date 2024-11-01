// import { uploadFile} from 'uploader'

export function uploadFile(uploadData, file) {
  const formData = new FormData()
  Object.entries({ ...uploadData.fields }).forEach(([key, value]) => {
    formData.append(key, value)
  })
  formData.append('file', file) //File needs to be last apparantly

  return fetch(uploadData.url, { method: 'POST', body: formData })
}

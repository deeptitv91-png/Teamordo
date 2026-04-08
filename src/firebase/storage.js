import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config'

// uploads/{companyId}/{deptId}/{memberId}/{filename}
export const uploadFile = (file, companyId, deptId, memberId, onProgress) => {
  return new Promise((resolve, reject) => {
    const ext      = file.name.split('.').pop()
    const filename = `${Date.now()}_${file.name}`
    const path     = `uploads/${companyId}/${deptId}/${memberId}/${filename}`
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file)

    task.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        onProgress?.(pct)
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve({ url, path, filename, size: file.size, type: file.type })
      }
    )
  })
}

export const deleteFile = async (path) => {
  const fileRef = ref(storage, path)
  await deleteObject(fileRef)
}

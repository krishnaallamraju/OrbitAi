import type { Attachment } from './types'

export async function filesToAttachments(files: FileList | null) {
  if (!files) {
    return []
  }

  return Promise.all(
    Array.from(files)
      .slice(0, 3)
      .map(async (file): Promise<Attachment> => {
        if (file.type === 'application/pdf') {
          return {
            name: file.name,
            type: file.type,
            data: await readFileAsDataUrl(file),
          }
        }

        return {
          name: file.name,
          type: file.type || 'text/plain',
          text: await file.text(),
        }
      }),
  )
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * Compresses an image and converts it to WebP format using HTML5 Canvas.
 * @param file The raw input file (JPEG, PNG, etc.)
 * @param quality Compression quality (0 to 1) - default is 0.8
 * @param maxWidth Max width constraint to downscale large images - default is 1200px
 */
export async function compressAndConvertToWebp(
  file: File,
  quality = 0.8,
  maxWidth = 1200
): Promise<File> {
  // If the file is already a small WebP, bypass compression
  if (file.type === 'image/webp' && file.size < 200 * 1024) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Downscale image aspect ratio if it exceeds max width
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context could not be created'))
          return
        }

        // Draw image into canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
              const compressedFile = new File([blob], fileName, {
                type: 'image/webp',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('WebP blob generation failed'))
            }
          },
          'image/webp',
          quality
        )
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

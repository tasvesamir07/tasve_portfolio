const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#0f121d"/>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f121d" stop-opacity="1"/>
      <stop offset="50%" stop-color="#161b2c" stop-opacity="1"/>
      <stop offset="100%" stop-color="#0f121d" stop-opacity="1"/>
    </linearGradient>
  </defs>
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

export const blurDataURL = `data:image/svg+xml;base64,${toBase64(shimmer(1200, 800))}`

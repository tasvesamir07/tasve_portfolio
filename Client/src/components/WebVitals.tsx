'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    console.debug('[Web Vitals]', metric.name, metric.value)
  })
  return null
}
'use client'

import dynamic from 'next/dynamic'

const ResultsMap = dynamic(() => import('./results-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] w-full rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-xl" />
  ),
})

export default ResultsMap
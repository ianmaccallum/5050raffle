import React from 'react'
import Banner from './Banner'
import GithubBanner from './GithubBanner'

const BannerContainer = () => {
  return (
    <div className="container mx-auto px-6 my-10">
      <div className="flex flex-col gap-4">
        <Banner
          title="Sponsored by Parra"
          url="https://parra.io?utm_source=5050raffle"
        />
        <GithubBanner
          title="Check out the code"
          url="https://github.com/ianmaccallum/5050raffle"
          cta="View on GitHub"
        />
      </div>
    </div>
  )
}

export default BannerContainer
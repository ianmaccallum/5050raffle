import React from 'react'
import { Github } from 'lucide-react'

interface Props {
  title: string
  url: string
  cta: string
}

const GithubBanner = ({ title, url, cta }: Props) => {
  return (
    <div className="my-4 flex items-center py-4 px-8 w-full h-[128px] rounded-lg border-none bg-gray-100 bg-opacity-20  ring-2 ring-gray-700 hover:bg-gray-200 hover:bg-opacity-10 dark:bg-gray-600 dark:bg-opacity-20">
      <div className="absolute -mt-[128px] ml-4 rounded-lg bg-gray-800 px-4 pb-0.5 pt-0 dark:bg-gray-700">
        <span className="text-xs font-semibold text-gray-50">OPEN SOURCE</span>
      </div>

      <a href={url} className="flex flex-col w-full">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <div className="mr-4 w-[100px] flex items-center justify-center">
              <Github size={64} className="text-gray-700 dark:text-gray-300" />
            </div>

            <div>
              <span className="text-sm font-bold leading-loose text-gray-800 dark:text-gray-50">
                {title}
              </span>
            </div>
          </div>

          <span className="justify-end rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-600">
            {cta}
          </span>
        </div>
      </a>
    </div>
  )
}

export default GithubBanner
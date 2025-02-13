import Image from 'next/image'

interface Props {
  title: string
  url: string
  body?: string
  cta?: string
}

const Banner = ({ title, url }: Props) => {
  return (
    <div className="my-4 flex items-center py-4 px-8 w-full h-[128px] rounded-lg border-none bg-purple-400 bg-opacity-20 ring-2 ring-purple-700 hover:bg-purple-400 hover:bg-opacity-10  dark:bg-purple-500 dark:bg-opacity-20">
      <div className="absolute -mt-[128px] ml-4 rounded-lg bg-purple-700 px-4 pb-0.5 pt-0 dark:bg-purple-700">
        <span className="text-xs font-semibold text-gray-50">SPONSOR</span>
      </div>

      <a href={url} className="flex flex-col">
        <div className="flex flex-row items-center justify-start">
          <Image
            alt=""
            src={
              'https://parra-cdn.com/tenants/4caab3fe-d0e7-4bc3-9d0a-4b36f32bd1b7/logo/535871b4-288c-4881-9f33-89afc2a17992.png?width=256&height=256'
            }
            width={200}
            height={200}
            className="mr-4 w-[100px] pt-1"
          />

          <span className="text-sm font-bold leading-loose text-gray-800 dark:text-gray-50">
            {title}
          </span>
        </div>
      </a>
    </div>

    // <Link
    //   href={`/tags/${slug(text)}`}
    //   className="mr-3 text-sm font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
    // >
    //   {text.split(' ').join('-')}
    // </Link>
  )
}

export default Banner
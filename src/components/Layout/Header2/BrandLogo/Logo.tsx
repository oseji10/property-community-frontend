import Image from 'next/image'

const Logo: React.FC = () => {
  return (
    <>
      <Image
        src={'/images/header/dark-propertycommunity.svg'}
        alt='logo'
        width={400}
        height={100}
        unoptimized={true}
        className='dark:hidden'
      />
      <Image
        src={'/images/header/propertycommunity.svg'}
        alt='logo'
        width={400}
        height={100}
        unoptimized={true}
        className='dark:block hidden'
      />
    </>
  )
}

export default Logo

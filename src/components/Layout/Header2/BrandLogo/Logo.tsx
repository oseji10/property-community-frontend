import Image from 'next/image'

const Logo: React.FC = () => {
  return (
    <>
      <Image
        src={'/images/header/dark-logo.png'}
        // src={'/images/header/dark-propertyafrica.svg'}
        alt='logo'
        width={400}
        height={100}
        unoptimized={true}
        className='dark:hidden'
      />
      <Image
        src={'/images/header/dark-logo.png'}
        // src={'/images/header/dark-propertyafrica.svg'}
        alt='logo'
        width={400}
        height={100}
        unoptimized={true}
        className='dark:block hidden brightness-0 invert'
      />
    </>
  )
}

export default Logo

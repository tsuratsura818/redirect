import Image from 'next/image'

interface Props {
  size?: 'sm' | 'lg'
  className?: string
}

export default function Logo({ size = 'sm', className = '' }: Props) {
  const height = size === 'lg' ? 48 : 28
  const width = size === 'lg' ? 182 : 106

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/pivo_logo.png"
        alt="Pivolink"
        width={width}
        height={height}
        priority
      />
    </div>
  )
}

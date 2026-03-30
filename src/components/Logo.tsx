import Image from 'next/image'

interface Props {
  size?: 'sm' | 'lg'
  className?: string
}

export default function Logo({ size = 'sm', className = '' }: Props) {
  const height = size === 'lg' ? 90 : 56
  const width = size === 'lg' ? 342 : 213

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

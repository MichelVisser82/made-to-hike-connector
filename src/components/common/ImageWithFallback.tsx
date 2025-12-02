import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
}

export const ImageWithFallback = ({ 
  src, 
  alt, 
  className,
  fallbackClassName 
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (hasError) {
    return (
      <div className={cn(
        "bg-gradient-to-br from-burgundy/20 to-sage/20 flex items-center justify-center",
        fallbackClassName || className
      )}>
        <div className="text-charcoal/40 text-center p-4">
          <svg 
            className="w-12 h-12 mx-auto mb-2 opacity-50" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div className={cn(
          "bg-gradient-to-br from-burgundy/10 to-sage/10 animate-pulse",
          className
        )} />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(className, isLoading && 'hidden')}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />
    </>
  )
}

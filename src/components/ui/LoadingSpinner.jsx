export default function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizeClasses[size]} border-3 border-primary/20 border-t-primary rounded-full animate-spin`} />
    </div>
  )
}

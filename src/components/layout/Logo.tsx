import { Link } from 'react-router-dom'

interface LogoProps {
  name?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ name = 'Avroz Games', size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { box: 'h-8 w-8', text: 'text-base', icon: 'text-sm' },
    md: { box: 'h-10 w-10', text: 'text-xl', icon: 'text-base' },
    lg: { box: 'h-14 w-14', text: 'text-2xl', icon: 'text-xl' },
  }
  const s = sizes[size]

  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
      <div
        className={`${s.box} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-neon-sm group-hover:shadow-neon transition-shadow`}
      >
        <span className={`${s.icon} font-display font-black text-white tracking-tighter`}>A</span>
        <div className="absolute inset-0 rounded-xl bg-neon-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {showText && (
        <div className="hidden sm:block">
          <span className={`font-display ${s.text} font-bold text-white tracking-wide`}>
            {name.split(' ')[0]}
          </span>
          <span className={`font-display ${s.text} font-bold text-gradient ml-1`}>
            {name.split(' ').slice(1).join(' ') || 'Games'}
          </span>
        </div>
      )}
    </Link>
  )
}

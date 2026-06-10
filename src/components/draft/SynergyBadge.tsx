import type { SynergyBonus } from '@/store/types'

interface SynergyBadgeProps {
  bonus: SynergyBonus
}

export function SynergyBadge({ bonus }: SynergyBadgeProps) {
  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-300 rounded-lg px-3 py-2 transition-all duration-300 animate-fade-in">
      <span className="text-green-600 font-bold text-sm">✨ {bonus.label}</span>
      <span className="text-green-500 text-xs">{bonus.descricao}</span>
    </div>
  )
}

'use client'
import { iniciaisLider } from '@/lib/ligas'

interface GymLeaderAvatarProps {
  lider: string
  accent: string
  /** Tamanho base em px (cresce no hover via classe do card pai). */
  className?: string
}

/**
 * Avatar circular do líder de ginásio. Usa um placeholder estilizado com as
 * iniciais sobre a cor accent da liga — escolha deliberada por confiabilidade,
 * já que os sprites de treinador da PokéAPI não mapeiam por nome de forma
 * estável. Para usar arte real, basta trocar o conteúdo interno por <img>.
 */
export function GymLeaderAvatar({ lider, accent, className = '' }: GymLeaderAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={`
        grid place-items-center rounded-full
        font-extrabold text-white select-none
        ring-2 ring-white/30 shadow-lg shadow-black/40
        ${className}
      `}
      style={{
        background: `radial-gradient(120% 120% at 30% 25%, ${accent} 0%, rgba(0,0,0,0.55) 100%)`,
      }}
    >
      <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] leading-none">
        {iniciaisLider(lider)}
      </span>
    </div>
  )
}

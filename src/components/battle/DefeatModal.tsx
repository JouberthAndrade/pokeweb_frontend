'use client'

interface DefeatModalProps {
  onAssistirAnúncio: () => void
  onDesistir: () => void
  nomePokemonDerrotado: string
}

export function DefeatModal({ onAssistirAnúncio, onDesistir, nomePokemonDerrotado }: DefeatModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="
        relative z-10 bg-white rounded-3xl p-6 sm:p-8
        w-full max-w-sm
        shadow-2xl shadow-black/50
        animate-slide-up
        text-center
      ">
        {/* Emoji dramático */}
        <div className="text-5xl mb-3 animate-bounce">💀</div>

        <h2 className="text-2xl font-extrabold text-red-600 mb-2">Derrota!</h2>

        <p className="text-gray-600 mb-1 text-sm sm:text-base">
          <span className="font-semibold text-gray-800 capitalize">{nomePokemonDerrotado}</span> foi derrotado.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Assista um anúncio para revivê-lo com 30% de HP.
        </p>

        <button
          onClick={onAssistirAnúncio}
          className="
            w-full min-h-[52px]
            bg-gradient-to-r from-green-500 to-emerald-500
            hover:from-green-400 hover:to-emerald-400
            active:scale-95
            text-white font-extrabold text-base py-3 rounded-2xl mb-3
            shadow-lg shadow-green-500/30
            transition-all duration-200 ease-in-out
          "
        >
          📺 Segunda Chance (ver anúncio)
        </button>

        <button
          onClick={onDesistir}
          className="
            w-full min-h-[44px] text-gray-400 hover:text-gray-600
            text-sm py-2 rounded-xl
            transition-colors duration-200
          "
        >
          Desistir e voltar ao menu
        </button>
      </div>
    </div>
  )
}


import * as React from "react"

/**
 * @fileOverview Hook para detectar dispositivos móveis.
 * Garantido que o estado inicial seja consistente para evitar erros de hidratação.
 */

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Iniciamos como undefined para que o primeiro render seja idêntico ao servidor
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Retornamos false por padrão se for undefined (servidor/hidratação)
  // Isso garante que o layout desktop seja o renderizado inicialmente em ambos os lados
  return !!isMobile
}

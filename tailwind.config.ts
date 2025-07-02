import type { Config } from "tailwindcss"

const config = {
  // ... outras configurações
  theme: {
    container: {
      // ...
    },
    extend: {
      // ADICIONE ESTA SEÇÃO
      fontFamily: {
        sans: ['General Sans', 'sans-serif'],
      },
      // ... outras extensões
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
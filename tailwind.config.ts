// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {  
  content: [  
    './src/**/*.{js,ts,jsx,tsx,mdx}',  
  ],  
  theme: {  
    extend: {  
      colors: {  
        primary: "#185C4D",  
        // Removed solid surface, we will use Tailwind's bg-white/60 utilities for glass  
        slate: "#1C1C1E",  
        muted: "#737373",  
        // Status Colors (Soft background, dark text)  
        status: {  
          success: { bg: '#E1F2E8', text: '#1A7A44', border: '#BEE4CE' },  
          warning: { bg: '#FDF0D5', text: '#9B7016', border: '#FBE1A9' },  
          danger:  { bg: '#FCE4E4', text: '#B83131', border: '#F8CACA' },  
        }  
      },  
      backgroundImage: {  
        'app-gradient': 'linear-gradient(135deg, #FAF8F2 0%, #F1EAE0 50%, #E2D3B8 100%)',  
        'table-header': 'linear-gradient(90deg, #185C4D 0%, #30836B 100%)',  
      },  
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'var(--font-noto-sans-lao)', 'Phetsarath OT', 'sans-serif'],
        lao: ['var(--font-noto-sans-lao)', 'Phetsarath OT', 'sans-serif'],
      },
      boxShadow: {  
        'soft': '0 4px 20px rgba(0, 0, 0, 0.04)',  
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)', // Specific shadow for glass components
      },  
      borderRadius: {  
        'xl': '12px',  
        '2xl': '16px',  
      }  
    },  
  },  
  plugins: [],  
}  
export default config

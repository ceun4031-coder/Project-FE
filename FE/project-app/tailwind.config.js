/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. 색상 토큰 (브랜드 컬러 & 시맨틱 컬러)
      colors: {
        // Primary (브랜드 보라)
        primary: {
          100: '#ede9ff',
          200: '#b7a8ff',
          300: '#9380f7',
          400: '#7e6df0',
          500: '#6c5ce7', // Main
          600: '#4c44b8', // Pressed/Active
        },
        // Secondary (라벤더 보조)
        secondary: {
          100: '#f4f1ff',
          200: '#dcd6ff',
          300: '#bfb7ff',
          400: '#9188f0',
          500: '#a29bfe',
        },
        // Neutral (텍스트 & UI)
        neutral: {
          50: '#ffffff',
          100: '#f7f7fc', // 메인 BG
          200: '#e5e5f0', // Disabled BG / Border Subtle
          300: '#c7c7d9', // Border Strong
          500: '#82829a', // Sub Text
          600: '#55556c',
          700: '#3a3a4f', // Body Text
          800: '#2d2d40',
          900: '#1e1e2f', // Header Text
        },
        // Surface (카드/섹션 배경) -> bg-surface-1 등으로 사용
        surface: {
          1: '#ffffff',
          2: '#f4f1ff',
          3: '#ede9ff',
        },
        // 시맨틱 텍스트 컬러 (text-body, text-muted 등으로 사용 가능하게 매핑)
        text: {
          DEFAULT: '#3a3a4f', // 기본 (neutral-700)
          muted: '#82829a',   // 흐린 텍스트 (neutral-500)
          disabled: '#A0A0B5', 
        },
        // 시맨틱 보더 컬러 (border-strong, border-subtle 등으로 사용)
        border: {
          strong: '#c7c7d9',
          subtle: '#e5e5f0',
        }
      },

      // 2. 폰트 설정
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'], // font-sans
      },
      fontSize: {
        base: ['16px', '1.6'], // text-base
      },

      // 3. 둥글기 (Border Radius)
      borderRadius: {
        sm: '6px',    // rounded-sm
        md: '10px',   // rounded-md
        lg: '14px',   // rounded-lg
        pill: '999px',// rounded-pill
      },

      // 4. 그림자 (Shadow)
      boxShadow: {
        soft: '0 6px 12px rgba(0, 0, 0, 0.12)', // shadow-soft
      },

      // 5. 간격 (Spacing) - Tailwind 기본과 유사하지만 명시적으로 정의
      spacing: {
        // p-1, m-1 처럼 사용
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        
        // 레이아웃용 여백 (px-outer-mobile 등)
        'outer-mobile': '16px',
        'outer-tablet': '24px',
        'outer-web': '80px',
        'outer-wide': '120px',
      },

      // 6. 레이아웃 너비 (Max Width)
      maxWidth: {
        'container-web': '1120px',      // max-w-container-web
        'container-wide': '1200px',     // max-w-container-wide
      },

      // 7. 반응형 브레이크포인트 (Screens)
      screens: {
        mobile: '375px',
        tablet: '768px',
        web: '1280px',
        wide: '1440px',
      },
    },
  },
  plugins: [],
}
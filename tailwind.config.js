/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // CRITICAL: This enables dark: classes to work with the 'dark' class on <html>
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#6366f1',
                    secondary: '#ec4899',
                    accent: '#fbbf24',
                    dark: '#0f172a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'Outfit', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

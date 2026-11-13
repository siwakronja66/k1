/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./public/**/*.html', './public/**/*.php', './public/js/**/*.js', './public/admin/**/*.js', './src/**/*.php'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Sarabun', 'sans-serif'],
                heading: ['Prompt', 'sans-serif'],
            },
        },
    },
};

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
      colors: {
      "leaf": {
            "50": "#f1f8f2",
            "100": "#dcefe0",
            "200": "#b9dfc2",
            "300": "#8cc99a",
            "400": "#5fae75",
            "500": "#3f9159",
            "600": "#2f7446",
            "700": "#245c37",
            "800": "#1d4a2d",
            "900": "#163a24"
      },
      "moss": {
            "50": "#f5f7ee",
            "100": "#e7ecd6",
            "200": "#d0dbae",
            "300": "#b3c380",
            "500": "#7b8f3a",
            "700": "#4f5f24",
            "900": "#2d3614"
      },
      "wheat": {
            "50": "#fdf8ec",
            "100": "#f9edcb",
            "200": "#f2dc97",
            "300": "#e8c767",
            "500": "#b98a1c",
            "700": "#7a5a10",
            "900": "#46330a"
      },
      "cream": {
            "50": "#fdfbf5",
            "100": "#f8f3e4",
            "200": "#efe6cc",
            "300": "#e0d3ad"
      },
      "soil": {
            "50": "#f7f5f2",
            "200": "#d9d3c9",
            "500": "#7d7366",
            "700": "#4d463c",
            "900": "#262019"
      }
}
    },
  },
  plugins: [],
}

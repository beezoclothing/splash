// Applies theme CSS variables to :root from a settings object
export function applyTheme(theme = {}) {
  const root = document.documentElement
  if (theme.primary)  root.style.setProperty('--color-primary', theme.primary)
  if (theme.accent)   root.style.setProperty('--color-accent',  theme.accent)
  if (theme.surface)  root.style.setProperty('--color-surface', theme.surface)
}

export const defaultTheme = {
  storeName: 'Splash Men',
  logoUrl: '',
  primary: '#111111',
  accent: '#C8A96E',
  surface: '#F5F3EF',
}

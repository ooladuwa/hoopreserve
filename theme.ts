// theme.ts
import { makeTheme } from 'dripsy'

const theme = makeTheme({
    colors: {
        primary: '#0070f3',
        secondary: '#7928ca',
        background: '#fff',
        text: '#000',
        muted: '#f6f6f6',
    },
    space: {
        1: 4,
        2: 8,
        3: 16,
        4: 32,
    },
    fonts: {
        body: 'System',
        heading: 'System',
        monospace: 'System',
    },
    fontSizes: {
        body: 16,
        heading: 24,
        subheading: 20,
    },
    radii: {
        default: 8,
        circle: 9999,
    },
})

export default theme

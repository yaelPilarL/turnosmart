'use client';

import '@fontsource-variable/plus-jakarta-sans';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';

const FONT = '"Plus Jakarta Sans Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'media' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#0F766E', light: '#14B8A6', dark: '#115E59', contrastText: '#FFFFFF' },
        secondary: { main: '#B45309' },
        success: { main: '#15803D' },
        warning: { main: '#C2410C' },
        error: { main: '#B91C1C' },
        background: { default: '#F5F7F8', paper: '#FFFFFF' },
        text: { primary: '#0F1A1C', secondary: '#55636A' },
        divider: '#E3E8EA',
      },
    },
    dark: {
      palette: {
        primary: { main: '#2DD4BF', light: '#5EEAD4', dark: '#14B8A6', contrastText: '#042F2E' },
        secondary: { main: '#FBBF24' },
        success: { main: '#4ADE80' },
        warning: { main: '#FB923C' },
        error: { main: '#F87171' },
        background: { default: '#0B1214', paper: '#121B1E' },
        text: { primary: '#E6EEF0', secondary: '#93A3A9' },
        divider: '#22313A',
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: FONT,
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 650, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    overline: { fontWeight: 700, letterSpacing: '0.08em' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16 },
        sizeLarge: { paddingBlock: 10 },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          borderColor: theme.vars.palette.divider,
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
        }),
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 24, '&:last-child': { paddingBottom: 24 } } },
    },
    MuiPaper: {
      styleOverrides: {
        // Sin el velo claro que MUI agrega a superficies elevadas en modo oscuro.
        root: { backgroundImage: 'none' },
        outlined: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          backgroundColor: theme.vars.palette.background.paper,
        }),
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
        head: ({ theme }) => ({
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: theme.vars.palette.text.secondary,
          backgroundColor: theme.vars.palette.action.hover,
        }),
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontWeight: 700, paddingTop: 20 } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
});

export function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}

import { createMuiTheme } from '@material-ui/core/styles'
import * as colors from '@material-ui/core/colors'
import isHexColor from 'validator/lib/isHexColor'

// Create a color theme to be used by the rest of the chat window. If the user
// defines a color that isn't available, fall back to default colors and
// warn user
export default function createTheme(
  primaryColor = 'lightBlue',
  secondaryColor = 'pink',
  headerColor = 'lightBlue'
) {
  const newTheme = {
    palette: {
      error: colors.red,
      // Used by `getContrastText()` to maximize the contrast between the background and
      // the text.
      contrastThreshold: 3,
      // Used to shift a color's luminance by approximately
      // two indexes within its tonal palette.
      // E.g., shift from Red 500 to Red 300 or Red 700.
      tonalOffset: 0.2,
      primary: { main: '' },
      secondary: { main: '' },
      header: { main: '' }
    },
    typography: {
      useNextVariants: true,
    },
    overrides: {
      MuiFab: {
        root: {
          position: 'absolute',
          bottom: 48,
          right: 48,
        },
      },
    },
  }
  if (isHexColor(primaryColor)) {
    newTheme.palette.primary = {
      main: primaryColor,
    }
  } else if (colors[primaryColor]) {
    newTheme.palette.primary = colors[primaryColor]
  } else {
    throw new Error(
      `${primaryColor} is not a valid color. Use a color name from https://material.io/guidelines/style/color.html#color-color-palette`
    )
  }

  if (isHexColor(secondaryColor)) {
    newTheme.palette.secondary = {
      main: secondaryColor,
    }
  } else if (secondaryColor && colors[secondaryColor]) {
    newTheme.palette.secondary = colors[secondaryColor]
  } else {
    throw new Error(
      `${secondaryColor} is not a valid color. 
      Use a color name from https://material.io/guidelines/style/color.html#color-color-palette`
    )
  }

  if (isHexColor(headerColor)) {
    newTheme.palette.header = {
      main: headerColor,
    }
  } else if (colors[headerColor]) {
    newTheme.palette.header = colors[headerColor]
  } else {
    throw new Error(
      `${headerColor} is not a valid color. Use a color name from https://material.io/guidelines/style/color.html#color-color-palette`
    )
  }

  return createMuiTheme(newTheme as any)
}

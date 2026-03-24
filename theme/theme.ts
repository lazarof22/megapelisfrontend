import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#e50914"
    },
    background: {
      default: "#0f0f0f",
      paper: "#181818"
    }
  },
  typography: {
    fontFamily: "Roboto, sans-serif"
  }
});

export default theme;
import React from 'react';
import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import indigo from '@material-ui/core/colors/indigo';
import { makeStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import Header from './Header';
import SearchByAlgolia from './SearchByAlgolia';
import Dummy from './Dummy';

// https://material-ui.com/customization/color/
const theme = createMuiTheme({
  palette: {
    primary: {
      main: indigo[900]
    }
  }
})

const useStyles = makeStyles(theme => ({
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem'
  }
}));

const App = () => {
  const classes = useStyles();
  return (
    <>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Header />
        <div className={classes.container} >
          <BrowserRouter>
            <Switch>
              <Route exact path='/'>
                <SearchByAlgolia />
              </Route>
              <Route exact path='/dummy'>
                <Dummy />
              </Route>
              <Redirect path="*" to="/" />
            </Switch>
          </BrowserRouter>
        </div>
      </MuiThemeProvider >
    </>
  );
}

export default App;

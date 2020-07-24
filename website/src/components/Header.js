import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(1),
  },
  title: {
    flexGrow: 1,
  },
  link: {
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  }
}));

const Header = () => {
  const classes = useStyles();
  const history = useHistory();
  const handleClick = path => history.push(path)

  return (
    <>
      <AppBar position='relative'>
        <Toolbar>
          <FindInPageIcon className={classes.icon} />
          <Typography color='inherit' noWrap className={classes.title} >
            AWS Document(ja) Search
          </Typography>
          <Typography className={classes.link} >
            <Link href='/' onClick={() => handleClick('/')} color='inherit'>Top</Link>
            <Link href='/dummy' onClick={() => handleClick('/dummy')} color='inherit'>TBD</Link>
          </Typography>

        </Toolbar>
      </AppBar>
    </>
  )
}

export default Header;

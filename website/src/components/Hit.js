import React from 'react';
import { Snippet } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';

const getUtcDateStr = dateStr => {
  try {
    const yyyymmddd = moment.utc(dateStr).format('yyyy/MM/DD');
    const hhmmdd = moment.utc(dateStr).format('HH:mm:ss (UTC)');
    return `${yyyymmddd} ${hhmmdd}`
  } catch (error) {
    return '';
  }
};

const useStyles = makeStyles(theme => ({
  section1: {
    margin: theme.spacing(0, 1, 1, 1),
  },
  section2: {
    margin: theme.spacing(2, 1, 0, 1),
  },
  title: {
    color: '#545b64',
    paddingTop: theme.spacing(1)
  },
  link: {
    margin: theme.spacing(1, 0, 1, 0),
  }
}));

function Hit(props) {
  const classes = useStyles();
  return (
    <>
      <Card>
        <CardContent>
          <div className={classes.section1}>
            <Typography variant="h5">{props.hit.product}</Typography>
            <Grid container>
              <Grid item={12} sm={6}>
                <Typography variant='body2' color='inherit' className={classes.title} >Guide</Typography>
                <Typography variant='body2' color='inherit' >{props.hit.guide}</Typography>
                <Typography variant='body2' color='inherit' className={classes.title} >Title</Typography>
                <Typography variant='body2' color='inherit' >{props.hit.title}</Typography>
              </Grid>
              <Grid item={12} sm={6}>
                <Typography variant='body2' color='inherit' className={classes.title} >last-modified</Typography>
                <Typography variant='body2' color='inherit' >{getUtcDateStr(props.hit.last_modified)}</Typography>
                <Typography variant='body2' color='inherit' className={classes.title} >crawled-at</Typography>
                <Typography variant='body2' color='inherit' >{getUtcDateStr(props.hit.crawled_at)}</Typography>
              </Grid>
            </Grid>
            <div className={classes.link}>
              <a href={props.hit.url} target='_blank'>{props.hit.url}</a>
            </div>
          </div>
          <Divider variant="middle" />
          <div className={classes.section2}>
            <Typography variant='body2' color='textSecondary' component='p'>
              <Snippet hit={props.hit} attribute='content' />
            </Typography>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

Hit.propTypes = {
  hit: PropTypes.object.isRequired,
};

export default Hit;

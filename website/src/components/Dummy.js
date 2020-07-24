import React from 'react';
import Container from '@material-ui/core/Container';

const Dummy = () => {
  return (
    <Container maxWidth="sm" >
      <img src={`${process.env.PUBLIC_URL}/img/job_kouji_stop2.png`} alt='kouji_stop' />;
    </Container>
  )
}

export default Dummy;

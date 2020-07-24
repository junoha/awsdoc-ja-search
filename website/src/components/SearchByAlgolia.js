import React from 'react';
import Hit from './Hit';
import './SearchByAlgolia.css';
import { makeStyles } from '@material-ui/core/styles';

import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Hits,
  SearchBox,
  Pagination,
  ClearRefinements,
  RefinementList,
  Configure,
} from 'react-instantsearch-dom';

const useStyles = makeStyles(theme => ({
  leftPanel: {
    float: 'left',
    width: '250px'
  },
  rightPanel: {
    marginLeft: '260px'
  },
  searchPanel: {
    display: 'flex'
  },
  searchPanel__results: {
    flex: 3
  },
  pagination: {
    margin: '2rem auto',
    textAlign: 'center'
  }
}));

// Get env val from .env
const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_API_ID,
  process.env.REACT_APP_ALGOLIA_API_KEY
);

const App = () => {
  const classes = useStyles();

  return (
    <InstantSearch searchClient={searchClient} indexName={process.env.REACT_APP_ALGOLIA_INDEX_NAME}>
      <div className={classes.leftPanel}>
        <ClearRefinements />
        <h2>Product</h2>
        <RefinementList attribute="product" showMore={true} showMoreLimit={30} />
        <h2>Guide</h2>
        <RefinementList attribute="guide" showMore={true} showMoreLimit={20} />
        <Configure hitsPerPage={5} />
      </div>
      <div className={classes.rightPanel}>
        <div className={classes.searchPanel}>
          <div className={classes.searchPanel__results}>
            <SearchBox
              translations={{
                placeholder: 'search here...',
              }}
            />
            <div>
              <Hits hitComponent={Hit} />
            </div>
            <div className={classes.pagination}>
              <Pagination />
            </div>
          </div>
        </div>
      </div>
    </InstantSearch>
  );
}

export default App;

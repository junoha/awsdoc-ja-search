import React, { Component } from 'react';
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
import './App.css';
import Hit from './components/Hit';

// Get env val from .env
const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_API_ID,
  process.env.REACT_APP_ALGOLIA_API_KEY
);

class App extends Component {
  render() {
    return (
      <div>
        <header className="header">
          <h1 className="header-title">
            <a href="/">website</a>
          </h1>
          <p className="header-subtitle">
            using{' '}
            <a href="https://github.com/algolia/react-instantsearch">
              React InstantSearch
            </a>
          </p>
        </header>

        <div className="container">
          <InstantSearch searchClient={searchClient} indexName={process.env.REACT_APP_ALGOLIA_INDEX_NAME}>
            <div className="left-panel">
              <ClearRefinements />
              <h2>Product</h2>
              <RefinementList attribute="product" showMore={true} showMoreLimit={30} />
              <h2>Guide</h2>
              <RefinementList attribute="guide" showMore={true} showMoreLimit={20} />
              <Configure hitsPerPage={10} />
            </div>
            <div className="right-panel">
              <div className="search-panel">
                <div className="search-panel__results">
                  <SearchBox
                    className="searchbox"
                    translations={{
                      placeholder: 'search here...',
                    }}
                  />
                  <div>
                    <Hits hitComponent={Hit} />
                  </div>
                  <div className="pagination">
                    <Pagination />
                  </div>
                </div>
              </div>
            </div>
          </InstantSearch>
        </div>
      </div>
    );
  }
}

export default App;

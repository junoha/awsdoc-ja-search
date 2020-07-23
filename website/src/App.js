import React, { Component } from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Hits,
  SearchBox,
  Pagination,
  Highlight,
} from 'react-instantsearch-dom';
import PropTypes from 'prop-types';
import './App.css';

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
          <InstantSearch searchClient={searchClient} indexName="aws-doc-jp">
            <div className="search-panel">
              <div className="search-panel__results">
                <SearchBox
                  className="searchbox"
                  translations={{
                    placeholder: '',
                  }}
                />
                <Hits hitComponent={Hit} />

                <div className="pagination">
                  <Pagination />
                </div>
              </div>
            </div>
          </InstantSearch>
        </div>
      </div>
    );
  }
}

function Hit(props) {
  return (
    <article>
      <h1>
        <Highlight attribute="url" hit={props.hit} />
      </h1>
      <h1>
        <Highlight attribute="guide" hit={props.hit} />
      </h1>
      <h1>
        <Highlight attribute="product" hit={props.hit} />
      </h1>
      <h1>
        <Highlight attribute="title" hit={props.hit} />
      </h1>
      <h1>
        <Highlight attribute="content" hit={props.hit} />
      </h1>

    </article>
  );
}

Hit.propTypes = {
  hit: PropTypes.object.isRequired,
};

export default App;

import React from 'react';
import { Snippet } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';

function Hit(props) {
    return (
        <article>
            <ul>
                <li>{props.hit.product}</li>
                <li>{props.hit.guide}</li>
                <li>{props.hit.title}</li>
                <li>{props.hit.url}</li>
                <li>{props.hit.last_modified}</li>
                <li>{props.hit.crawled_at}</li>
            </ul>
            <Snippet hit={props.hit} attribute="content" />
        </article>
    );
}

Hit.propTypes = {
    hit: PropTypes.object.isRequired,
};

export default Hit;

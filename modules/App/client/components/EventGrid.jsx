/* global React, Meteor */

import GridEvent from './GridEvent';
import AbsoluteGrid from 'react-absolute-grid';

/**
 * The grid view of all the events at the bottom of the dashboard.
 *
 * @class
 * @extends React.Component
 */
export default class EventGrid extends React.Component {

    state = {
        items: [
            {key: 1, name: 'Test', sort: 0, filtered: 0},
            {key: 2, name: 'Test 1', sort: 1, filtered: 0},
            {key: 3, name: 'Test', sort: 0, filtered: 0},
            {key: 4, name: 'Test 1', sort: 1, filtered: 0},
            {key: 5, name: 'Test', sort: 0, filtered: 0},
            {key: 6, name: 'Test 1', sort: 1, filtered: 0}
        ]
    };

    /** @inheritDoc */
    render() {
        return (
            <div className="ui container">
                <div className="ui grid-events">
                    <AbsoluteGrid items={this.state.items}
                                  displayObject={<GridEvent />}
                                  responsive={true}
                                  itemHeight={463}
                                  itemWidth={290}
                                  zoom={1}
                    />
                </div>
            </div>
        )
    }

}
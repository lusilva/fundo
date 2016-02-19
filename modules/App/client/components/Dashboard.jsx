/* global React */

import { isUserVerified } from 'App/helpers';

/**
 * The dashboard view that the user sees upon logging in.
 *
 * @class
 * @extends React.Component
 */
export default class Dashboard extends React.Component {

    _toggleFilterMenu() {
        console.log('hey!');
    };


    /** @inheritDoc */
    render() {

        let mastheadContent = isUserVerified(this.props.currentUser) ?
            (<div>CONTENT PLACEHOLDER</div>) :
            (<div>VERIFY EMAIL PLACEHOLDER</div>);

        return (
            <div>
                <div className="ui inverted vertical center aligned segment dashboard-masthead primary-color">
                    <div className="ui text container middle aligned">
                        {mastheadContent}
                    </div>
                </div>
                <div className="main-content">
                    <div className="ui labeled icon menu">
                        <a className="item" onClick={this._toggleFilterMenu.bind(this)}>
                            <i className="options icon" />
                            Filter
                        </a>
                    </div>
                </div>
            </div>
        )
    }
}
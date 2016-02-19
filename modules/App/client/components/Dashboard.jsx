/* global React */

import { isUserVerified } from 'App/helpers';

/**
 * The dashboard view that the user sees upon logging in.
 *
 * @extends React.Component
 */
export default class Dashboard extends React.Component {

    state = {
        filter: {
            iconClass: 'options',
            iconText: 'Open Filters',
            open: true
        }
    };

    componentDidMount() {
        // Localize the selector instead of having jQuery search globally
        var rootNode = ReactDOM.findDOMNode(this);

        console.log(rootNode);

        // Initialize the sidebar
        $(rootNode).find('.ui.sidebar')
            .sidebar({
                context: $(rootNode).find('.ui.bottom'),
                dimPage: false,
                closable: false
            })
    };

    _toggleFilterMenu() {
        // Same thing as before, might want to store this as a variable
        let rootNode = ReactDOM.findDOMNode(this);
        $(rootNode).find('.ui.sidebar').sidebar('toggle');

        let filter = !this.state.filter.open ?
        {
            iconClass: 'options',
            iconText: 'Open Filters',
            open: true
        } :
        {
            iconClass: 'options',
            iconText: 'Hide Filters',
            open: false
        };

        this.setState({filter: filter});
    };


    /** @inheritDoc */
    render() {

        let mastheadContent = isUserVerified(this.props.currentUser) ?
            (<div>CONTENT PLACEHOLDER</div>) :
            (<div>VERIFY EMAIL PLACEHOLDER</div>);

        let filters = <div>FILTERS</div>;

        return (
            <div>
                <div className="ui inverted vertical center aligned segment dashboard-masthead primary-color">
                    <div className="ui text container middle aligned">
                        {mastheadContent}
                    </div>
                </div>
                <div className="ui bottom attached segment pushable">
                    <div className="ui left vertical sidebar menu">
                        {filters}
                    </div>
                    <div className="pusher">
                        <div className="ui labeled icon menu">
                            <a className="item" onClick={this._toggleFilterMenu.bind(this)}>
                                <i className={this.state.filter.iconClass + " icon"}/>
                                {this.state.filter.iconText}
                            </a>
                        </div>
                        <div className="ui basic segment">
                            <h3 className="ui header">Application Content</h3>
                            <p></p>
                            <p></p>
                            <p></p>
                            <p></p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
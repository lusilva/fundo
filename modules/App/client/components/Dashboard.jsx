/* global React */

import { isUserVerified } from 'App/helpers';
import Shuffle from 'react-shuffle';

/**
 * The dashboard view that the user sees upon logging in.
 *
 * @extends React.Component
 */
export default class Dashboard extends React.Component {

    alphabet = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    state = {
        filter: {
            iconClass: 'options',
            iconText: 'Open Filters',
            open: true
        },
        children: this.alphabet
    };

    componentDidMount() {
        // Localize the selector instead of having jQuery search globally
        var rootNode = ReactDOM.findDOMNode(this);

        // Initialize the sidebar
        $(rootNode).find('.ui.sidebar')
            .sidebar({
                context: $(rootNode).find('.ui.bottom'),
                dimPage: false,
                closable: false
            });
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

    _renderEvents() {
        return this.state.children.map(function (letter) {
            return (
                <div className="tile" key={letter}>
                    <img
                        src={"http://placehold.it/100x100&text=" + letter}/>
                </div>
            )
        })
    };

    filterChildren() {
        if (this.state.filtered === false) {
            let newChildren = this.state.children.filter(function (child, index) {
                if (index % 2 === 0) {
                    return child
                }
            });
            this.setState({
                children: newChildren,
                filtered: true
            });
        } else {
            this.setState({
                children: this.alphabet,
                filtered: false
            });
        }
    };


    /** @inheritDoc */
    render() {

        let mastheadContent = isUserVerified(this.props.currentUser) ?
            (<div>CONTENT PLACEHOLDER</div>) :
            (<div>VERIFY EMAIL PLACEHOLDER</div>);

        let filters = (
            <div>
                <button type="button" onClick={this.filterChildren.bind(this)}>Filter Children</button>
            </div>
        );

        return (
            <div>
                <div className="ui inverted vertical center aligned segment dashboard-masthead primary-color">
                    <div className="ui text container middle aligned">
                        {mastheadContent}
                    </div>
                </div>
                <div className="ui labeled icon menu attached">
                    <a className="item" onClick={this._toggleFilterMenu.bind(this)}>
                        <i className={this.state.filter.iconClass + " icon"}/>
                        {this.state.filter.iconText}
                    </a>
                </div>
                <div className="ui bottom attached segment pushable">
                    <div className="ui left vertical sidebar menu">
                        {filters}
                    </div>
                    <div className="pusher">
                        <div className="ui basic segment main-content">
                            <div className="ui container">
                                <Shuffle duration={500} fade={false}>
                                    {this._renderEvents()}
                                </Shuffle>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
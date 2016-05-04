/* global React */

/**
 * The Main Menu user sees at the top of the Dashboard
 *
 * @class
 * @extends React.Component
 */
export default class MainMenu extends React.Component {
  static propTypes = {
    filterMenuCallback: React.PropTypes.func.isRequired,
    searchInputChangeCallback: React.PropTypes.func.isRequired,
    mapViewCallback: React.PropTypes.func.isRequired,
    filter: React.PropTypes.object.isRequired
  };

  _updateSearch(e) {
    e.preventDefault();
    this.props.searchInputChangeCallback(this.refs.quickSearch.value || null);
  };


  render() {
    return (
      <div className="ui menu attached secondary filter-menu">
        <div className="ui labeled icon menu">
          <a className={'item ' + (this.props.filter.open ? 'active' : '')}
             onClick={this.props.filterMenuCallback}>
            <i className="options icon"/>
            Filters
          </a>
        </div>
        <div className="ui left menu desktop-only">
          <div className="ui category search item">
            <div className="ui action input">
              <form className="ui form" onSubmit={this._updateSearch.bind(this)}>
                <div className="ui icon input">
                  <input type="text" placeholder="Quick Search..." ref="quickSearch"/>
                  <i className="inverted circular search link small icon" onClick={this._updateSearch.bind(this)}/>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="ui labeled icon right menu">
          <a className="item"
             onClick={this.props.mapViewCallback}>
            <i className="map icon"/>
            {this.props.mapView ? 'Hide Map' : 'Show Map'}

          </a>
        </div>
      </div>
    );
  }
}

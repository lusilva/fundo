import parseLink from 'parse-link';
import _ from 'lodash';

export default class BaseEvent extends React.Component {

  static propTypes = {
    event: React.PropTypes.object.isRequired
  };


  state = {
    liked: false,
    disliked: false
  };

  /**
   * Toggle liking/unliking of this event.
   *
   * @param clickEvent
   * @private
   */
  _toggleLike(clickEvent) {
    clickEvent.preventDefault();

    let event = this.props.event;

    // If this event has already been liked, then unlike it.
    if (this.state.liked) {
      Meteor.call('unlike', event.id, function(err, res) {
        if (err) {
          this.setState({liked: true});
        }
      }.bind(this));
      this.setState({liked: false});
      event.unlike();

      // Else, if this event isn't liked yet then like it.
    } else {
      Meteor.call('like', event.id, function(err, res) {
        if (err) {
          this.setState({liked: false});
        }
      }.bind(this));
      this.setState({liked: true});
      event.like();
    }
  };


  /**
   * Toggle disliking/undisliking this event.
   *
   * @param clickEvent
   * @private
   */
  _toggleDislike(clickEvent) {
    clickEvent.preventDefault();

    let event = this.props.event;

    // If this event is already disliked, then undislike it.
    if (this.state.disliked) {
      Meteor.call('undislike', event.id, function(err, res) {
        if (err) {
          this.setState({disliked: true});
        }
      }.bind(this));
      this.setState({disliked: false});
      event.undislike();
      // Else, dislike this event.
    } else {
      Meteor.call('dislike', event.id, function(err, res) {
        if (err) {
          this.setState({disliked: false});
        }
      }.bind(this));
      this.setState({disliked: true});
      event.dislike();
    }
  };

  /**
   * Get likes icon and count for this event.
   *
   * @returns {?JSX} - null if user has disliked this event.
   * @private
   */
  _getLikes() {
    let event = this.props.event;

    if (this.state.disliked) {
      return null;
    }

    return (
      <span className="right floated">
                <i className={"heart " + (this.state.liked ? "" : "outline") + " like icon"}
                   onClick={this._toggleLike.bind(this)}/>
        {event.likes.length} likes
            </span>
    );
  };


  /**
   * Get dislikes icon and count for this event.
   *
   * @returns {?JSX} - null if user has liked this event.
   * @private
   */
  _getDislikes() {
    let event = this.props.event;

    if (this.state.liked) {
      return null;
    }

    return (
      <span className="right floated">
                <i className={"thumbs down " + (this.state.disliked ? "" : "outline") + " like icon"}
                   onClick={this._toggleDislike.bind(this)}/>
        {event.dislikes.length} dislikes
            </span>

    );
  };


  /**
   * Get relevant links for this event, shown in the more info modal.
   *
   * @returns {*}
   * @private
   */
  _getRelevantLinks() {
    let event = this.props.event;
    let links = event.links || [];

    // Get eventful url and append it to the links.
    if (event.url) {
      links = links.concat(event.url);
    }

    // If there are no links, return null.
    if (links.length == 0) {
      return null;
    }

    return (
      <div className="column">
        <h4 className="ui horizontal section divider header">
          <i className="linkify icon"/>
          Links
        </h4>
        <div className="ui relaxed list">
          {_.map(_.uniq(links), function(link, index) {
            let parsedLink = parseLink(link);

            return (
              <a className="ui item"
                 target="_blank"
                 href={link}
                 key={event.id + '-link-' + index}>
                {
                  parsedLink.hostname +
                  (
                    parsedLink.path && parsedLink.path.split('/').length > 1 ?
                    '/' + parsedLink.path.split('/')[1] : ''
                  )
                }
              </a>
            )
          })}
        </div>
      </div>
    )
  };


  /**
   * Get the info for tickets if available.
   *
   * @private
   */
  _getTicketInfo() {
    let event = this.props.event;

    if (!event.tickets || event.tickets.length == 0) {
      return null;
    }

    let ticketLinks = event.tickets.link || [];

    return (
      <div className="column">
        <h4 className="ui horizontal section divider header">
          <i className="ticket icon"/>
          Get Tickets
        </h4>
        <div className="ui relaxed list">
          {_.map(ticketLinks, function(link, index) {
            if (!link.url) return null;
            return (
              <a href={link.url}
                 target="_blank"
                 key={event.id+'-tickets-'+index}
                 className="ui item">
                {link.provider || ('Ticket Link ' + index)}
              </a>
            );
          })}
        </div>
      </div>

    );
  };


};
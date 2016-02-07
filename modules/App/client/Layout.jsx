
import { Component, PropTypes } from "react";
import Helmet from 'react-helmet';

export default class Layout extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired
  };

  render() {
    return (
      <div>
        <Helmet
          title="fundo"
          meta={[
            { name: 'description', content: 'Intelligent Event Recommendations' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' }
          ]}
        />
        {this.props.children}
      </div>
    );
  }
}

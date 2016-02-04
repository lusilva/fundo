/* global React */

const { Styles, Utils } = MaterialUI;
const { ThemeManager } = Styles;


const { Colors, Spacing, zIndex } = Styles;

let MyRawTheme = {
    spacing: Spacing,
    zIndex: zIndex,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        primary1Color: Colors.cyan500,
        primary2Color: Colors.cyan700,
        primary3Color: Colors.lightBlack,
        accent1Color: Colors.pinkA200,
        accent2Color: Colors.grey100,
        accent3Color: Colors.grey500,
        textColor: Colors.darkBlack,
        alternateTextColor: Colors.white,
        canvasColor: Colors.white,
        borderColor: Colors.grey300,
        disabledColor: Utils.ColorManipulator.fade(Colors.darkBlack, 0.3),
        pickerHeaderColor: Colors.cyan500
    }
};


Layout = React.createClass({
    childContextTypes: {
        muiTheme: React.PropTypes.object
    },

    getChildContext() {
        return {
            muiTheme: ThemeManager.getMuiTheme(MyRawTheme, {userAgent: 'all'})
        };
    },

    render() {
        return (
            <html>
            <head>
                <title>fundo - Event Recommendation Made Easy</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link href='https://fonts.googleapis.com/css?family=Roboto:400,300,500' rel='stylesheet'
                      type='text/css'/>
            </head>
            <body>
                {this.props.children}
            </body>
            </html>
        );
    }
});


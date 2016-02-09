const { Styles, Utils } = mui;
const { Colors, Spacing, zIndex} = Styles;

/**
 * The main theme for the entire application.
 */
export default {
    spacing: Spacing,
    zIndex: zIndex,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        // #5c6bc0
        primary1Color: Colors.indigo400,
        primary2Color: Colors.deepPurple400,
        primary3Color: Colors.white,
        accent1Color: Colors.yellow500,
        accent2Color: Colors.indigo600,
        accent3Color: Colors.grey500,
        textColor: Colors.indigo900,
        alternateTextColor: Colors.yellow500,
        canvasColor: Colors.yellow50,
        borderColor: Colors.deepPurple300,
        disabledColor: Utils.ColorManipulator.fade(Colors.deepPurple700, 0.6),
        pickerHeaderColor: Colors.cyan500
    }
};
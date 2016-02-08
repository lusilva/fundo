const { Styles, Utils } = mui;
const { Colors, Spacing, zIndex} = Styles;

export default {
    spacing: Spacing,
    zIndex: zIndex,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        //#512da8
        primary1Color: Colors.deepPurple700,
        primary2Color: Colors.deepPurple900,
        primary3Color: Colors.yellow50,
        accent1Color: Colors.yellow500,
        accent2Color: Colors.deepPurple100,
        accent3Color: Colors.grey500,
        textColor: Colors.purple800,
        alternateTextColor: Colors.yellow500,
        canvasColor: Colors.yellow50,
        borderColor: Colors.deepPurple300,
        disabledColor: Utils.ColorManipulator.fade(Colors.deepPurple700, 0.6),
        pickerHeaderColor: Colors.cyan500
    }
};
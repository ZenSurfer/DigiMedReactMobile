#REACT NATIVE 0.33.0

file:node_modules/react-native-bcrypt/dist/bcrypt.js
line:50
    var bcrypt = {};
    +var _ = require('lodash');

line:68
    function random(len) {
        /* fallback */
        if (!randomFallback) {
            console.warn("Using Math.random is not cryptographically secure! Use bcrypt.setRandomFallback to set a PRNG.");
            var buf = new Uint8Array(len);
            -return buf.map((item) => Math.floor(Math.random() * (256 - 1 + 1) + 1));
            +return _.map(buf, (v, i) => {
            +    return Math.floor(Math.random() * (256 - 1 + 1) + 1);
            +});
        }
        return randomFallback(len);
    }

file:node_modules/react-native-chart-android/android/src/main/java/cn/mandata/react_native_mpchart/MPBarLineChartManager.java  
line:176

    public  void  setYAxisLeft(BarLineChartBase chart,ReadableMap v){
        AxisBase x= chart.getAxisLeft();
        setAxisInfo(x,v);
        setYAxisInfo((YAxis) x, v);
        +if(v.getMap("max")!=null){
        +    setAxisLimit(x, v.getMap("max"));
        +}
        +if(v.getMap("min")!=null){
        +    setAxisLimit(x, v.getMap("min"));
        +}
    }

file:node_modules/react-native/Libraries/Components/StatusBar/StatusBar.js  
line:144

    static _defaultProps = createStackEntry({
        animated: false,
        showHideTransition: 'fade',
        -backgroundColor: '',
        +backgroundColor: '#2979FF',
        barStyle: 'default',
        translucent: false,
        hidden: false,
        networkActivityIndicatorVisible: false,
    });

file:node_modules/react-native/Libraries/Components/TextInput/TextInput.js  
line:676

    const textContainer =
    <AndroidTextInput
        ref="input"
        {...props}
        mostRecentEventCount={0}
        onFocus={this._onFocus}
        onBlur={this._onBlur}
        onChange={this._onChange}
        onSelectionChange={onSelectionChange}
        onTextInput={this._onTextInput}
        text={this._getText()}
        children={children}
        +underlineColorAndroid={(this.props.underlineColorAndroid) ? this.props.underlineColorAndroid : '#757575'}
    />;

## REVISION 10-14-2016

Initial commit for beta testing.

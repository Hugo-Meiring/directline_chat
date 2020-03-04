/**
 * @format
 */

import {AppRegistry, YellowBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

/**
 * Disabling warnings isn't to be take lightly. However these startup warnings cause irritation and add little value
 */
console.disableYellowBox = true


AppRegistry.registerComponent(appName, () => App);

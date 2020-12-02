import React, {Component} from 'react';
import Navigator from './src/navigation/index';
import {Provider} from 'react-redux';
import {store} from './src/redux/store/index';

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Navigator />
      </Provider>
    );
  }
}

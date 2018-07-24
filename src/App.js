import React from 'react';
import { AsyncStorage } from 'react-native';
import { ThemeProvider } from 'styled-components';
import theme from './utils/design/theme';
import { createRootNavigator } from './navigation/Router';
import Provider from './Context';
console.disableYellowBox = true;

type State = {
  token: '',
};

class ThemedApp extends React.Component<*, State> {
  state = {
    token: '',
    tokenRetrieved: false,
  };

  componentWillMount() {
    // AsyncStorage.clear();
    AsyncStorage.getItem('token').then(value => {
      this.setState({
        token: value,
        tokenRetrieved: true,
      });
    });
  }

  render() {
    const { token, tokenRetrieved } = this.state;

    const Launch = createRootNavigator(token);
    return (
      <ThemeProvider theme={theme}>
        <Provider>{tokenRetrieved ? <Launch /> : null}</Provider>
      </ThemeProvider>
    );
  }
}

export default ThemedApp;

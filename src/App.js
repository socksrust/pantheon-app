import React from 'react';
import { AsyncStorage, StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components';
import theme from './utils/design/theme';
import { createRootNavigator } from './navigation/Router';
import Provider from './Context';
console.disableYellowBox = true;

type State = {
  token: '',
  isTokenRetrieved: boolean,
};

class ThemedApp extends React.Component<*, State> {
  state = {
    token: '',
    isTokenRetrieved: false,
  };

  componentWillMount() {
    //AsyncStorage.clear();
    AsyncStorage.getItem('token').then(value => {
      this.setState({
        token: value,
        isTokenRetrieved: true,
      });
    });
  }

  render() {
    const { token, isTokenRetrieved } = this.state;

    const Launch = createRootNavigator(token);
    return (
      <ThemeProvider theme={theme}>
        <Provider>
          <StatusBar backgroundColor="rgb(56,101,249)" barStyle="light-content" />
          {isTokenRetrieved ? <Launch /> : null}
        </Provider>
      </ThemeProvider>
    );
  }
}

export default ThemedApp;

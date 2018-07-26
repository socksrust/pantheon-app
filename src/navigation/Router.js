// @flow
import { Dimensions } from 'react-native';
import { createStackNavigator, createDrawerNavigator, createSwitchNavigator } from 'react-navigation';
//ROUTES HELPER
import { ROUTENAMES } from './RouteNames';
// Authentications
import AuthScreen from '../screens/Auth/AuthScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';
// Logged Screens
import EventsScreen from '../screens/Events/EventsScreen';
import EventAdd from '../screens/Event/EventAdd';
import EventDetails from '../screens/Event/EventDetails';

const NonLoggedAppRouter = createStackNavigator(
  {
    [ROUTENAMES.AUTH]: { screen: AuthScreen },
    [ROUTENAMES.LOGIN]: { screen: LoginScreen },
    [ROUTENAMES.REGISTER]: { screen: RegisterScreen },
  },
  {
    initialRouteName: ROUTENAMES.AUTH,
    navigationOptions: {
      header: null,
    },
  },
);

const EventRouters = createStackNavigator(
  {
    [ROUTENAMES.EVENTS]: { screen: EventsScreen },
    [ROUTENAMES.EVENT_ADD]: { screen: EventAdd },
    [ROUTENAMES.EVENT_DETAILS]: { screen: EventDetails },
  },
  {
    navigationOptions: {
      header: null,
    },
  },
);

const { width, height } = Dimensions.get('screen');
const LoggedAppRouter = createDrawerNavigator(
  {
    [ROUTENAMES.EVENTS]: EventRouters,
  },
  {
    initialRouteName: ROUTENAMES.EVENTS,
    navigationOptions: {
      header: null,
    },
    drawerWidth: Math.min(height, width) * 0.6,
  },
);

export const createRootNavigator = (token: string) =>
  createSwitchNavigator(
    {
      [ROUTENAMES.LOGGED_APP]: LoggedAppRouter,
      [ROUTENAMES.NON_LOGGED_APP]: NonLoggedAppRouter,
    },
    {
      initialRouteName: token ? ROUTENAMES.LOGGED_APP : ROUTENAMES.NON_LOGGED_APP,
    },
  );

// @flow

import React, { Component } from 'react';
import { AsyncStorage, Animated, Keyboard, Platform } from 'react-native';

import styled from 'styled-components/native';
import { withNavigation } from 'react-navigation';

import Header from '../../components/common/Header';
import Button from '../../components/Button';
import Input from '../../components/Input';
import CustomKeyboard from '../../components/CustomKeyboard';
import LoginMutation from './LoginEmailMutation';

import { IMAGES } from '../../utils/design/images';
import { ROUTENAMES } from '../../navigation/RouteNames';
import GradientWrapper from '../../components/GradientWrapper';
import { withContext } from '../../Context';

/* @todo - We'll use this later!
const ForgotText = styled.Text`
  color: ${props => props.theme.colors.secondaryColor};
  font-weight: bold;
  font-size: 20px;
  text-align: right;
`;*/

const ContentWrapper = styled.View`
  z-index: 3;
  flex: 1;
`;

const FormWrapper = styled(Animated.View)``;

const ForgotButton = styled.TouchableOpacity`
`;

const LoginText = styled(Animated.Text)`
  color: ${props => props.theme.colors.secondaryColor};  
  font-size: 36px;
  font-weight: bold;
`;

const ButtonsWrapper = styled(Animated.View)``;

const BottomFixedReactLogo = styled.Image.attrs({
  source: IMAGES.REACT,
})`
  width: 303;
  height: 271.39;
  position: absolute;
  right: -100;
  bottom: -90;
  tint-color: rgba(0,0,0,0.1);
  z-index: 1;
`;

const ButtonText = styled.Text`
  color: ${props => (!props.error ? props.theme.colors.primaryColor : props.theme.colors.errorViewColor)};
  font-size: 24px;
  font-weight: bold
`;

const Arrow = styled.Image.attrs({
  source: IMAGES.ARROW,
})`
  width: 30;
  height: 24;
  margin-top: 5;
  tint-color: ${props => props.theme.colors.secondaryColor};
`;

type Props = {
  navigation: Object,
  context: Object,
};

type State = {
  email: string,
  password: string,
  errorText: string,
};

@withNavigation class LoginScreen extends Component<Props, State> {
  state = {
    loginTextDisplayType: 'flex',
    email: '',
    password: '',
    errorText: '',
  };

  constructor(props) {
    super(props);

    this.buttonWrapperMarginTop = new Animated.Value(84);
    this.formWrapperMarginTop = new Animated.Value(36);
    this.loginTextVisibility = new Animated.Value(1);
  }

  componentWillMount() {
    if (Platform.OS === 'ios') {
      this.keyboardWillShowSubscription = Keyboard.addListener('keyboardWillShow', this.onKeyboardShow);
      this.keyboardWillHideSubscription = Keyboard.addListener('keyboardWillHide', this.onKeyboardHide);
    } else {
      this.keyboardDidShowSubscription = Keyboard.addListener('keyboardDidShow', this.onKeyboardShow);
      this.keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide', this.onKeyboardHide);
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'ios') {
      this.keyboardWillShowSubscription.remove();
      this.keyboardWillHideSubscription.remove();
    } else {
      this.keyboardDidShowSubscription.remove();
      this.keyboardDidHideSubscription.remove();
    }
  }

  onKeyboardShow = () => {
    Animated.parallel([
      Animated.timing(this.loginTextVisibility, {
        duration: 200,
        toValue: 0,
      }),

      Animated.timing(this.buttonWrapperMarginTop, {
        duration: 200,
        toValue: Platform.OS === 'ios' ? 36 : 18,
      }),
    ]).start();

    this.setState(
      {
        loginTextDisplayType: 'none',
      },
      () => {
        Animated.timing(this.formWrapperMarginTop, {
          duration: 200,
          toValue: -5,
        }).start();
      },
    );
  };

  onKeyboardHide = () => {
    Animated.parallel([
      Animated.timing(this.loginTextVisibility, {
        duration: 200,
        toValue: 1,
      }),

      Animated.timing(this.buttonWrapperMarginTop, {
        duration: 200,
        toValue: 64,
      }),
    ]).start();

    this.setState(
      {
        loginTextDisplayType: 'flex',
      },
      () => {
        Animated.timing(this.formWrapperMarginTop, {
          duration: 200,
          toValue: 36,
        }).start();
      },
    );
  };

  handleLoginPress = async () => {
    const { email, password } = this.state;
    const { navigation } = this.props;

    if (!email || !password) {
      this.props.context.openModal('Favor preencher todos os campos');
    }

    const input = {
      email,
      password,
    };

    const onCompleted = async res => {
      const response = res && res.LoginEmail;
      const token = response && response.token;
      if (response && response.error) {
        this.props.context.openModal(response.error);
      } else if (token) {
        this.props.context.openSuccessModal('Você logou com sucesso');
        await AsyncStorage.setItem('token', token);
        navigation.navigate(ROUTENAMES.LOGGED_APP);
      }
    };

    const onError = () => {
      this.setState({
        errorText: 'Verifique sua conexão com a internet e tente novamente',
      });
    };

    LoginMutation.commit(input, onCompleted, onError);
  };

  closeModal = () => {
    this.setState({
      errorText: '',
    });
  };

  render() {
    const { navigation, context } = this.props;
    const { loginTextDisplayType } = this.state;
    const { errorText } = context;

    return (
      <CustomKeyboard>
        <GradientWrapper error={errorText ? true : false}>
          <Header>
            <ForgotButton onPress={() => navigation.pop()}>
              <Arrow />
            </ForgotButton>
          </Header>
          <ContentWrapper>
            <LoginText style={{ display: loginTextDisplayType, opacity: this.loginTextVisibility }}>Login</LoginText>
            <FormWrapper style={{ marginTop: this.formWrapperMarginTop }}>
              <Input placeholder="Email" autoCorrect={false} onChangeText={text => this.setState({ email: text })} />
              <Input placeholder="Password" secureTextEntry onChangeText={text => this.setState({ password: text })} />
            </FormWrapper>
            <ButtonsWrapper style={{ marginTop: this.buttonWrapperMarginTop }}>
              <Button fill onPress={this.handleLoginPress}>
                <ButtonText error={errorText ? true : false}>Login</ButtonText>
              </Button>
            </ButtonsWrapper>
          </ContentWrapper>
          <BottomFixedReactLogo />
        </GradientWrapper>
      </CustomKeyboard>
    );
  }
}

export default withContext(LoginScreen);

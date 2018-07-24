// @flow

import React, { Component } from 'react';
import { AsyncStorage, Animated, Keyboard } from 'react-native';
import styled from 'styled-components/native';
import { withNavigation } from 'react-navigation';
import { withContext } from '../../Context';
import type { ContextType } from '../../Context';

import Header from '../../components/common/Header';
import Button from '../../components/Button';
import Input from '../../components/Input';
import CustomKeyboard from '../../components/CustomKeyboard';

import RegisterMutation from './RegisterEmailMutation';

import { IMAGES } from '../../utils/design/images';
import { ROUTENAMES } from '../../navigation/RouteNames';
import GradientWrapper from '../../components/GradientWrapper';

const ForgotButton = styled.TouchableOpacity`
`;

const CreateAccountText = styled(Animated.Text)`
  color: white;
  font-weight: 800;
  padding-top: 12px;
`;

const ForgotText = styled.Text`
  color: ${props => props.theme.colors.secondaryColor};
  font-weight: bold;
  font-size: 20px;
  text-align: right;
`;

const ButtonsWrapper = styled.View`
  flex: 1;
  justify-content: center;
  z-index: 3;
`;

const ButtonText = styled.Text`
  color: ${props => (!props.error ? props.theme.colors.primaryColor : props.theme.colors.errorViewColor)};
  font-size: 24px;
  font-weight: bold
`;

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
  context: ContextType,
};

type State = {
  name: string,
  email: string,
  password: string,
  errorText: string,
};

@withNavigation class RegisterScreen extends Component<Props, State> {
  state = {
    name: '',
    email: '',
    password: '',
    errorText: '',
  };

  constructor(props) {
    super(props);

    this.createAccountTextSize = new Animated.Value(36);
  }

  componentWillMount() {
    this.keyboardWillShowSubscription = Keyboard.addListener('keyboardWillShow', this.onKeyboardWillShow);
    this.keyboardWillHideSubscription = Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide);
  }

  componentWillUnmount() {
    this.keyboardWillShowSubscription.remove();
    this.keyboardWillHideSubscription.remove();
  }

  onKeyboardWillShow = event => {
    const shrunkCreateAccountTextSize = this.createAccountTextSize._value / 2;

    Animated.timing(this.createAccountTextSize, {
      duration: event.duration,
      toValue: shrunkCreateAccountTextSize,
    }).start();
  };

  onKeyboardWillHide = event => {
    const expandedCreateAccountText = this.createAccountTextSize._value * 2;

    Animated.timing(this.createAccountTextSize, {
      duration: event.duration,
      toValue: expandedCreateAccountText,
    }).start();
  };

  handleRegisterPress = async () => {
    const { name, email, password } = this.state;
    const { navigation, context } = this.props;

    if (!name || !email || !password) {
      context.openModal('Preencha todos os campos!');
    }

    const input = {
      name,
      email,
      password,
    };

    const onCompleted = async res => {
      const response = res && res.RegisterEmail;
      const token = response && response.token;
      if (response && response.error) {
        return context.openModal(response.error);
      } else if (token) {
        this.props.context.openSuccessModal('Você cadastrou com sucesso');
        await AsyncStorage.setItem('token', token);
        navigation.navigate(ROUTENAMES.LOGGED_APP);
      }
    };

    const onError = () => {
      return context.openModal('Verifique sua conexão com a internet e tente novamente');
    };

    RegisterMutation.commit(input, onCompleted, onError);
  };

  render() {
    const { navigation, context } = this.props;
    const { errorText } = context;

    return (
      <CustomKeyboard>
        <GradientWrapper error={errorText ? true : false}>
          <Header>
            <ForgotButton onPress={() => navigation.pop()}>
              <Arrow />
            </ForgotButton>
            <ForgotButton onPress={() => navigation.navigate(ROUTENAMES.LOGIN)}>
              <ForgotText>Login</ForgotText>
            </ForgotButton>
          </Header>

          <CreateAccountText style={{ fontSize: this.createAccountTextSize }}>
            Create an Account
          </CreateAccountText>

          <Input autoCorrect={false} placeholder="Name" onChangeText={text => this.setState({ name: text })} />
          <Input autoCorrect={false} placeholder="Email" onChangeText={text => this.setState({ email: text })} />
          <Input placeholder="Password" secureTextEntry onChangeText={text => this.setState({ password: text })} />

          <ButtonsWrapper>
            <Button fill onPress={this.handleRegisterPress}>
              <ButtonText error={errorText ? true : false}>
                Create an Account
              </ButtonText>
            </Button>
          </ButtonsWrapper>
          <BottomFixedReactLogo />
        </GradientWrapper>
      </CustomKeyboard>
    );
  }
}

export default withContext(RegisterScreen);

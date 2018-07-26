// @flow

import React, { Component } from 'react';
import { AsyncStorage, Animated, Keyboard, Platform } from 'react-native';
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

const ForgotButton = styled.TouchableOpacity``;

const CreateAccountText = styled(Animated.Text)`
  color: ${props => props.theme.colors.secondaryColor};  
  font-weight: 800;
  font-size: 36px;
`;

const ForgotText = styled.Text`
  color: ${props => props.theme.colors.secondaryColor};
  font-weight: bold;
  font-size: 20px;
  text-align: right;
`;

const ContentWrapper = styled.View`
  z-index: 3;  
  flex: 1;
`;

const FormWrapper = styled(Animated.View)``;

const ButtonsWrapper = styled(Animated.View)`
  flex: 1;
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
    createAccountTextDisplayType: 'flex',
    nameFieldDisplayType: 'flex',
    emailFieldDisplayType: 'flex',
    passwordFieldDisplayType: 'flex',
    isEmailOrPasswordFieldFocused: false,
    isEmailFieldFocused: false,
    isPasswordFieldFocused: false,
    isNameFieldFocused: false,
    errorText: '',
    password: '',
    email: '',
    name: '',
  };

  constructor(props) {
    super(props);

    this.createAccountTextVisibility = new Animated.Value(1);
    this.buttonWrapperMarginTop = new Animated.Value(54);
    this.formWrapperMarginTop = new Animated.Value(18);
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
    this.handleFormFocusFieldsState();

    Animated.parallel([
      Animated.timing(this.createAccountTextVisibility, {
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
        createAccountTextDisplayType: 'none',
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
      Animated.timing(this.createAccountTextVisibility, {
        duration: 200,
        toValue: 1,
      }),

      Animated.timing(this.buttonWrapperMarginTop, {
        duration: 200,
        toValue: 54,
      }),
    ]).start();

    this.setState(
      {
        createAccountTextDisplayType: 'flex',
        passwordFieldDisplayType: 'flex',
        emailFieldDisplayType: 'flex',
        nameFieldDisplayType: 'flex',
      },
      () => {
        Animated.timing(this.formWrapperMarginTop, {
          duration: 200,
          toValue: 18,
        }).start();
      },
    );
  };

  onFocusNameField = () => {
    this.setState({
      isNameFieldFocused: true,
      isPasswordFieldFocused: false,
      isEmailFieldFocused: false,
      passwordFieldDisplayType: 'none',
    });
  };

  onFocusEmailField = () => {
    const { name } = this.state;

    const nameFieldDisplayType = !name ? 'flex' : 'none';
    const passwordFieldDisplayType = !name ? 'none' : 'flex';

    this.setState({
      isEmailFieldFocused: true,
      isPasswordFieldFocused: false,
      isNameFieldFocused: false,
      passwordFieldDisplayType,
      nameFieldDisplayType,
    });
  };

  onFocusPasswordField = () => {
    this.setState({
      isPasswordFieldFocused: true,
      isEmailFieldFocused: false,
      isNameFieldFocused: false,
      nameFieldDisplayType: 'none',
    });
  };

  handleFormFocusFieldsState = () => {
    const { isNameFieldFocused, isEmailFieldFocused, isPasswordFieldFocused } = this.state;

    if (isNameFieldFocused) {
      this.onFocusNameField();
    }

    if (isEmailFieldFocused) {
      this.onFocusEmailField();
    }

    if (isPasswordFieldFocused) {
      this.onFocusPasswordField();
    }
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
    const { onFocusPasswordField, onFocusEmailField, onFocusNameField, state, props } = this;

    const {
      createAccountTextDisplayType,
      nameFieldDisplayType,
      emailFieldDisplayType,
      passwordFieldDisplayType,
    } = state;

    const { navigation, context } = props;
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
          <ContentWrapper>
            <CreateAccountText
              style={{ display: createAccountTextDisplayType, opacity: this.createAccountTextVisibility }}
            >
              Create Account
            </CreateAccountText>
            <FormWrapper>
              <Input
                style={{ display: nameFieldDisplayType }}
                onFocus={onFocusNameField}
                autoCorrect={false}
                placeholder="Name"
                onChangeText={text => this.setState({ name: text })}
              />
              <Input
                style={{ display: emailFieldDisplayType }}
                onFocus={onFocusEmailField}
                autoCorrect={false}
                placeholder="E-mail"
                onChangeText={text => this.setState({ email: text })}
              />
              <Input
                style={{ display: passwordFieldDisplayType }}
                onFocus={onFocusPasswordField}
                secureTextEntry
                placeholder="Password"
                onChangeText={text => this.setState({ password: text })}
              />
            </FormWrapper>
            <ButtonsWrapper style={{ marginTop: this.buttonWrapperMarginTop }}>
              <Button fill onPress={this.handleRegisterPress}>
                <ButtonText error={errorText ? true : false}>
                  Create
                </ButtonText>
              </Button>
            </ButtonsWrapper>
          </ContentWrapper>
          <BottomFixedReactLogo />
        </GradientWrapper>
      </CustomKeyboard>
    );
  }
}

export default withContext(RegisterScreen);

// @flow

import React, { Component } from 'react';

import styled from 'styled-components/native';
import { withNavigation } from 'react-navigation';

import Button from '../../components/Button';
import { IMAGES } from '../../utils/design/images';
import { ROUTENAMES } from '../../navigation/RouteNames';
import GradientWrapper from '../../components/GradientWrapper';

const TextWrapper = styled.View`
  flex: 2;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const ButtonsWrapper = styled.View`
  flex: 3;
  justify-content: center;
`;

const ButtonText = styled.Text`
  color: ${props => (props.fill ? props.theme.colors.primaryColor : props.theme.colors.secondaryColor)};
  font-size: 20px;
  font-weight: 600;
`;

const PantheonLogo = styled.Image.attrs({
  source: IMAGES.LOGO,
})`
  width: 150px;
  height: 150px;
`;

type Props = {};

type State = {};

class AuthScreen extends Component<Props, State> {
  render() {
    const { navigation } = this.props;

    return (
      <GradientWrapper>
        <TextWrapper>
          <PantheonLogo />
        </TextWrapper>
        <ButtonsWrapper>
          <Button onPress={() => navigation.navigate(ROUTENAMES.REGISTER)}>
            <ButtonText>Create an Account</ButtonText>
          </Button>
          <Button fill onPress={() => navigation.navigate(ROUTENAMES.LOGIN)}>
            <ButtonText fill>Login</ButtonText>
          </Button>
        </ButtonsWrapper>
      </GradientWrapper>
    );
  }
}

export default withNavigation(AuthScreen);

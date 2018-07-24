// @flow

import React from 'react';
import styled from 'styled-components/native';

const InputWrapper = styled.View`  
  border-bottom-color: ${props => props.theme.colors.secondaryColor};
  border-bottom-width: 2.5;
`;

const RegisterTextInput = styled.TextInput.attrs({
  placeholderTextColor: props => props.theme.colors.secondaryColor,
  underlineColorAndroid: 'rgba(0,0,0,0)',
  selectionColor: props => props.theme.colors.secondaryColor,
  autoCapitalize: 'none',
})`
  height: 40;
  width: 100%;
  font-size: 20;
  margin-top: 28px;
  color: white;  
`;

type Props = {
  name?: string,
  placeholder?: string,
  value?: string,
  onChangeText?: string => void,
  secureTextEntry?: boolean,
};

const Input = (props: Props) => (
  <InputWrapper {...props}>
    <RegisterTextInput {...props} />
  </InputWrapper>
);

export default Input;

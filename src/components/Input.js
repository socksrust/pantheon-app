// @flow

import React from 'react';
import styled from 'styled-components/native';

const RegisterTextInput = styled.TextInput.attrs({
  placeholderTextColor: props => props.theme.colors.secondaryColor,
  underlineColorAndroid: props => props.theme.colors.secondaryColor,
  selectionColor: props => props.theme.colors.secondaryColor,
  autoCapitalize: 'none',
})`
  height: 50;
  width: 100%;
  font-size: 22;
  color: white;
`;

type Props = {
  name?: string,
  placeholder?: string,
  value?: string,
  onChangeText?: string => void,
  secureTextEntry?: boolean,
};

const Input = (props: Props) => <RegisterTextInput {...props} />;

export default Input;

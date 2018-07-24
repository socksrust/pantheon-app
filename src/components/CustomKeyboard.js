import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components/native';

const Wrapper = styled(KeyboardAvoidingView).attrs({
  behavior: Platform.OS === 'ios' ? 'padding' : 'height',
  scrollEnabled: false,
})`
  flex: 1;
`;

type Props = {
  children?: any,
};

const CustomKeyboard = (props: Props) => (
  <Wrapper>
    {props.children}
  </Wrapper>
);

export default CustomKeyboard;

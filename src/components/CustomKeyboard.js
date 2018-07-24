import React from 'react';
import { KeyboardAvoidingView } from 'react-native';
import styled from 'styled-components/native';

const Wrapper = styled(KeyboardAvoidingView).attrs({
  scrollEnabled: false,
  behavior: 'padding',
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

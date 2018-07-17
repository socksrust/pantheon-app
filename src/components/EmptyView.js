// @flow
import * as React from 'react';
import styled from 'styled-components/native';

const Wrapper = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-top: 50%;
`;

const EmptyText = styled.Text`
  font-size: 15px;
  color: ${props => props.theme.colors.primaryColor};
  font-weight: bold;
`;


type Props = {
  text: string,
};

const EmptyView = ({text}: Props) => (
  <Wrapper>
    <EmptyText>{text}</EmptyText>
  </Wrapper>
)

export default EmptyView;
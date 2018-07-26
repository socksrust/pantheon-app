import React from 'react';
import { Platform } from 'react-native';
import styled, { css } from 'styled-components/native';
import { IMAGES } from '../utils/design/images';

const Wrapper = styled.TouchableOpacity`
${Platform.select({ ios: css`
      shadow-color: grey;
      shadow-offset: 0px 0px;
      shadow-radius: 2px;
      shadow-opacity: 2px;`, android: css`
      elevation: 5;
` })};
  align-items: center;
  justify-content: center;
  width: 60;
  height: 60;
  position: absolute;
  top: 25;
  `;

const Icon = styled.Image.attrs({
  source: IMAGES.MENU,
})`
    width: 35;
    height: 35;
    tint-color: white;
  `;

type Props = {};

const MenuButton = (props: Props) => (
  <Wrapper {...props}>
    <Icon />
  </Wrapper>
);

export default MenuButton;

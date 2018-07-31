import * as React from 'react';
import styled, { css } from 'styled-components/native';
import { Platform } from 'react-native';

const Wrapper = styled.ImageBackground`
  margin-horizontal: 20;
  margin-top: 20;
  overflow: hidden;
  border-radius: 20;
  ${Platform.select({ ios: css`
      shadow-color: grey;
      shadow-offset: 0px 0px;
      shadow-radius: 2px;
      shadow-opacity: 2px;`, android: css`
        elevation: 5;
  ` })};
  height: 90px;
  width: 100%;
`;

const CardDescription = styled.Text`
  font-size: 14;
  color: white;
  font-weight: bold;
  background-color: transparent;
  margin-bottom: 5;
  margin-left: 5;
`;

const CardTitle = styled.Text`
  font-size: 16;
  font-weight: bold;
  color: white;
  margin-bottom: 5;
  margin-left: 5;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ButtonContainer = styled.View`
  flex-direction: column;
`;

const TextContainer = styled.View`
  flex-direction: column
`;

const ReadButton = styled.TouchableOpacity`
  padding-vertical: 5;
  padding-horizontal: 20;
  align-items: center;
  justify-content: center;
  border-radius: 20;
  background-color: white;
`;

const ButtonText = styled.Text`
  font-size: 15;
  font-weight: 800;
  color: #4f4e4e;
`;

const UserImage = styled.Image`
  width: 30;
  height: 30;
  border-radius: 15;
  border-color: white;
  border-width: 2px;
  margin-left: ${props => props.invading};
`;

const UserInitials = styled.View`
  width: 30;
  height: 30;
  border-radius: 15;
  border: 2px solid white;
  margin-left: ${props => props.invading};
  background-color: ${props => props.theme.colors.primaryColor};
  align-items: center;
  justify-content: center;

`;

const Initials = styled.Text`
  font-size: 10;
  color: white;
  font-weight: bold;
`;

const Atendees = styled.View`
  margin-left: 10;  
  flex-direction: row;
  align-items: center;
`;

const AtendeesNumber = styled.View`
  padding-vertical: 5;
  padding-horizontal: 15;
  align-items: center;
  justify-content: center;
  border-radius: 20;
  background-color: white;
  margin-left: 10;
`;

const AtendeesNumberText = styled.Text`
  font-size: 15;
  color: black;
`;

type User = {
  image: string,
  name: string,
};

type Props = {
  atendees: Array<User>,
  title: string,
  description: string,
  bgImage: string,
  seeButtonAction: () => void,
};

const EventCard = ({
  atendees,
  title,
  description,
  bgImage,
  seeButtonAction,
}: Props) => {
  const atendeesThumbs = atendees.slice(0, 3);
  return (
    <Wrapper
      source={{
        uri: bgImage,
      }}
    >
    </Wrapper>
  );
};

export default EventCard;

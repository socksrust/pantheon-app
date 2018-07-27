// @flow

import * as React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { getStatusText, getStatusColor } from '../../utils/design/statusStyle';

import { IMAGES } from '../../utils/design/images';

const CardContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.cardColor};
  border-radius: 8px;
  padding: 14px;
  margin: 4px 8px;
`;

const ContentWrapper = styled.View`
  flex-direction: row;
`;

const LineSeparator = styled.View`
  background-color: ${({ theme }) => theme.colors.gray};
  margin: 8px 14px 0 14px;
  height: 100;
  width: 1.5;
`;

const InfoWrapper = styled.View`
  width: 70%;
`;

const Date = styled.Text`
  align-self: center;
  color: ${({ theme }) => theme.colors.darkText};  
  fontSize: 18px;
  font-weight: 900;
`;

const Title = styled.Text.attrs({
  numberOfLines: 1,
})`
  color: ${({ theme }) => theme.colors.darkText};
  padding: 10px 0 4px 0;
  font-size: 18px;
  font-weight: 900;
`;

const AddressWrapper = styled.View`  
  flex-direction: row;  
`;

const Address = styled.Text.attrs({
  numberOfLines: 2,
})`
  flex: 1;
  color: ${({ theme }) => theme.colors.darkText};
  padding: 0 0 8px 0;
  font-weight: 600;
  font-size: 13px;
`;

const MapMarkerIcon = styled.Image.attrs({
  source: IMAGES.MAP_MARKER,
})`
  tint-color: ${({ theme }) => theme.colors.ownerColor};  
  width: 18;
  height: 18;
  left: -3;
`;

const BottomWrapper = styled.View`
  padding-top: 4px;  
`;

const StatusWrapper = styled.View`
  border-radius: 20px;
  align-items: center;
  border: 1.5px solid;  
  width: 70%;
  background: ${({ theme }) => theme.colors.transparent}
  border-color: ${props => getStatusColor(props)}
`;

const Status = styled.Text`
  font-weight: 800;
  font-size: 13px;
  margin: 4px 8px;
  color: ${props => getStatusColor(props)}
`;

const LearnMoreButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.ownerColor};
  align-self: flex-end;
  justify-content: center;
  align-items: center;
  border-radius: 30;
  height: 56;
  width: 56;
`;

const ArrowIcon = styled.Image.attrs({
  source: IMAGES.ARROW_RIGHT,
})`
  tint-color: ${({ theme }) => theme.colors.secondaryColor};  
  width: 24;
  height: 24;
`;

type User = {
  image: string,
  name: string,
};

type Props = {
  atendees: Array<User>,
  title: string,
  address: string,
  date: string,
  isEventAttended: boolean,
  isOwner: boolean,
  showEventDetails: () => void,
};

const renderBottomWrapper = showEventDetails => (
  <BottomWrapper>
    <LearnMoreButton onPress={showEventDetails}>
      <ArrowIcon />
    </LearnMoreButton>
  </BottomWrapper>
);

const renderStatus = (isOwner, isConfirmed, isPending) => (
  <StatusWrapper isOwner={isOwner} isConfirmed={isConfirmed} isPending={isPending}>
    <Status isOwner={isOwner} isConfirmed={isConfirmed} isPending={isPending}>
      {getStatusText(isOwner, isConfirmed, isPending)}
    </Status>
  </StatusWrapper>
);

const renderAddressEvent = address => (
  <AddressWrapper>
    <MapMarkerIcon />
    <Address>
      {address}
    </Address>
  </AddressWrapper>
);

const EventListItem = ({ title, address, date, showEventDetails, isOwner, isEventAttended }: Props) => {
  const isOwnerValue = isOwner === 'true';
  const isConfirmed = isEventAttended;
  const isPending = !isEventAttended;
  console.log(date);
  return (
    <CardContainer>
      <ContentWrapper>
        <Date>
          {moment(date).format('DD[\n]MMM[\n]YYYY')}
        </Date>
        <LineSeparator />
        <InfoWrapper>
          <Title>
            {title}
          </Title>
          {renderAddressEvent(address)}
          {renderStatus(isOwnerValue, isConfirmed, isPending)}
        </InfoWrapper>
      </ContentWrapper>
      {renderBottomWrapper(showEventDetails)}
    </CardContainer>
  );
};

export default EventListItem;

import React, { Component } from 'react';
import { ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { withNavigation } from 'react-navigation';
import { createFragmentContainer, graphql } from 'react-relay';
import DatePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import idx from 'idx';

import AttendToEventMutation from './AttendToEventMutation';
import CantGoToEventMutation from './CantGoToEventMutation';
import EventAddMutation from './EventAddMutation';
import EventEditMutation from './EventEditMutation';

import type { ContextType } from '../../Context';
import { IMAGES } from '../../utils/design/images';
import { createQueryRenderer } from '../../relay/RelayUtils';
import { withContext } from '../../Context';
import { ROUTENAMES } from '../../navigation/RouteNames';
import LocationPicker from '../../components/LocationPicker';

const { width } = Dimensions.get('window');

const Container = styled(LinearGradient).attrs({
  colors: ['rgb(41, 123, 247)', '#651FFF'],
  start: { x: 0.0, y: 0.25 },
  end: { x: 0.5, y: 1.0 },
})`
  flex: 1;
`;

const Wrapper = styled.View`
  flex: 1;
  margin: 26px 16px 16px 16px;
`;

const HeaderContainer = styled.View`
  justify-content: center;
  margin: 12px 0 0 0;
  height: 50;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;  
  align-items: center;
`;

const HeaderButton = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
`;

const ArrowBackIcon = styled.Image.attrs({
  source: IMAGES.ARROW,
})`
  tint-color: ${({ theme }) => theme.colors.secondaryColor};
  width: 29;
  height: 24;
`;

const EditIcon = styled.Image.attrs({
  source: IMAGES.EDIT,
})`
  tint-color: ${({ theme }) => theme.colors.secondaryColor};  
  width: 24;
  height: 24;
`;

const EventTextInput = styled.TextInput.attrs({
  selectionColor: ({ theme }) => theme.colors.secondaryColor,
  multiline: true,
})`
  color: ${({ theme }) => theme.colors.secondaryColor};
  font-size: ${({ featured }) => (featured ? '28px' : '24px')};
  margin-top: ${({ featured }) => (featured ? '24px' : '0')};
  font-weight: 800;
`;

const DateAndLocationRowWrapper = styled.View`
  justify-content: space-between;
  flex-direction: row;
  margin: 32px 0;
`;

const DateAndLocationContainer = styled.View`
  flex: 1;
  flex-direction: column;
  align-items: center;
`;

const ValueText = styled.Text`
  font-size: ${({ active }) => (active ? '18px' : '16px')};
  color: ${({ active, theme }) => (active ? theme.colors.secondaryColor : theme.colors.inactiveTextColor)};
  font-weight: ${({ active }) => (active ? '800' : '700')};;
`;

const AttendWrapper = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.secondaryColor};
  border-radius: 20;
  height: 80px;
  padding: 18px;
`;

const CommentText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryColor};
  width: ${width - 160};
  font-size: 16;
  font-weight: 800;
`;

const AttendActionButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primaryColor};
  justify-content: center;
  align-items: center;
  border-radius: 20;
  width: 40;
  height: 40;
`;

const AttendActionIcon = styled.Image.attrs({
  source: IMAGES.SAVE,
})`
  width: 18;
  height: 18;
  tint-color: white;
`;

const CancelIcon = styled.Image.attrs({
  source: IMAGES.CLOSE,
})`
  width: 18;
  height: 18;
  tint-color: white;
`;

const MainActionButton = styled.TouchableOpacity`  
  background-color: ${({ theme }) => theme.colors.secondaryColor};
  justify-content: center;
  align-items: center;
  border-radius: 20;  
`;

const MainActionButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryColor};  
  font-weight: 900;
  padding: 8px 12px;
  font-size: 12px;
`;

const LimitParticipantsWrapper = styled.View`
  align-items: center;
  flex-direction: row;
  padding-bottom: 36px;
`;

const QuantitativeButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.secondaryColor};
  justify-content: center;
  border-radius: 36;
  align-items: center;
  margin: 0px 12px;
  width: 36;
  height: 36;
`;

const NumberParticipantsText = styled.Text`
  color: ${({ theme }) => theme.colors.secondaryColor}  
  font-weight: 700;
  font-size: 16px;
`;

const NumberParticipantsWrapper = styled.View`
  justify-content: center;
  align-items: center;
  width: 125;
`;

const PlusIcon = styled.Image.attrs({
  source: IMAGES.ADD,
})`
  tint-color: ${props => props.theme.colors.primaryColor};
  width: 20;
  height: 20;
`;

const MinusIcon = styled.Image.attrs({
  source: IMAGES.MINUS,
})`
  width: 20;
  height: 20;
  tint-color: ${props => props.theme.colors.primaryColor};
`;

const AddSpeakerWrapper = styled.View`
  align-items: center;
  margin-bottom: 36px;
`;

const AddSpeakerButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.secondaryColor};
  border-radius: 30;
  justify-content: center;
  align-items: center;
  width: 65%;
`;

const AddSpeakerTextWrapper = styled.View`
  flex-direction: row;  
  justify-content: space-between;
  margin: 12px;
`;

const AddSpeakerText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryColor};
  font-size: 18px;
  padding-right: 12px;
  font-weight: 800;
`;

const SpeakerIcon = styled.Image.attrs({
  source: IMAGES.SPEAKER,
})`
  tint-color: ${({ theme }) => theme.colors.primaryColor};
  width: 20;
  height: 20;
`;

type Props = {
  navigation: Object,
  relay: Object,
  context: ContextType,
};

type State = {
  isLocationPickerVisible: boolean,
  isDatePickerVisible: boolean,
  isScheduleModalVisibile: boolean,
  numberOfParticipants: number,
  mode: string,
  isEventAttended: string,
  isOwner: string,
  schedule: string,
  description: string,
  location: string,
  title: string,
  date: string,
};

@withNavigation
@withContext
class EventDetail extends Component<Props, State> {
  state = {
    isLocationPickerVisible: false,
    isDatePickerVisible: false,
    isScheduleModalVisibile: false,
    numberOfParticipants: 1,
    mode: 'detail',
    isEventAttended: '',
    isOwner: '',
    schedule: '',
    description: '',
    location: '',
    title: '',
    date: '',
  };

  componentDidMount() {
    const isOnCreateMode = !this.props.query.event;

    if (!isOnCreateMode) {
      this.handleEditMode();
    } else {
      this.handleCreateMode();
    }
  }

  handleCreateMode = () => this.setState({ mode: 'create' });

  handleEditMode = () => {
    const {
      isEventAttended,
      isOwner,
      title,
      description,
      date,
      location,
      schedule,
      publicLimit,
    } = this.props.query.event;

    this.setState({
      numberOfParticipants: publicLimit,
      isOwner: isOwner === 'true', // 'isOwner' comes as a String from the server
      isEventAttended,
      location,
      title,
      description,
      date,
      schedule,
    });
  };

  onRequestError = () => {
    const { context } = this.props;

    context.openModal('An Unexpected Error Ocurred');
  };

  onRequestCompleted = (response: Object) => {
    const { context, navigation } = this.props;

    if (response.error) {
      return context.openModal(response.error);
    }

    navigation.navigate(ROUTENAMES.EVENTS);
  };

  onEditEvent = () => {
    const input = {
      ...this.getStateFields(),
    };

    EventEditMutation.commit(input, this.onRequestCompleted, this.onRequestError);
  };

  onCreateEvent = () => {
    const input = {
      ...this.getStateFields(),
    };

    EventAddMutation.commit(input, this.onRequestCompleted, this.onRequestError);
  };

  onAttendToEvent = () => {
    const eventId = idx(this, _ => _.props.navigation.state.params.id);

    AttendToEventMutation.commit({ eventId }, this.onRequestCompleted, this.onRequestError);
  };

  onCancelToAttend = () => {
    const eventId = idx(this, _ => _.props.navigation.state.params.id);

    CantGoToEventMutation.commit({ eventId }, this.onRequestCompleted, this.onRequestError);
  };

  onFindLocation = locationInfo => {
    const location = {
      coordinates: [locationInfo.lat, locationInfo.lng],
      street: locationInfo.address,
      cep: locationInfo.zipCode,
      number: locationInfo.number,
    };

    this.setState({ location, isLocationPickerVisible: false });
  };

  getStateFields = () => {
    const { state } = this;

    return {
      id: idx(this, _ => _.props.navigation.state.params.id) || undefined,
      date: state.date,
      description: state.description,
      location: state.location,
      publicLimit: state.numberOfParticipants,
      title: state.title,
    };
  };

  renderAddSpeaker = (isOwner, isOnEditionMode) => {
    if (isOwner) {
      return (
        <AddSpeakerWrapper>
          <AddSpeakerButton onPress={() => this.setState({ isScheduleModalVisibile: true })}>
            <AddSpeakerTextWrapper>
              <AddSpeakerText>
                {isOnEditionMode ? 'Edit' : 'Add'}
              </AddSpeakerText>
              <SpeakerIcon />
            </AddSpeakerTextWrapper>
          </AddSpeakerButton>
        </AddSpeakerWrapper>
      );
    }
  };

  renderEventLimit = (isOwner, mode, isOnEditionMode) => {
    const numberOfParticipants = parseInt(this.state.numberOfParticipants, 10);
    const isOnCreateMode = mode === 'create';

    const numberOfParticipantsText =
      numberOfParticipants + (numberOfParticipants > 1 ? ' Participants' : ' Participant');

    const onAddParticipant = () => {
      this.setState({
        numberOfParticipants: numberOfParticipants + 1,
      });
    };

    const onDecreaseParticipant = () => {
      if (numberOfParticipants > 1) {
        this.setState({
          numberOfParticipants: numberOfParticipants - 1,
        });
      }
    };

    const renderWithQuantitativeButtons = () => (
      <React.Fragment>
        <QuantitativeButton onPress={onDecreaseParticipant}>
          <MinusIcon />
        </QuantitativeButton>
        <NumberParticipantsWrapper>
          <NumberParticipantsText>
            {numberOfParticipantsText}
          </NumberParticipantsText>
        </NumberParticipantsWrapper>
        <QuantitativeButton onPress={onAddParticipant}>
          <PlusIcon />
        </QuantitativeButton>
      </React.Fragment>
    );

    const renderJustLimit = () => (
      <NumberParticipantsWrapper>
        <NumberParticipantsText>
          {numberOfParticipantsText}
        </NumberParticipantsText>
      </NumberParticipantsWrapper>
    );

    const renderProperLimitParticipantsView = () =>
      (isOnEditionMode || isOnCreateMode ? renderWithQuantitativeButtons() : renderJustLimit());

    return (
      <LimitParticipantsWrapper>
        <ValueText active>
          Limit:
        </ValueText>
        {isOwner || isOnCreateMode ? renderProperLimitParticipantsView() : renderJustLimit()}
      </LimitParticipantsWrapper>
    );
  };

  renderHeader = (isOwner, mode, navigation) => {
    const isOnCreateMode = mode === 'create';
    const isOnEditionMode = mode === 'edit';

    const handleButtonAction = () => {
      if (isOnEditionMode) this.onEditEvent();

      if (isOnCreateMode) this.onCreateEvent();

      this.setState({ mode: 'detail' });
    };

    const RenderEditIcon = () => (
      <HeaderButton onPress={() => this.setState({ mode: 'edit' })}>
        <EditIcon />
      </HeaderButton>
    );

    const RenderTextButton = () => (
      <MainActionButton onPress={() => handleButtonAction()}>
        <MainActionButtonText>
          {isOnEditionMode ? 'DONE EDITING' : 'CREATE'}
        </MainActionButtonText>
      </MainActionButton>
    );

    const RenderEdit = () => (isOnEditionMode ? RenderTextButton() : RenderEditIcon());

    const RenderProperIcon = () => (isOnCreateMode ? RenderTextButton() : RenderEdit());

    const shouldShowAction = isOwner || isOnCreateMode;

    return (
      <HeaderContainer>
        <Header>
          <HeaderButton onPress={() => navigation.goBack()}>
            <ArrowBackIcon />
          </HeaderButton>
          {shouldShowAction && RenderProperIcon()}
        </Header>
      </HeaderContainer>
    );
  };

  renderDateAndLocationRow = (date, mode, location) => {
    const locationToShow = location ? location.street && location.street.split('-')[0] : 'Choose the Location';

    const dateToShow = date ? moment(date).format('MMM Do YYYY') : 'Choose a Date';

    return (
      <DateAndLocationRowWrapper>
        <DateAndLocationContainer>
          <ValueText active>WHEN</ValueText>
          <TouchableOpacity onPress={() => this.setState({ isDatePickerVisible: true })} disabled={mode === 'detail'}>
            <ValueText placeholder="Choose the Date">
              {dateToShow}
            </ValueText>
          </TouchableOpacity>
        </DateAndLocationContainer>
        <DateAndLocationContainer>
          <ValueText active>WHERE</ValueText>
          <TouchableOpacity
            onPress={() => this.setState({ isLocationPickerVisible: true })}
            disabled={mode === 'detail'}
          >
            <ValueText>{locationToShow}</ValueText>
          </TouchableOpacity>
        </DateAndLocationContainer>
      </DateAndLocationRowWrapper>
    );
  };

  renderAttendedRow = (isOwner, mode, isAlreadyConfirmed) => {
    if (isOwner || mode === 'create') return null;

    const CancelAttend = () => (
      <React.Fragment>
        <CommentText>Do you want to cancel your attend?</CommentText>
        <AttendActionButton onPress={() => this.onCancelToAttend()}>
          <CancelIcon />
        </AttendActionButton>
      </React.Fragment>
    );

    const ConfirmAttend = () => (
      <React.Fragment>
        <CommentText>Will you attend this event?</CommentText>
        <AttendActionButton onPress={() => this.onAttendToEvent()}>
          <AttendActionIcon />
        </AttendActionButton>
      </React.Fragment>
    );

    return (
      <AttendWrapper>
        {isAlreadyConfirmed ? CancelAttend() : ConfirmAttend()}
      </AttendWrapper>
    );
  };

  render() {
    const { navigation } = this.props;

    const {
      isLocationPickerVisible,
      isDatePickerVisible,
      isEventAttended,
      isOwner,
      mode,
      title,
      description,
      date,
      location,
    } = this.state;

    const isOnEditionMode = mode === 'edit';
    const isOnCreateMode = mode === 'create';

    return (
      <Container>
        <Wrapper>
          <StatusBar barStyle="light-content" />
          {this.renderHeader(isOwner, mode, navigation)}
          <EventTextInput
            onChangeText={title => this.setState({ title })}
            editable={isOnEditionMode || isOnCreateMode}
            placeholder="Type the title of the Event"
          >
            {title}
          </EventTextInput>
          <ScrollView>
            <EventTextInput
              featured
              onChangeText={description => this.setState({ description })}
              editable={isOnEditionMode || isOnCreateMode}
              placeholder="Type the event description"
            >
              {description}
            </EventTextInput>
            {this.renderDateAndLocationRow(date, mode, location)}
            {this.renderEventLimit(isOwner, mode, isOnEditionMode)}
            {this.renderAddSpeaker(isOwner, isOnEditionMode)}
            {this.renderAttendedRow(isOwner, mode, isEventAttended)}
          </ScrollView>
          <LocationPicker
            isVisible={isLocationPickerVisible}
            onFindLocation={this.onFindLocation}
            onClosePicker={() => this.setState({ isLocationPickerVisible: !this.state.isLocationPickerVisible })}
          />
          <DatePicker
            onCancel={() => this.setState({ isDatePickerVisible: false })}
            onConfirm={date => this.setState({ date, isDatePickerVisible: false })}
            isVisible={isDatePickerVisible}
          />
        </Wrapper>
      </Container>
    );
  }
}

const EventDetailFragmentCotnainer = createFragmentContainer(EventDetail, {
  query: graphql`
    fragment EventDetail_query on Query @argumentDefinitions(id: { type: "ID" }) {
      me {
        email
      }      
      event(id: $id) {
        title
        location {
          street
        }
        description
        date
        isOwner
        schedule {
          time
          title
          talker
        }
        publicList {
          name
        }
        isEventAttended
        publicLimit
      }
    }
  `,
});

export default createQueryRenderer(EventDetailFragmentCotnainer, EventDetail, {
  query: graphql`
    query EventDetailQuery($id: ID) {
      ...EventDetail_query @arguments(id: $id)
    }
  `,
  queriesParams: props => {
    return {
      id: idx(props, _ => _.navigation.state.params.id),
    };
  },
});

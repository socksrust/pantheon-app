import React, { Component } from 'react';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import Input from './Input';
import { IMAGES } from '../utils/design/images';
import { View, Platform, Animated, Keyboard } from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import CustomKeyboard from '../components/CustomKeyboard';

const ModalContent = styled(LinearGradient).attrs({
  colors: ['#53B1FF', '#651FFF'],
  start: { x: 0, y: 1 },
  end: { x: 1, y: 1 },
})`
  padding: 5px;
  flex-direction: column;
  border-radius: 10px;
  shadow-color: grey;
  shadow-offset: 0px 0px;
  shadow-radius: 5px;
  shadow-opacity: 0.1;
`;

const ModalTitle = styled(Animated.Text)`
  color: ${props => props.theme.colors.secondaryColor};
  font-weight: bold;
  font-size: 32;
`;

const FormWrapper = styled(Animated.View)``;

const CloseAction = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;  
  margin: 8px 0 24px 0;
  width: 20;
  height: 20;
`;

const CloseIcon = styled.Image.attrs({
  source: IMAGES.CLOSE,
})`
  tint-color: white;
  width: 20;
  height: 20;
`;

const Body = styled.View`
  flex-direction: column;
  padding: 16px;
`;

const IsLoadingContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding: 10px;
  height: 150px;
`;

const Loading = styled.ActivityIndicator.attrs({
  color: 'white',
  animating: true,
})``;

const CreateButton = styled.TouchableOpacity`
  padding: 8px 20px;  
  margin: 10px 0px;
  border-radius: 20;
  align-items: center;
  justify-content: center;
  background-color: white;
  margin-right: -10;
`;

const ButtonTitle = styled.Text`
  color: ${props => props.theme.colors.primaryColor};
  font-weight: 800; 
  font-size: 16;
`;

const CreateButtonWrapper = styled.View`
  flex-direction: row-reverse;
  padding: 5px 20px;
  width: 100%;
`;

type Props = {
  isVisible: boolean,
  onClose: () => void,
  onConfirm: () => void,
  isLoading: boolean,
};

class ScheduleAddModal extends Component<Props, State> {
  state = {
    modalTitleDisplayType: 'flex',
    timeInputDisplayType: 'flex',
    titleInputDisplayType: 'flex',
    talkerInputDisplayType: 'flex',
    isTimeInputFocused: false,
    isTitleInputFocused: false,
    isTalkerInputFocused: false,
    time: '',
    title: '',
    talker: '',
  };

  constructor(props) {
    super(props);
    this.modalTitleOpacity = new Animated.Value(1);
  }

  componentWillMount() {
    if (Platform.OS === 'ios') {
      this.keyboardWillShowSubscription = Keyboard.addListener('keyboardWillShow', this.onKeyboardShow);
      this.keyboardWillHideSubscription = Keyboard.addListener('keyboardWillHide', this.onKeyboardHide);
    } else {
      this.keyboardDidShowSubscription = Keyboard.addListener('keyboardDidShow', this.onKeyboardShow);
      this.keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide', this.onKeyboardHide);
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'ios') {
      this.keyboardWillShowSubscription.remove();
      this.keyboardWillHideSubscription.remove();
    } else {
      this.keyboardDidShowSubscription.remove();
      this.keyboardDidHideSubscription.remove();
    }
  }

  onKeyboardShow = () => {
    this.handleFormFocusFieldsState();

    Animated.timing(this.modalTitleOpacity, {
      duration: 250,
      toValue: 0,
    }).start(() => {
      this.setState({
        modalTitleDisplayType: 'none',
      });
    });
  };

  onKeyboardHide = () => {
    this.setState(
      {
        modalTitleDisplayType: 'flex',
        timeInputDisplayType: 'flex',
        titleInputDisplayType: 'flex',
        talkerInputDisplayType: 'flex',
      },
      () => {
        Animated.timing(this.modalTitleOpacity, {
          duration: 450,
          toValue: 1,
        }).start();
      },
    );
  };

  onFocusTimeField = () => {
    this.setState({
      isTimeInputFocused: true,
      isTitleInputFocused: false,
      isTalkerInputFocused: false,
      talkerInputDisplayType: 'none',
    });
  };

  onFocusTitleField = () => {
    const { time } = this.state;

    const timeInputDisplayType = !time ? 'flex' : 'none';
    const talkerInputDisplayType = !time ? 'none' : 'flex';

    this.setState({
      isTitleInputFocused: true,
      isTalkerInputFocused: false,
      isTimeInputFocused: false,
      timeInputDisplayType,
      talkerInputDisplayType,
    });
  };

  onFocusTalkerField = () => {
    this.setState({
      isTalkerInputFocused: true,
      isTitleInputFocused: false,
      isTimeInputFocused: false,
      timeInputDisplayType: 'none',
    });
  };

  onButtonAddItemPressed = () => {
    const { onConfirm } = this.props;
    const { time, title, talker } = this.state;

    onConfirm({
      time,
      title,
      talker,
    });
  };

  onButtonClosePressed = () => {
    const { onClose } = this.props;

    this.setState(
      {
        time: '',
        title: '',
        talker: '',
      },
      () => onClose(),
    );
  };

  handleFormFocusFieldsState = () => {
    const { isTimeInputFocused, isTitleInputFocused, isTalkerInputFocused } = this.state;

    if (isTimeInputFocused) {
      this.onFocusTimeField();
    }

    if (isTitleInputFocused) {
      this.onFocusTitleField();
    }

    if (isTalkerInputFocused) {
      this.onFocusTalkerField();
    }
  };

  render() {
    const {
      timeInputDisplayType,
      titleInputDisplayType,
      talkerInputDisplayType,
      modalTitleDisplayType,
      time,
      title,
      talker,
    } = this.state;

    const { isVisible, modalText, isLoading } = this.props;

    const {
      onButtonClosePressed,
      modalTitleOpacity,
      onFocusTimeField,
      onFocusTitleField,
      onFocusTalkerField,
      onButtonAddItemPressed,
    } = this;

    return (
      <CustomKeyboard>
        <Modal isVisible={isVisible}>
          <ModalContent>
            {isLoading
              ? <IsLoadingContainer>
                  <Loading />
                </IsLoadingContainer>
              : <View>
                  <Body>
                    <CloseAction onPress={onButtonClosePressed}>
                      <CloseIcon />
                    </CloseAction>
                    <ModalTitle style={{ display: modalTitleDisplayType, opacity: modalTitleOpacity }}>
                      {modalText}
                    </ModalTitle>
                    <FormWrapper>
                      <Input
                        placeholder="Time"
                        value={time}
                        style={{ display: timeInputDisplayType }}
                        onChangeText={(time: string) => this.setState({ time })}
                        onFocus={onFocusTimeField}
                        autoCorrect={false}
                      />
                      <Input
                        placeholder="Title"
                        value={title}
                        style={{ display: titleInputDisplayType }}
                        onChangeText={(title: string) => this.setState({ title })}
                        onFocus={onFocusTitleField}
                        autoCorrect={false}
                      />
                      <Input
                        placeholder="Talker"
                        value={talker}
                        style={{ display: talkerInputDisplayType }}
                        onChangeText={(talker: string) => this.setState({ talker })}
                        autoCorrect={false}
                        onFocus={onFocusTalkerField}
                      />
                    </FormWrapper>
                  </Body>
                  <CreateButtonWrapper>
                    <CreateButton onPress={onButtonAddItemPressed}>
                      <ButtonTitle>Add Item</ButtonTitle>
                    </CreateButton>
                  </CreateButtonWrapper>
                </View>}
          </ModalContent>
          {Platform.OS === 'ios' && <KeyboardSpacer />}
        </Modal>
      </CustomKeyboard>
    );
  }
}

export default ScheduleAddModal;

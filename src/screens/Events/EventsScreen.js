// @flow

import React, { Component } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import idx from 'idx';
import { createQueryRendererWithCustomLoading } from '../../relay/RelayUtils';
import { withContext } from '../../Context';
import type { ContextType } from '../../Context';

import { StatusBar, FlatList, Animated, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { withNavigation } from 'react-navigation';

import LoggedHeader from '../../components/LoggedHeader';
import ActionButton from '../../components/ActionButton';
import EventCard from '../../components/EventCardMVP';
import EmptyView from '../../components/EmptyView';
import { ROUTENAMES } from '../../navigation/RouteNames';
import DistanceModal from './DistanceModal';
import getUserLocation from '../../services/location';

const TOTAL_REFETCH_ITEMS = 10;

const Wrapper = styled.View`
  flex: 1;
  background-color: white
`;

const { width } = Dimensions.get('window');

const CardsShimmer = styled(Animated.View)`
  height: 120;
  width: ${width - 30};
  border-radius: 10;
  margin: 10px 15px;
`;

type Props = {
  navigation: Object,
  relay: Object,
  query: Object,
  context: ContextType,
  isFetching: boolean,
};

type State = {
  search: string,
  IsSearchVisible: boolean,
  coordinates: Array<number>,
  distance: number,
  isDistanceModalVisible: boolean,
  isRefreshing: boolean,
  isFetchingEnd: boolean,
  hasPosition: boolean,
  isGettingUserLocation: boolean,
  animatedValue: Animated.Value,
};

@withContext
@withNavigation
class EventsScreen extends Component<Props, State> {
  state = {
    search: '',
    IsSearchVisible: false,
    coordinates: [0, 0],
    distance: 80,
    isDistanceModalVisible: false,
    isRefreshing: false,
    isFetchingEnd: false,
    hasPosition: false,
    isGettingUserLocation: true,
    animatedValue: new Animated.Value(0),
  };

  changeSearchText = (search: string): void => {
    return this.refetch({ search });
  };

  setVisible = () => {
    const { IsSearchVisible, search } = this.state;
    this.setState({
      IsSearchVisible: !IsSearchVisible,
      search: IsSearchVisible ? search : '',
    });
    if (IsSearchVisible) {
      this.refetch({ search: '' });
    }
  };

  async componentDidMount() {
    const { relay } = this.props;

    const { latitude, longitude } = await getUserLocation(navigator);
    const coordinates = [longitude, latitude];

    this.setState({
      coordinates,
      isGettingUserLocation: false,
    });

    relay.refetch({ coordinates, distance: 80, first: 10 });
  }

  changeDistance(distance) {
    this.refetch({ distance });
    return this.setState({ isDistanceModalVisible: false });
  }

  onRefresh = () => {
    this.setState({ isRefreshing: true });
    this.refetch();
  };

  refetch = newRefetchVariable => {
    const { isRefreshing, search, distance, coordinates } = this.state;
    newRefetchVariable && this.setState(newRefetchVariable);

    if (isRefreshing) return;
    const refetchVariables = fragmentVariables => ({
      ...fragmentVariables,
      search,
      distance,
      coordinates,
      ...newRefetchVariable,
    });

    this.props.relay.refetch(
      refetchVariables,
      null,
      () =>
        this.setState({
          isRefreshing: false,
          isFetchingEnd: false,
          hasPosition: true,
        }),
      {
        force: true,
      },
    );
  };

  onEndReached = () => {
    const { isFetchingEnd } = this.state;

    if (isFetchingEnd) return;

    const { events } = this.props.query;

    if (!events.pageInfo.hasNextPage) return;

    this.setState({
      isFetchingEnd: true,
    });

    const { endCursor } = events.pageInfo;

    const total = events.edges.length + TOTAL_REFETCH_ITEMS;
    const refetchVariables = fragmentVariables => ({
      ...fragmentVariables,
      first: TOTAL_REFETCH_ITEMS,
      cursor: endCursor,
    });
    const renderVariables = {
      first: total,
    };

    this.props.relay.refetch(
      refetchVariables,
      renderVariables,
      () => {
        this.setState({
          isRefreshing: false,
          isFetchingEnd: false,
        });
      },
      {
        force: false,
      },
    );
  };

  animateShimmer = () => {
    Animated.sequence([
      Animated.timing(this.state.animatedValue, {
        toValue: 150,
        duration: 500,
      }),
      Animated.timing(this.state.animatedValue, {
        toValue: 0,
        duration: 600,
      }),
    ]).start(() => {
      this.animateShimmer();
    });
  };

  renderItem = ({ item }) => {
    const { node } = item;
    const splittedAddress = node.location.street.split('-');
    return (
      <EventCard
        atendees={node.publicList}
        title={node.title}
        address={splittedAddress[0]}
        date={node.date}
        seeButtonAction={() =>
          this.props.navigation.navigate(ROUTENAMES.EVENT_DETAILS, {
            id: node.id,
          })}
      />
    );
  };

  renderLoading = () => {
    const { search, IsSearchVisible, distance } = this.state;

    const interpolateColor = this.state.animatedValue.interpolate({
      inputRange: [0, 150],
      outputRange: ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)'],
    });

    const shimmerStyle = {
      backgroundColor: interpolateColor,
    };

    this.animateShimmer();

    return (
      <Wrapper>
        <LoggedHeader
          title="Events"
          searchValue={search}
          IsSearchVisible={IsSearchVisible}
          showSearch={this.setVisible}
          onChangeSearch={search => this.changeSearchText(search)}
          openDistanceModal={() => this.setState({ isDistanceModalVisible: true })}
          distance={distance}
        />
        <CardsShimmer style={shimmerStyle} />
        <CardsShimmer style={shimmerStyle} />
        <CardsShimmer style={shimmerStyle} />
      </Wrapper>
    );
  };

  renderContent = () => {
    const { query } = this.props;
    const { search, IsSearchVisible, distance, isDistanceModalVisible, isRefreshing } = this.state;

    return (
      <Wrapper>
        <StatusBar barStyle="light-content" />
        <LoggedHeader
          title="Events"
          searchValue={search}
          IsSearchVisible={IsSearchVisible}
          showSearch={this.setVisible}
          onChangeSearch={search => this.changeSearchText(search)}
          openDistanceModal={() => this.setState({ isDistanceModalVisible: true })}
          distance={distance}
        />
        <FlatList
          data={idx(query, _ => _.events.edges)}
          keyExtractor={item => item.node.id}
          renderItem={this.renderItem}
          onRefresh={this.onRefresh}
          refreshing={isRefreshing}
          onEndReached={this.onEndReached}
          ListEmptyComponent={<EmptyView text="Você não possui eventos próximos" />}
        />
        <ActionButton onPress={() => this.props.navigation.navigate(ROUTENAMES.EVENT_ADD)} />
        <DistanceModal
          isVisible={isDistanceModalVisible}
          distance={distance}
          changeDistance={distance => this.changeDistance(distance)}
          closeDistanceModal={() => this.setState({ isDistanceModalVisible: false })}
        />
      </Wrapper>
    );
  };

  render() {
    const { isFetching } = this.props;
    const { isGettingUserLocation } = this.state;

    return isGettingUserLocation || isFetching ? this.renderLoading() : this.renderContent();
  }
}

const EventsScreenRefetchContainer = createRefetchContainer(
  EventsScreen,
  {
    query: graphql`
      fragment EventsScreen_query on Query @argumentDefinitions(
          search: { type: String }
          coordinates: { type: "[Float]" }
          distance: { type: Int }
          first: { type: Int, defaultValue: 10 }
          cursor: { type: String }
        ) {
        events(
          first: $first,
          after: $cursor
          search: $search,
          coordinates: $coordinates,
          distance: $distance
        ) @connection(key: "EventsScreen_events", filters: []) {
          edges {
            node {
              id
              schedule {
                title
                talker
                time
              }
              title
              date
              location {
                street
              }
              publicList {
                name
              }
            }
          }
        }
      }
    `,
  },
  graphql`
    query EventsScreenRefetchQuery(
      $first: Int
      $cursor: String
      $search: String
      $coordinates: [Float]
      $distance: Int
      ) {
      ...EventsScreen_query
      @arguments(
        first: $first,
        cursor: $cursor,
        search: $search,
        coordinates: $coordinates,
        distance: $distance
      )
    }
  `,
);

export default createQueryRendererWithCustomLoading(EventsScreenRefetchContainer, EventsScreen, {
  query: graphql`
    query EventsScreenQuery {
      ...EventsScreen_query
    }
  `,
  variables: {
    first: 10,
  },
});

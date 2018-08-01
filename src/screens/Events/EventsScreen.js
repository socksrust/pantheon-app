// @flow

import React, { Component } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import idx from 'idx';
import { createQueryRenderer } from '../../relay/RelayUtils';
import { withContext } from '../../Context';
import type { ContextType } from '../../Context';

import { StatusBar, FlatList, ActivityIndicator } from 'react-native';
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

const LoadingUserLocation = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

type Props = {
  navigation: Object,
  relay: Object,
  query: Object,
  context: ContextType,
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
    this.refetch();
  };

  refetch = newRefetchVariable => {
    const { isRefreshing, search, distance, coordinates } = this.state;
    this.setState({ isRefreshing: true });
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

  renderLocationLoading = () => (
    <LoadingUserLocation>
      <ActivityIndicator size="small" color="#2979FF" />
    </LoadingUserLocation>
  );

  render() {
    const { isGettingUserLocation } = this.state;

    return isGettingUserLocation ? this.renderLocationLoading() : this.renderContent();
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

export default createQueryRenderer(EventsScreenRefetchContainer, EventsScreen, {
  query: graphql`
    query EventsScreenQuery {
      ...EventsScreen_query
    }
  `,
  variables: {
    first: 10,
  },
});

// @flow

import React, { Component } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import idx from 'idx';
import { createQueryRenderer } from '../../relay/RelayUtils';
import { withContext } from '../../Context';
import type { ContextType } from '../../Context';

import { StatusBar, FlatList } from 'react-native';
import styled from 'styled-components/native';
import { withNavigation } from 'react-navigation';

import LoggedHeader from '../../components/LoggedHeader';
import ActionButton from '../../components/ActionButton';
import EventCard from '../../components/EventCardMVP';
import EmptyView from '../../components/EmptyView';
import { ROUTENAMES } from '../../navigation/RouteNames';
import DistanceModal from './DistanceModal';
import DateModal from './DateModal';

const TOTAL_REFETCH_ITEMS = 10;

const Wrapper = styled.View`
  flex: 1;
  background-color: white
`;

type Props = {
  navigation: Object,
  relay: Object,
  context: ContextType,
};

type State = {
  search: string,
  IsSearchVisible: boolean,
  coordinates: Array<number>,
  distance: number,
  days: number,
  isDistanceModalVisible: boolean,
  isDateModalVisible: boolean,
  isRefreshing: boolean,
  isFetchingEnd: boolean,
};

@withContext
@withNavigation
class EventsScreen extends Component<Props, State> {
  state = {
    search: '',
    IsSearchVisible: false,
    coordinates: [0, 0],
    distance: 80,
    days: 7,
    isDistanceModalVisible: false,
    isDateModalVisible: false,
    isRefreshing: false,
    isFetchingEnd: false,
  };

  changeSearchText = (search: string): void => {
    this.refetch({ search });
  };

  setVisible = () => {
    const { IsSearchVisible, search } = this.state;
    this.setState({
      IsSearchVisible: !IsSearchVisible,
      search: IsSearchVisible ? search : '',
    });
  };

  componentDidMount() {
    const { context, relay } = this.props;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates = [coords.longitude, coords.latitude];
        this.setState({ coordinates });
      },
      error => context.openModal(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
    relay.refetch();
  }

  changeDistance(distance) {
    this.refetch({ distance });
    return this.setState({ isDistanceModalVisible: false });
  }

  setDate(days) {
    this.refetch({ days });
    return this.setState({ isDateModalVisible: false });
  }

  onRefresh = () => {
    this.refetch();
  };

  refetch = newRefetchVariable => {
    const { isRefreshing, search, distance, days, coordinates } = this.state;

    if (isRefreshing) return;

    this.setState({ isRefreshing: true });

    const refetchVariables = fragmentVariables => ({
      ...fragmentVariables,
      search,
      distance,
      days,
      coordinates,
      ...newRefetchVariable,
    });
    this.props.relay.refetch(
      refetchVariables,
      null,
      () => {
        this.setState({
          isRefreshing: false,
          isFetchingEnd: false,
        });
        newRefetchVariable && this.setState(newRefetchVariable);
      },
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
      count: TOTAL_REFETCH_ITEMS,
      cursor: endCursor,
    });
    const renderVariables = {
      count: total,
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

  render() {
    const { query } = this.props;
    const {
      search,
      IsSearchVisible,
      distance,
      isDistanceModalVisible,
      isRefreshing,
      days,
      isDateModalVisible,
    } = this.state;

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
          openDateModal={() => this.setState({ isDateModalVisible: true })}
          distance={distance}
          days={days}
        />
        <FlatList
          data={idx(query, _ => _.events.edges) || []}
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
        <DateModal
          isVisible={isDateModalVisible}
          setDate={days => this.setDate(days)}
          closeDateModal={() => this.setState({ isDateModalVisible: false })}
        />
      </Wrapper>
    );
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
          days: { type: Int }
          count: { type: Int, defaultValue: 10 }
          cursor: { type: String }
        ) {
        events(
          first: $count,
          after: $cursor
          search: $search,
          coordinates: $coordinates,
          distance: $distance
          days: $days
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
      $count: Int
      $cursor: String
      $search: String
      $coordinates: [Float]
      $distance: Int
      $days: Int
      ) {
      ...EventsScreen_query
      @arguments(
        count: $count,
        cursor: $cursor,
        search: $search,
        coordinates: $coordinates,
        distance: $distance
        days: $days
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
});

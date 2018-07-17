import { commitMutation, graphql } from 'react-relay';
import Environment from '../../createRelayEnvironment';
import type {
  EventEditMutationVariables,
  EventEditMutationResponse,
} from './__generated__/EventEditMutation.graphql';

const mutation = graphql`
  mutation EventEditMutation($input: EventEditInput!) {
    EventEdit(input: $input) {
      event {
        title
      }
    }
  }
`;

function commit(
  input: $PropertyType<EventEditMutationVariables, 'input'>,
  onCompleted: (response: EventEditMutationResponse) => void,
  onError: (error: Object) => void
): void {
  return commitMutation(Environment, {
    mutation,
    variables: {
      input,
    },
    onCompleted,
    onError,
  });
}

export default { commit };

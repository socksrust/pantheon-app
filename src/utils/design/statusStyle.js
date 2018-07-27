import theme from './theme';

export const getStatusColor = ({ isOwner, isConfirmed, isPending }) => {
  const { colors } = theme;

  if (isOwner) return colors.ownerColor;

  if (isConfirmed) return colors.confirmedColor;

  if (isPending) return colors.pendingColor;
};

export const getStatusText = (isOwner, isConfirmed, isPending) => {
  if (isOwner) return 'ORGANIZADOR';

  if (isConfirmed) return 'CONFIRMADO';

  if (isPending) return 'PENDENTE';
};

export const getLocation = async (zip: string, number: string) => {
  const url = `https://maps.google.com/maps/api/geocode/json?address=${zip}&sensor=false`;

  const res = await fetch(url);
  const location = await res.json();

  const { geometry, formatted_address } = location.results[0];
  const { lat, lng } = geometry.location;

  const indexStartAddress = formatted_address.indexOf('-');
  const indexEndNeighborhood = formatted_address.indexOf(',');

  const address =
    formatted_address.substring(0, indexStartAddress - 1) +
    `, ${number} ` +
    formatted_address.substring(indexStartAddress, indexEndNeighborhood);

  return {
    address,
    lat,
    lng,
  };
};

const getUserLocation = async navigator => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(({ coords }) => resolve(coords), error => reject(error), {
      enableHighAccuracy: true,
      timeout: 20000,
    });
  });
};

export default getUserLocation;

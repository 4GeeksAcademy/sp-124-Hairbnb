export const initialStore = () => {
  return {
    message: null,
    users: [],
    userInfo: null,
    barbershops: [],
    barbershopInfo: null,
    owners: [],
    ownerInfo: null,
    services: [],
    serviceInfo: null,
    barbers: [],
    barberInfo: null,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set-users":
      return { ...store, users: action.payload };

    case "set-userInfo":
      return { ...store, userInfo: action.payload };

    case "set-barbershops":
      return { ...store, barbershops: action.payload };

    case "set-barbershopInfo":
      return { ...store, barbershopInfo: action.payload };

    case "set-owners":
      return { ...store, owners: action.payload };

    case "set-ownerInfo":
      return { ...store, ownerInfo: action.payload };

    case "set-services":
      return { ...store, services: action.payload };

    case "set-serviceInfo":
      return { ...store, serviceInfo: action.payload }; 

    case "set-barbers":
      return { ...store, barbers: action.payload };

    case "set-barberInfo":
      return { ...store, barberInfo: action.payload }; 

      
    default:
      return store; 
  }
}

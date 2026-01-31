export const initialStore = () => {
  return {
    users: [],
    barbershops: [],
    barbershopsInfo: null,
    userInfo: null,
    error: ""
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

    default:
      return store; 
  }
}

export const initialStore = () => {
  return {
    users: [],
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

    default:
      return store; 
  }
}

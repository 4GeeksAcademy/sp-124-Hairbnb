export const initialStore = () => {
  return {
    token: null,
    username: null,
    role: null,
    message:{
              type: "",
              msg: ""
            },
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
    schedules: [],
    scheduleInfo: null,
    barberservice: [],
    barberserviceInfo: null,
    appointments: [],
    appointmentInfo: null,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set-message":
      return { ... store, message: action.payload };

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

    case "set-schedules":
      return { ...store, schedules: action.payload };

    case "set-scheduleInfo":
      return { ...store, scheduleInfo: action.payload };

    case "set-barberservices":
      return { ...store, barberservice: action.payload };

    case "set-barberserviceInfo":
      return { ...store, barberserviceInfo: action.payload };  

    case "set-appointments":
      return { ...store, appointments: action.payload };

    case "set-appointmentInfo":
      return { ...store, appointmentInfo: action.payload };

    case "login":
  return { ...store, 
          token: action.payload.token,
          username: action.payload.username,
          role: action.payload.role
  };

    default:
      return store; 
  }
}

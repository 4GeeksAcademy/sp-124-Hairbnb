export const initialStore = () => {
  return {
    token: null,
    username: null,
    role: null,
    message:null,
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
    barber_services: [],
    barber_serviceInfo: null,
    appointments: [],
    appointmentInfo: null,
    invitations: []
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

    case "set-barber_services":
      return { ...store, barber_services: action.payload };

    case "set-barber_serviceInfo":
      return { ...store, barber_serviceInfo: action.payload };

    case "set-appointments":
      return { ...store, appointments: action.payload };

    case "set-appointmentInfo":
      return { ...store, appointmentInfo: action.payload };

    case "login":
      return {...store, token: action.payload.token, username: action.payload.username || action.payload.userInfo?.name || null , role: action.payload.role, userInfo: action.payload.userInfo };
  
    case "logout":
      return {...store, token: null, username: null, role: null, userInfo: null};

    case "set-invitations":
      return { ...store, invitations: action.payload };

    default:
      return store; 
  }
}

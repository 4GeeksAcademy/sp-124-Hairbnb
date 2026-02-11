// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Barbershops } from "./pages/Barbershops";
import { BarbershopForm } from "./pages/BarbershopForm";
import { Owners } from "./pages/Owners";
import { OwnerForm } from "./pages/OwnerForm";
import { Barbers } from "./pages/Barbers";
import { BarberForm } from "./pages/BarberForm";
import { Schedules } from "./pages/Schedules";
import { ScheduleForm } from "./pages/ScheduleForm";
import { BarberServices } from "./pages/BarberServices";
import { BarberServiceForm } from "./pages/BarberServiceForm";
import { Appointments } from "./pages/Appointments";
import { PrivateOwner } from "./pages/PrivateOwner.jsx";
import { PrivateBarber } from "./pages/PrivateBarber.jsx";
import { PrivateClient } from "./pages/PrivateClient.jsx";
import { ClientLogin } from "./pages/ClientLogin.jsx";
import { BarberLogin } from "./pages/BarberLogin.jsx";
import { OwnerLogin } from "./pages/OwnerLogin.jsx";
import { ClientRegister } from "./pages/ClientRegister.jsx";
import { BarberRegister } from "./pages/BarberRegister.jsx";
import { OwnerRegister } from "./pages/OwnerRegister.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { AdminLogin } from "./pages/AdminLogin.jsx";
import { OwnerGestion } from "./pages/OwnerGestion.jsx";
import { Asociates } from "./pages/Asociates.jsx";
import { ApptFormBarber } from "./pages/ApptFormBarber.jsx";
import { ApptFormClient } from "./pages/ApptFormClient.jsx";
import { ApptFormOwner } from "./pages/ApptFormOwner.jsx";

import { AppointmentForm } from "./pages/AppointmentForm";
import { Services } from "./pages/Services";
import { ServiceForm } from "./pages/ServiceForm";
import { Users } from "./pages/Users";
import { UserForm } from "./pages/UserForm";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<Home />} />
      <Route path="/asociates" element={<Asociates />} /> {/* Aparecen todas las barberias. Sirve como publi */}
      <Route path="/barbershops_form" element={<BarbershopForm />} /> {/* Crear y editar barberias (solo dueños) */}
      <Route path="/barber_services_form" element={<BarberServiceForm />} /> {/* Crear y editar servicios (solo barberos) */}
      <Route path="/schedules_form" element={<ScheduleForm />} />  {/* Crear y editar horarios (solo barberos) */}

      <Route path="/barber_appointment_form" element={<ApptFormBarber />} /> {/* Crear y editar cita desde barbero */}
      <Route path="/client_appointment_form" element={<ApptFormClient />} /> {/* Crear y editar cita desde cliente */}
      <Route path="/owner_appointment_form" element={<ApptFormOwner />} /> {/* Crear y editar cita desde dueño */}
      
      <Route path="/signup/client/:id?" element={<ClientRegister />} /> {/* Crear cuenta cliente */}
      <Route path="/signup/barber/:id?" element={<BarberRegister />} /> {/* Crear cuenta barbero */}
      <Route path="/signup/owner/:id?" element={<OwnerRegister />} /> {/* Crear cuenta dueño */}
      
      <Route path="/login/client" element={<ClientLogin />} /> {/* Inicio sesión cliente */}
      <Route path="/login/barber" element={<BarberLogin />} /> {/* Inicio sesión barbero */}
      <Route path="/login/owner" element={<OwnerLogin />} /> {/* Inicio sesión dueño */}
      <Route path="/login/admin" element={<AdminLogin />} /> {/* Inicio sesión admin */}

      <Route path="/4dm1n1str4t10n" element={<AdminDashboard />} /> {/* Panel de gestión del admin */}
      
      <Route path="/private/owner" element={<PrivateOwner />} /> {/* Zona privada de dueño, selección de barbería a gestionar */}
      <Route path="/private/owner/gestion" element={<OwnerGestion />} /> {/* Zona privada de dueño */}
      <Route path="/private/barber" element={<PrivateBarber />} /> {/* Zona privada de barbero */}
      <Route path="/private/client" element={<PrivateClient />} /> {/* Zona privada de cliente */}


      {/* 
        <Route path="/appointment_form" element={<AppointmentForm />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/barbers_form" element={<BarberForm />} />
        <Route path="/barbers" element={<Barbers />} />
        <Route path="/barber_services" element={<BarberServices />} />
        <Route path="/barbershops" element={<Barbershops />} />
        <Route path="/owners" element={<Owners />} />
        <Route path="/owners_form" element={<OwnerForm />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services_form" element={<ServiceForm />} /> 
        <Route path="/users" element={<Users />} />
        <Route path="/users_form" element={<UserForm />} /> 
      */}
      
    </Route>
  )
);
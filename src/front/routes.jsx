// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Users } from "./pages/Users";
import { UserForm } from "./pages/UserForm";
import { Barbershops } from "./pages/Barbershops";
import { BarbershopForm } from "./pages/BarbershopForm";
import { Owners } from "./pages/Owners";
import { OwnerForm } from "./pages/OwnerForm";
import { Services } from "./pages/Services";
import { ServiceForm } from "./pages/ServiceForm";
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
import { Administration } from "./pages/Administration.jsx";
import { AdminLogin } from "./pages/AdminLogin.jsx";
import { OwnerGestion } from "./pages/OwnerGestion.jsx";
import { Asociates } from "./pages/Asociates.jsx";
import { ApptFormBarber } from "./pages/ApptFormBarber.jsx";
import { ApptFormClient } from "./pages/ApptFormClient.jsx";
import { ApptFormOwner } from "./pages/ApptFormOwner.jsx";

import { AppointmentForm } from "./pages/AppointmentForm";

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
      <Route path="/asociates" element={<Asociates />} />
      <Route path="/users" element={<Users />} />
      <Route path="/users_form" element={<UserForm />} />
      <Route path="/barbershops" element={<Barbershops />} />
      <Route path="/barbershops_form" element={<BarbershopForm />} />
      <Route path="/owners" element={<Owners />} />
      <Route path="/owners_form" element={<OwnerForm />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services_form" element={<ServiceForm />} />
      <Route path="/barbers" element={<Barbers />} />
      <Route path="/barbers_form" element={<BarberForm />} />
      <Route path="/schedules" element={<Schedules />} />
      <Route path="/schedules_form" element={<ScheduleForm />} />
      <Route path="/barber_services" element={<BarberServices />} />
      <Route path="/barber_services_form" element={<BarberServiceForm />} />
      <Route path="/appointments" element={<Appointments />} />

      <Route path="/barber_appointment_form" element={<ApptFormBarber />} />
      <Route path="/client_appointment_form" element={<ApptFormClient />} />
      <Route path="/owner_appointment_form" element={<ApptFormOwner />} />
      
      <Route path="/singup/client" element={<ClientRegister />} />
      <Route path="/singup/barber" element={<BarberRegister />} />
      <Route path="/singup/owner" element={<OwnerRegister />} />
      
      <Route path="/login/client" element={<ClientLogin />} />
      <Route path="/login/barber" element={<BarberLogin />} />
      <Route path="/login/owner" element={<OwnerLogin />} />
      <Route path="/login/admin" element={<AdminLogin />} />


      <Route path="/4dm1n1str4c10n" element={<Administration />} />
      
      <Route path="/private/owner" element={<PrivateOwner />} />
      <Route path="/private/barber" element={<PrivateBarber />} />
      <Route path="/private/client" element={<PrivateClient />} />

      <Route path="/private/owner/gestion" element={<OwnerGestion />} />

    </Route>
  )
);
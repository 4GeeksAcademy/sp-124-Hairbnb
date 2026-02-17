import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";

import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { AdminEditForms } from "./pages/AdminEditForms.jsx";
import { ApptFormBarber } from "./pages/ApptFormBarber.jsx";
import { ApptFormClient } from "./pages/ApptFormClient.jsx";
import { ApptFormOwner } from "./pages/ApptFormOwner.jsx";
import { AdminLogin } from "./pages/AdminLogin.jsx";
import { Asociates } from "./pages/Asociates.jsx";
import { BarberLogin } from "./pages/BarberLogin.jsx";
import { BarberRegister } from "./pages/BarberRegister.jsx";
import { BarbershopForm } from "./pages/BarbershopForm";
import { BarberServiceForm } from "./pages/BarberServiceForm";
import { ClientLogin } from "./pages/ClientLogin.jsx";
import { ClientRegister } from "./pages/ClientRegister.jsx";
import { OwnerLogin } from "./pages/OwnerLogin.jsx";
import { OwnerRegister } from "./pages/OwnerRegister.jsx";
import { OwnerGestion } from "./pages/OwnerGestion.jsx";
import { PrivateClient } from "./pages/PrivateClient.jsx";
import { PrivateBarber } from "./pages/PrivateBarber.jsx";
import { PrivateOwner } from "./pages/PrivateOwner.jsx";
import { ScheduleForm } from "./pages/ScheduleForm";

import { AppointmentForm } from "./pages/deprecated/AppointmentForm";
import { Appointments } from "./pages/deprecated/Appointments";
import { BarberForm } from "./pages/deprecated/BarberForm.jsx";
import { Barbers } from "./pages/deprecated/Barbers";
import { BarberServices } from "./pages/deprecated/BarberServices.jsx";
import { Barbershops } from "./pages/deprecated/Barbershops";
import { OwnerForm } from "./pages/deprecated/OwnerForm.jsx";
import { Owners } from "./pages/deprecated/Owners";
import { Schedules } from "./pages/deprecated/Schedules.jsx";
import { ServiceForm } from "./pages/deprecated/ServiceForm.jsx";
import { Services } from "./pages/deprecated/Services.jsx";
import { UserForm } from "./pages/deprecated/UserForm.jsx";
import { Users } from "./pages/deprecated/Users.jsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
   
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      <Route path="/" element={<Home />} />
      <Route path="/asociates" element={<Asociates />} />
      <Route path="/barbershops_form" element={<BarbershopForm />} />
      <Route path="/barber_services_form" element={<BarberServiceForm />} />
      <Route path="/schedules_form" element={<ScheduleForm />} />
      
      <Route path="/barber_appointment_form" element={<ApptFormBarber />} />
      <Route path="/client_appointment_form" element={<ApptFormClient />} />
      <Route path="/owner_appointment_form" element={<ApptFormOwner />} />

      <Route path="/signup/client/:id?" element={<ClientRegister />} />
      <Route path="/signup/barber/:id?" element={<BarberRegister />} />
      <Route path="/signup/owner/:id?" element={<OwnerRegister />} />

      <Route path="/login/client" element={<ClientLogin />} />
      <Route path="/login/barber" element={<BarberLogin />} />
      <Route path="/login/owner" element={<OwnerLogin />} />
      <Route path="/login/admin" element={<AdminLogin />} />

      <Route path="/4dm1n1str4t10n" element={<AdminDashboard />} />
      <Route path="/admin/:entity/:id" element={<AdminEditForms />} />
      <Route path="/admin/:entity" element={<AdminEditForms />} />


      <Route path="/private/owner" element={<PrivateOwner />} />
      <Route path="/private/owner/gestion" element={<OwnerGestion />} />
      <Route path="/private/barber" element={<PrivateBarber />} />
      <Route path="/private/client" element={<PrivateClient />} />


      {/* En la carpeta ../deprecated
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
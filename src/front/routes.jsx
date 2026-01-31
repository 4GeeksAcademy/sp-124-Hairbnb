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
        <Route path= "/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users_form" element={<UserForm />} />
        <Route path="/barbershops" element={<Barbershops />} />
        <Route path="/barbershops_form" element={<BarbershopForm />} />
        <Route path="/owners" element={<Owners />} />
        <Route path="/owners_form" element={<OwnerForm />} />
      </Route>
    )
);
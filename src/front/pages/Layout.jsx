import { Outlet, useLocation  } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Message } from "../components/Message"
import { Chatbot } from "../components/Chatbot"

export const Layout = () => {
    const location = useLocation();
    return (
        <ScrollToTop location={location}>
            <div className="layout">
                <Navbar />
                <main className="content">
                    <Message />
                    <Chatbot />

                    <Outlet />
                </main>
                <Footer />
            </div>
        </ScrollToTop>
    )
}
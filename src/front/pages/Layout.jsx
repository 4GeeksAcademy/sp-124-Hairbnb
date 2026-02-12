import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Message } from "../components/Message"

export const Layout = () => {
    return (
        <ScrollToTop>
            <div className="layout">
                <Navbar />
                <main className="content">
                    <Message />

                    <Outlet />
                </main>
                <Footer />
            </div>
        </ScrollToTop>
    )
}
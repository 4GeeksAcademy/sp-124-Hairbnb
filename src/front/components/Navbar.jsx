import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/" className="navbar-brand" href="/">
					<img src="../../../public/Logo-HBNB-completo.png" alt="Haribnb" width="15%" height="15%" />
				</Link>
			</div>
		</nav >
	);
};
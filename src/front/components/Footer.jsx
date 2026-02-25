import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/footer.css";

export const Footer = () => {
	const navigate = useNavigate();

	const user = "info";
	const domain = "hairbnb.com";

	const handleContactClick = () => {
		window.location.href = `mailto:${user}@${domain}`;
	};

	return (
		<footer className="hairbnb-footer">
			<div className="container py-5">
				<div className="row align-items-center">
					<div className="col-md-4 text-center text-md-start mb-4 mb-md-0">
						<h4 className="hairbnb-brand text-gold mb-1">HAIRBNB</h4>
						<p className="text-white-50 small mb-0">• Organiza tu estilo •</p>
					</div>

					<div className="col-md-4 text-center mb-4 mb-md-0">
						<p className="text-white mb-2 small fw-bold text-uppercase ls-1">Contacto</p>
						<a
							href="mailto:info@hairbnb.com"
							className="footer-link-gold small"
						>
							info@hairbnb.com
						</a>
					</div>

					<div className="col-md-4 text-center text-md-end">
						<button
							className="btn-admin-link mb-2"
							onClick={() => navigate("/login/admin")}
						>
							<i className="ti-settings me-1"></i> Administración
						</button>
						<p className="text-white-50 small mb-0">
							© 2026 • Hecho por <a href="https://github.com/ssantv" target="_blank" rel="noopener noreferrer" className="footer-link-gold">Sandra Santos</a>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
};
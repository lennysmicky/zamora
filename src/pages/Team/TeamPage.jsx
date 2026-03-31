import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    RiCodeSSlashLine,
    RiServerLine,
    RiLayoutLine,
    RiLinkedinBoxFill,
    RiGithubFill,
    RiGlobalLine,
    RiArrowLeftLine,
    RiStarFill,
    RiTeamFill,
    RiNotification3Line,
    RiMovie2Line
} from 'react-icons/ri';
import {
    FaReact,
    FaNodeJs,
    FaGithub,
    FaCloud
} from 'react-icons/fa';
import {
    SiVite,
    SiLaravel,
    SiMongodb,
    SiNetlify,
    SiPusher,
    SiCloudinary,
    SiRender
} from 'react-icons/si';
import { FaGooglePlay, FaAppStore } from 'react-icons/fa';

// Images
import Logo from '../../assets/images/logo.png';

import './TeamPage.css';

// Équipe du projet
const teamMembers = [
    {
        name: 'Kossi Michael ZODJEKPO',
        role: 'Project Lead & Développeur Fullstack',
        roleIcon: RiCodeSSlashLine,
        bio: 'Architecture du projet, développement frontend React & backend API',
        linkedin: 'https://www.linkedin.com/in/kossi-michael-zodjekpo/',
        github: 'https://github.com/lennysmicky/',
        portfolio: '',
        isLead: true
    },
    {
        name: 'Koffi Kelly SOWU',
        role: 'Développeur Backend',
        roleIcon: RiServerLine,
        bio: 'API REST, base de données et logique métier',
        linkedin: 'https://www.linkedin.com/in/kelly-sowu-10084238b/',
        github: 'https://github.com/Sowu20/',
        portfolio: ''
    },
    {
        name: 'Kossi Enouagnon HOUNGBEDJI',
        role: 'Développeur Frontend',
        roleIcon: RiLayoutLine,
        bio: 'Interfaces utilisateur, responsive design et expérience client',
        linkedin: 'https://www.linkedin.com/in/kossi-enouagnon-houngbedji-475984288/',
        github: 'https://github.com/',
        portfolio: ''
    },
    {
        name: 'Sergio DAKLU',
        role: 'Développeur Backend',
        roleIcon: RiServerLine,
        bio: 'API, paiements et intégrations de SDK mobile',
        linkedin: 'https://www.linkedin.com/in/sergio-daklu-859a4734b/',
        github: 'https://github.com/',
        portfolio: ''
    }
];

const TeamPage = () => {
    const { t } = useTranslation();

    return (
        <div className="team-page">
            {/* Header Navigation */}
            <header className="team-header">
                <div className="team-header-container">
                    <Link to="/" className="team-back-link">
                        <RiArrowLeftLine />
                        <span>Retour à l'accueil</span>
                    </Link>

                    <Link to="/" className="team-logo">
                        <img src={Logo} alt="Zamora" />
                        <span>Zamora</span>
                    </Link>

                    <div className="team-header-spacer"></div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="team-hero">
                <div className="team-hero-content">
                    <div className="team-hero-badge">
                        <RiTeamFill />
                        <span>Notre Équipe</span>
                    </div>
                    <h1 className="team-hero-title">
                        Les personnes derrière <span className="highlight">Zamora</span>
                    </h1>
                    <p className="team-hero-subtitle">
                        Une équipe passionnée de 4 développeurs qui travaillent chaque jour
                        pour vous offrir la meilleure expérience de commande restaurant.
                    </p>
                </div>
            </section>

            <section className="team-members-section">
                <div className="team-container">
                    <div className="team-list">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="team-member-item">
                                <div className="team-member-header">
                                    <div className="team-member-name">
                                        {member.name}
                                        {member.isLead && <span className="team-lead-badge">Lead</span>}
                                    </div>
                                    <div className="team-member-role">
                                        <member.roleIcon />
                                        <span>{member.role}</span>
                                    </div>
                                </div>
                                <div className="team-member-bio">
                                    <p>{member.bio}</p>
                                </div>
                                <div className="team-member-socials">
                                    {member.linkedin && (
                                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                                            <RiLinkedinBoxFill />
                                        </a>
                                    )}
                                    {member.github && (
                                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="social-link github">
                                            <RiGithubFill />
                                        </a>
                                    )}
                                    {member.portfolio && (
                                        <a href={member.portfolio} target="_blank" rel="noopener noreferrer" className="social-link portfolio">
                                            <RiGlobalLine />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="team-tech-section">
                <div className="team-container">
                    <div className="tech-stack-content">
                        <h2 className="tech-stack-title">Technologies Utilisées</h2>
                        <p className="tech-stack-subtitle">
                            Notre stack technique moderne pour une application performante
                        </p>
                        <div className="tech-stack-grid">
                            <div className="tech-item">
                                <div className="tech-icon react">
                                    <FaReact />
                                </div>
                                <span>React 18</span>
                            </div>
                            <div className="tech-item">
                                <div className="tech-icon vite">
                                    <SiVite />
                                </div>
                                <span>Vite</span>
                            </div>
                            <div className="tech-item">
                                <div className="tech-icon nodejs">
                                    <FaNodeJs />
                                </div>
                                <span>Node.js</span>
                            </div>
                            <div className="tech-item">
                                <div className="tech-icon mongodb">
                                    <SiMongodb />
                                </div>
                                <span>MongoDB</span>
                            </div>
                            <div className="tech-item">
                                <div className="tech-icon pusher">
                                    <SiPusher />
                                </div>
                                <span>Pusher</span>
                            </div>
                            <div className="tech-item">
                                <div className="tech-icon cloudinary">
                                    <SiCloudinary />
                                </div>
                                <span>Cloudinary</span>
                            </div>
                            <div className="tech-item">
                                <div className="tech-icon webpush">
                                    <RiNotification3Line />
                                </div>
                                <span>WebPush</span>
                            </div>
                            <div className="tech-item">
                                <div className="tech-icon netlify">
                                    <SiNetlify />
                                </div>
                                <span>Netlify</span>
                            </div>
                            <div className="tech-item">
                                <div className="tech-icon render">
                                    <SiRender />
                                </div>
                                <span>Render</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="team-cta-section">
                <div className="team-container">
                    <div className="team-cta-content">
                        <h2>Vous voulez rejoindre l'aventure ?</h2>
                        <p>
                            Découvrez Zamora et commencez à commander vos plats préférés
                            ou digitalisez votre restaurant dès aujourd'hui.
                        </p>
                        <div className="team-cta-actions">
                            <Link to="/register" className="btn-cta-primary">
                                Créer un restaurant
                            </Link>
                            <a href="http://zamora-app.netlify.app/" className="btn-cta-secondary">
                                Voir la démo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

           {/* Footer */}
<footer className="team-footer">
    <div className="team-container">
        <div className="footer-content">
            <div className="footer-brand">
                <Link to="/" className="footer-logo">
                    <img src={Logo} alt="Zamora" />
                    <span>Zamora</span>
                </Link>
                <p className="footer-tagline">
                    Le vrai goût – Commandez vos plats préférés au restaurant ou chez vous,
                    en toute simplicité.
                </p>
            </div>
            <div className="footer-links">
                <div className="footer-column">
                    <h4>Application</h4>
                    <a href="#download">Télécharger</a>
                    <a href="#features">Fonctionnalités</a>
                    <a href="#how-it-works">Comment ça marche</a>
                </div>
                <div className="footer-column">
                    <h4>Restaurateurs</h4>
                    <Link to="/register">Créer un compte</Link>
                    <Link to="/login">Connexion</Link>
                    <a href="#benefits">Avantages</a>
                </div>
                <div className="footer-column">
                    <h4>Informations</h4>
                    <Link to="/team">Crédits & Équipe</Link>
                    <a href="#legal">CGU & Confidentialité</a>
                    <a href="#contact">Contact</a>
                </div>
            </div>
        </div>
        <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Zamora. Tous droits réservés.</p>
            <div className="footer-bottom-links">
                <a href="#legal">CGU & Politique de confidentialité</a>
                <span className="footer-separator">•</span>
                <Link to="/team">Crédits</Link>
            </div>
        </div>
    </div>
</footer>
        </div>
    );
};

export default TeamPage;
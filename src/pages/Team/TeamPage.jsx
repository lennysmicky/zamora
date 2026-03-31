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
    RiTeamFill
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
    SiCloudinary
} from 'react-icons/si';
import {
    RiNotification3Line
} from 'react-icons/ri';
import { FaGooglePlay, FaAppStore } from 'react-icons/fa';

// Images
import Logo from '../../assets/images/logo.png';
import Membre1 from '../../assets/team/Membre1.jpeg';
import Membre2 from '../../assets/team/Membre2.png';
import Membre3 from '../../assets/team/Membre3.jpg';
import Membre4 from '../../assets/team/Membre4.jpeg';
import DefaultAvatar from '../../assets/images/defaultavatar.png';

import './TeamPage.css';

// Équipe du projet
const teamMembers = [
    {
        name: 'Kossi Michael ZODJEKPO',
        role: 'Project Lead & Développeur Fullstack',
        roleIcon: RiCodeSSlashLine,
        photo: Membre1,
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
        photo: Membre2,
        bio: 'API REST, base de données et logique métier',
        linkedin: 'https://www.linkedin.com/in/kelly-sowu-10084238b/',
        github: 'https://github.com/Sowu20/',
        portfolio: ''
    },
    {
        name: 'Kossi Enouagnon HOUNGBEDJI',
        role: 'Développeur Frontend',
        roleIcon: RiLayoutLine,
        photo: Membre3,
        bio: 'Interfaces utilisateur, responsive design et expérience client',
        linkedin: 'https://www.linkedin.com/in/kossi-enouagnon-houngbedji-475984288/',
        github: 'https://github.com/',
        portfolio: ''
    },
    {
        name: 'Sergio DAKLU',
        role: 'Développeur Backend',
        roleIcon: RiServerLine,
        photo: Membre4,
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

            {/* Team Grid Section */}
            <section className="team-members-section">
                <div className="team-container">
                    <div className="team-grid">
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className={`team-card ${member.isLead ? 'team-card-lead' : ''}`}
                            >
                                <div className="team-card-avatar">
                                    <img
                                        src={member.photo || DefaultAvatar}
                                        alt={member.name}
                                    />
                                    {member.isLead && (
                                        <div className="team-avatar-badge">
                                            <RiStarFill />
                                        </div>
                                    )}
                                </div>

                                <div className="team-card-info">
                                    <div className="team-card-header">
                                        <h3 className="team-card-name">
                                            {member.name}
                                            {member.isLead && (
                                                <span className="team-lead-tag">Lead</span>
                                            )}
                                        </h3>

                                        <div className="team-card-role">
                                            <member.roleIcon />
                                            <span>{member.role}</span>
                                        </div>
                                    </div>

                                    <p className="team-card-bio">{member.bio}</p>

                                    <div className="team-card-socials">
                                        {member.linkedin && (
                                            <a
                                                href={member.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="team-social-link linkedin"
                                                aria-label={`LinkedIn de ${member.name}`}
                                            >
                                                <RiLinkedinBoxFill />
                                            </a>
                                        )}
                                        {member.github && (
                                            <a
                                                href={member.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="team-social-link github"
                                                aria-label={`GitHub de ${member.name}`}
                                            >
                                                <RiGithubFill />
                                            </a>
                                        )}
                                        {member.portfolio && (
                                            <a
                                                href={member.portfolio}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="team-social-link portfolio"
                                                aria-label={`Portfolio de ${member.name}`}
                                            >
                                                <RiGlobalLine />
                                            </a>
                                        )}
                                    </div>
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
                            {/* <div className="tech-item">
                                <div className="tech-icon laravel">
                                    <SiLaravel />
                                </div>
                                <span>Laravel</span>
                            </div> */}
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
                    <div className="team-footer-content">
                        <div className="team-footer-brand">
                            <Link to="/" className="team-footer-logo">
                                <img src={Logo} alt="Zamora" />
                                <span>Zamora</span>
                            </Link>
                            <p>Le vrai goût — Commandez vos plats préférés</p>
                        </div>
                        <div className="team-footer-links">
                            <a href="http://zamora-app.netlify.app/">Demo</a>
                            <a href="https://github.com/lennysmicky/zamora">GitHub</a>
                            <a href="#team">Équipe</a>
                        </div>
                    </div>
                    <div className="team-footer-bottom">
                        <p>&copy; {new Date().getFullYear()} Zamora. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TeamPage;
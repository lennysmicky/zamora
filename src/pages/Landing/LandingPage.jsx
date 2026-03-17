import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    RiQrCodeLine,
    RiSmartphoneLine,
    RiTimeLine,
    RiSecurePaymentLine,
    RiPieChartLine,
    RiTeamLine,
    RiNotification3Line,
    RiTableLine,
    RiArrowRightLine,
    RiCheckLine,
    RiStarFill,
    RiPlayCircleLine,
    RiDownloadLine,
    RiHome4Line,
    RiRestaurantLine,
    RiMenuLine,
    RiCloseLine
} from 'react-icons/ri';
import { FaGooglePlay, FaAppStore } from 'react-icons/fa';

// Images
import Logo from '../../assets/images/logo.png';
import BurgerImg from '../../assets/images/food/burger.jpg';
import PizzaImg from '../../assets/images/food/pizza.jpg';
import foutouImg from '../../assets/images/food/Le-foutou.jpg';
import FriesImg from '../../assets/images/food/fries.png';
import RiceImg from '../../assets/images/food/rice.jpg';
import DrinkImg from '../../assets/images/food/drink.jpg';
import IcecreamImg from '../../assets/images/food/icecream.jpg';
import PhoneMockup from '../../assets/images/phoo-left.png';

import './LandingPage.css';

// Liste des plats pour le slider
const foodItems = [
    { img: BurgerImg, name: 'Classic Burger', desc: 'Boeuf juteux, salade fraîche, tomate et sauce maison' },
    { img: PizzaImg, name: 'Pizza Margherita', desc: 'Sauce tomate, mozzarella fondante et basilic frais' },
    { img: foutouImg, name: 'Le Fufu', desc: 'Plat traditionnel togolais avec viande et légumes' },
    { img: FriesImg, name: 'Frites Maison', desc: 'Croustillantes à l\'extérieur, fondantes à l\'intérieur' },
    { img: RiceImg, name: 'riz aux légumes', desc: 'Riz cuit avec une variété de légumes frais' },
    { img: DrinkImg, name: 'Boissons Fraîches', desc: 'Sodas, jus de fruits et cocktails maison' },
    { img: IcecreamImg, name: 'Glace Artisanale', desc: 'Vanille de Madagascar, onctueuse et crémeuse' }
];

const LandingPage = () => {
    const { t } = useTranslation();
    const [currentFood, setCurrentFood] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const particlesRef = useRef(null);

    // Animation au scroll
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    // Slider automatique des images
    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentFood(prev => (prev + 1) % foodItems.length);
                setIsAnimating(false);
            }, 500);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Générer des particules
    const generateParticles = () => {
        const particles = [];
        for (let i = 0; i < 15; i++) {
            const style = {
                '--x': `${Math.random() * 100}%`,
                '--y': `${Math.random() * 100}%`,
                '--delay': `${Math.random() * 2}s`,
                '--size': `${Math.random() * 6 + 3}px`,
                '--duration': `${Math.random() * 3 + 2}s`
            };
            particles.push(<div key={i} className="particle" style={style} />);
        }
        return particles;
    };

    const features = [
        {
            icon: RiQrCodeLine,
            title: 'Commande via QR Code',
            description: 'Au restaurant, scannez le QR code sur votre table pour accéder au menu et commander instantanément.'
        },
        {
            icon: RiSmartphoneLine,
            title: 'Commande depuis l\'app',
            description: 'Chez vous, commandez directement depuis l\'application mobile et faites-vous livrer.'
        },
        {
            icon: RiTimeLine,
            title: 'Suivi en temps réel',
            description: 'Suivez votre commande en direct, de la préparation jusqu\'à la livraison ou le service.'
        },
        {
            icon: RiSecurePaymentLine,
            title: 'Paiement sécurisé',
            description: 'Payez par carte bancaire, mobile money ou en espèces à la livraison.'
        },
        {
            icon: RiTableLine,
            title: 'Réservation de table',
            description: 'Réservez votre table à l\'avance et évitez l\'attente au restaurant.'
        },
        {
            icon: RiPieChartLine,
            title: 'Historique & favoris',
            description: 'Retrouvez vos commandes passées et recommandez vos plats préférés en un clic.'
        }
    ];

    const howItWorks = [
        {
            icon: RiRestaurantLine,
            title: 'Au restaurant',
            description: 'Scannez le QR code sur votre table, consultez le menu, passez commande et payez. Tout depuis votre téléphone.',
            step: '1'
        },
        {
            icon: RiHome4Line,
            title: 'Chez vous',
            description: 'Ouvrez l\'app Zamora, choisissez votre restaurant, commandez et faites-vous livrer directement.',
            step: '2'
        },
        {
            icon: RiTimeLine,
            title: 'Suivez en direct',
            description: 'Recevez des notifications à chaque étape : préparation, en route, arrivée imminente.',
            step: '3'
        }
    ];

    const benefits = [
        'Réduction du temps d\'attente',
        'Commandez où que vous soyez',
        'Paiement simple et sécurisé',
        'Suivi de commande en temps réel',
        'Historique de vos commandes',
        'Offres exclusives dans l\'app'
    ];

    return (
        <div className="landing-page">
            {/* Header */}
            <header className="landing-header">
                <div className="landing-container">
                    <Link to="/" className="landing-logo">
                        <img src={Logo} alt="Zamora" />
                        <span>Zamora</span>
                    </Link>

                    <nav className={`landing-nav ${mobileMenuOpen ? 'open' : ''}`}>
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
                        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
                        <a href="#download" onClick={() => setMobileMenuOpen(false)}>Télécharger</a>
                        <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                    </nav>

                    <div className="landing-header-actions">
                        <Link to="/login" className="btn-login">
                            Connexion
                        </Link>
                        <Link to="/register" className="btn-register">
                            <span className="btn-register-text">Espace Restaurant</span>
                            <RiArrowRightLine />
                        </Link>
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-container">
                    <div className="hero-content">
                        <div className="hero-badge animate-on-scroll">
                        
                            <span>Application #1 de commande restaurant</span>
                        </div>
                        <h1 className="hero-title animate-on-scroll">
                            <span className="hero-title-line">Commandez vos plats</span>
                            <span className="hero-title-highlight">Le vrai goût</span>
                        </h1>
                        <p className="hero-subtitle animate-on-scroll">
                            Au restaurant ou chez vous, commandez facilement vos plats préférés.
                            Scannez, commandez, payez et savourez !
                        </p>
                        <div className="hero-actions animate-on-scroll">
                            <a href="#download" className="btn-primary-lg">
                                <RiDownloadLine />
                                Télécharger l'app
                            </a>
                            <Link to="/auth/restaurant/register" className="btn-secondary-lg">
                                <RiRestaurantLine />
                                Je suis restaurateur
                            </Link>
                        </div>
                        <div className="hero-stats animate-on-scroll">
                            <div className="hero-stat">
                                <span className="stat-number">500+</span>
                                <span className="stat-label">Restaurants</span>
                            </div>
                            <div className="hero-stat-divider"></div>
                            <div className="hero-stat">
                                <span className="stat-number">50K+</span>
                                <span className="stat-label">Téléchargements</span>
                            </div>
                            <div className="hero-stat-divider"></div>
                            <div className="hero-stat">
                                <span className="stat-number">4.9</span>
                                <span className="stat-label">Note moyenne</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual - Single Image Slider with Particles */}
                    <div className="hero-visual animate-on-scroll">
                        <div className="hero-slider">
                            {/* Particules */}
                            <div className="particles-container" ref={particlesRef}>
                                {generateParticles()}
                            </div>

                            {/* Image principale */}
                            <div className={`hero-food-container ${isAnimating ? 'animating-out' : 'animating-in'}`}>
                                <img
                                    src={foodItems[currentFood].img}
                                    alt={foodItems[currentFood].name}
                                    className="hero-food-image"
                                />
                            </div>

                            {/* Info sous l'image */}
                            <div className={`hero-food-info ${isAnimating ? 'animating-out' : 'animating-in'}`}>
                                <h3 className="hero-food-name">{foodItems[currentFood].name}</h3>
                                <p className="hero-food-desc">{foodItems[currentFood].desc}</p>
                            </div>

                            {/* Indicateurs */}
                            <div className="slider-indicators">
                                {foodItems.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`slider-dot ${index === currentFood ? 'active' : ''}`}
                                        onClick={() => {
                                            setIsAnimating(true);
                                            setTimeout(() => {
                                                setCurrentFood(index);
                                                setIsAnimating(false);
                                            }, 300);
                                        }}
                                        aria-label={`Voir ${foodItems[index].name}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features" id="features">
                <div className="landing-container">
                    <div className="section-header animate-on-scroll">
                        <span className="section-badge">Fonctionnalités</span>
                        <h2>Tout pour commander facilement</h2>
                        <p>Que vous soyez au restaurant ou chez vous, Zamora simplifie votre expérience culinaire</p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card animate-on-scroll"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="feature-icon">
                                    <feature.icon />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="landing-how-it-works" id="how-it-works">
                <div className="landing-container">
                    <div className="section-header animate-on-scroll">
                        <span className="section-badge">Comment ça marche</span>
                        <h2>Simple comme bonjour</h2>
                    </div>
                    <div className="steps-container">
                        {howItWorks.map((step, index) => (
                            <React.Fragment key={index}>
                                <div className="step animate-on-scroll">
                                    <div className="step-number">{step.step}</div>
                                    <div className="step-icon-wrapper">
                                        <step.icon />
                                    </div>
                                    <div className="step-content">
                                        <h3>{step.title}</h3>
                                        <p>{step.description}</p>
                                    </div>
                                </div>
                                {index < howItWorks.length - 1 && <div className="step-connector"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* Download Section */}
            <section className="landing-download" id="download">
                <div className="landing-container">
                    <div className="download-content">
                        <div className="download-text animate-on-scroll">
                            <span className="section-badge">Téléchargement</span>
                            <h2>Téléchargez l'app Zamora</h2>
                            <p>
                                Commandez vos plats préférés où que vous soyez.
                                L'application est disponible sur Google Play Store et App Store.
                            </p>
                            <div className="download-buttons">
                                <a 
                                    href="https://play.google.com/store" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="download-btn playstore"
                                >
                                    <FaGooglePlay />
                                    <div className="download-btn-text">
                                        <span className="download-btn-label">Disponible sur</span>
                                        <span className="download-btn-platform">Google Play</span>
                                    </div>
                                </a>
                                <a 
                                    href="https://www.apple.com/app-store/" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="download-btn appstore"
                                >
                                    <FaAppStore />
                                    <div className="download-btn-text">
                                        <span className="download-btn-label">Télécharger sur</span>
                                        <span className="download-btn-platform">App Store</span>
                                    </div>
                                </a>
                            </div>
                            <div className="download-note">
                                <RiCheckLine />
                                <span>Installation facile • Mises à jour automatiques • 100% gratuit</span>
                            </div>
                        </div>
                        <div className="download-visual animate-on-scroll">
                            <img src={PhoneMockup} alt="Application Zamora" className="phone-mockup-image" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="landing-benefits" id="benefits">
                <div className="landing-container">
                    <div className="benefits-content">
                        <div className="benefits-text animate-on-scroll">
                            <span className="section-badge">Avantages</span>
                            <h2>Pourquoi choisir Zamora ?</h2>
                            <p>Une expérience de commande unique, pensée pour vous simplifier la vie</p>
                            <ul className="benefits-list">
                                {benefits.map((benefit, index) => (
                                    <li key={index}>
                                        <RiCheckLine />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                            <a href="#download" className="btn-primary-lg">
                                <RiDownloadLine />
                                Télécharger maintenant
                            </a>
                        </div>
                        <div className="benefits-visual animate-on-scroll">
                            <div className="benefits-image-container">
                                <img src={BurgerImg} alt="Burger" className="benefit-food food-main" />
                                <img src={PizzaImg} alt="Pizza" className="benefit-food food-secondary" />
                                <img src={FriesImg} alt="Fries" className="benefit-food food-tertiary" />
                                <div className="benefits-stats-card">
                                    <div className="stats-card-header">
                                        <RiPieChartLine />
                                        <span>Satisfaction client</span>
                                    </div>
                                    <div className="stats-card-value">98%</div>
                                    <div className="stats-card-label">de clients satisfaits</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Pour les restaurateurs */}
            <section className="landing-cta" id="contact">
                <div className="landing-container">
                    <div className="cta-content animate-on-scroll">
                        <h2>Vous êtes restaurateur ?</h2>
                        <p>
                            Rejoignez Zamora et digitalisez votre restaurant.
                            Gérez vos commandes, menus et paiements depuis un seul tableau de bord.
                        </p>
                        <div className="cta-actions">
                            <Link to="/auth/restaurant/register" className="btn-cta-primary">
                                Créer mon restaurant
                                <RiArrowRightLine />
                            </Link>
                            <Link to="/auth/restaurant/login" className="btn-cta-secondary">
                                J'ai déjà un compte
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <Link to="/" className="footer-logo">
                                <img src={Logo} alt="Zamora" />
                                <span>Zamora</span>
                            </Link>
                            <p className="footer-tagline">
                                Le vrai goût - Commandez vos plats préférés au restaurant ou chez vous,
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
                                <Link to="/auth/restaurant/register">Créer un compte</Link>
                                <Link to="/auth/restaurant/login">Connexion</Link>
                                <a href="#benefits">Avantages</a>
                            </div>
                            <div className="footer-column">
                                <h4>Légal</h4>
                                <a href="#privacy">Confidentialité</a>
                                <a href="#terms">CGU</a>
                                <a href="#contact">Contact</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} Zamora. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
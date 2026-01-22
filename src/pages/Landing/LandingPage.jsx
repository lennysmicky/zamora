import React, { useEffect, useRef } from 'react';
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
  RiPlayCircleLine
} from 'react-icons/ri';

// Images
import Logo from '../../assets/images/logo.png';
import BurgerImg from '../../assets/images/food/burger.png';
import PizzaImg from '../../assets/images/food/pizza.png';
import TacoImg from '../../assets/images/food/taco.png';
import FriesImg from '../../assets/images/food/fries.png';
import HotdogImg from '../../assets/images/food/hotdog.png';
import DrinkImg from '../../assets/images/food/drink.png';
import DonutImg from '../../assets/images/food/donut.png';
import IcecreamImg from '../../assets/images/food/icecream.png';

import './LandingPage.css';

const LandingPage = () => {
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

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

  const features = [
    {
      icon: RiQrCodeLine,
      title: t('landing.features.qrCode.title'),
      description: t('landing.features.qrCode.description')
    },
    {
      icon: RiTimeLine,
      title: t('landing.features.realtime.title'),
      description: t('landing.features.realtime.description')
    },
    {
      icon: RiSecurePaymentLine,
      title: t('landing.features.payment.title'),
      description: t('landing.features.payment.description')
    },
    {
      icon: RiPieChartLine,
      title: t('landing.features.analytics.title'),
      description: t('landing.features.analytics.description')
    },
    {
      icon: RiTableLine,
      title: t('landing.features.tables.title'),
      description: t('landing.features.tables.description')
    },
    {
      icon: RiTeamLine,
      title: t('landing.features.multiuser.title'),
      description: t('landing.features.multiuser.description')
    }
  ];

  const benefits = [
    t('landing.benefits.list.waitTime'),
    t('landing.benefits.list.sales'),
    t('landing.benefits.list.organization'),
    t('landing.benefits.list.realtime'),
    t('landing.benefits.list.experience'),
    t('landing.benefits.list.automation')
  ];

  return (
    <div className="landing-page">
      {/* Floating Food Elements */}
      <div className="floating-foods">
        <img src={BurgerImg} alt="" className="floating-food food-1" />
        <img src={PizzaImg} alt="" className="floating-food food-2" />
        <img src={TacoImg} alt="" className="floating-food food-3" />
        <img src={FriesImg} alt="" className="floating-food food-4" />
        <img src={HotdogImg} alt="" className="floating-food food-5" />
        <img src={DrinkImg} alt="" className="floating-food food-6" />
        <img src={DonutImg} alt="" className="floating-food food-7" />
        <img src={IcecreamImg} alt="" className="floating-food food-8" />
      </div>

      {/* Header */}
      <header className="landing-header">
        <div className="landing-container">
          <Link to="/" className="landing-logo">
            <img src={Logo} alt="Zamora" />
            <span>Zamora</span>
          </Link>
          <nav className="landing-nav">
            <a href="#features">{t('landing.nav.features')}</a>
            <a href="#benefits">{t('landing.nav.benefits')}</a>
            <a href="#contact">{t('landing.nav.contact')}</a>
          </nav>
          <div className="landing-header-actions">
            <Link to="/login" className="btn-login">
              {t('landing.nav.login')}
            </Link>
            <Link to="/register" className="btn-register">
              {t('landing.nav.register')}
              <RiArrowRightLine />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero" ref={heroRef}>
        <div className="landing-container">
          <div className="hero-content">
            <div className="hero-badge animate-on-scroll">
              <RiStarFill />
              <span>{t('landing.hero.badge')}</span>
            </div>
            <h1 className="hero-title animate-on-scroll">
              <span className="hero-title-line">{t('landing.hero.title1')}</span>
              <span className="hero-title-highlight">{t('landing.hero.titleHighlight')}</span>
            </h1>
            <p className="hero-subtitle animate-on-scroll">
              {t('landing.hero.subtitle')}
            </p>
            <div className="hero-actions animate-on-scroll">
              <Link to="/register" className="btn-primary-lg">
                {t('landing.hero.getStarted')}
                <RiArrowRightLine />
              </Link>
              <button className="btn-secondary-lg">
                <RiPlayCircleLine />
                {t('landing.hero.watchDemo')}
              </button>
            </div>
            <div className="hero-stats animate-on-scroll">
              <div className="hero-stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">{t('landing.hero.stats.restaurants')}</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">{t('landing.hero.stats.orders')}</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="stat-number">4.9</span>
                <span className="stat-label">{t('landing.hero.stats.rating')}</span>
              </div>
            </div>
          </div>
          <div className="hero-visual animate-on-scroll">
            <div className="hero-phone">
              <div className="phone-screen">
                <div className="phone-header">
                  <img src={Logo} alt="Zamora" />
                  <span>Zamora</span>
                </div>
                <div className="phone-menu">
                  <div className="menu-item">
                    <img src={BurgerImg} alt="Burger" />
                    <div className="menu-item-info">
                      <span className="menu-item-name">Classic Burger</span>
                      <span className="menu-item-price">2500 FCFA</span>
                    </div>
                  </div>
                  <div className="menu-item">
                    <img src={PizzaImg} alt="Pizza" />
                    <div className="menu-item-info">
                      <span className="menu-item-name">Margherita</span>
                      <span className="menu-item-price">4500 FCFA</span>
                    </div>
                  </div>
                  <div className="menu-item">
                    <img src={TacoImg} alt="Taco" />
                    <div className="menu-item-info">
                      <span className="menu-item-name">Taco Mexican</span>
                      <span className="menu-item-price">1800 FCFA</span>
                    </div>
                  </div>
                </div>
                <div className="phone-cta">
                  <button>{t('landing.hero.orderNow')}</button>
                </div>
              </div>
            </div>
            <div className="hero-cards">
              <div className="floating-card card-order">
                <RiSmartphoneLine />
                <div>
                  <span className="card-title">{t('landing.hero.cards.newOrder')}</span>
                  <span className="card-subtitle">Table 5 • 3 {t('landing.hero.cards.items')}</span>
                </div>
              </div>
              <div className="floating-card card-payment">
                <RiSecurePaymentLine />
                <div>
                  <span className="card-title">{t('landing.hero.cards.payment')}</span>
                  <span className="card-subtitle">12,500 FCFA</span>
                </div>
              </div>
              <div className="floating-card card-notification">
                <RiNotification3Line />
                <div>
                  <span className="card-title">{t('landing.hero.cards.ready')}</span>
                  <span className="card-subtitle">{t('landing.hero.cards.orderReady')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" id="features" ref={featuresRef}>
        <div className="landing-container">
          <div className="section-header animate-on-scroll">
            <span className="section-badge">{t('landing.features.badge')}</span>
            <h2>{t('landing.features.title')}</h2>
            <p>{t('landing.features.subtitle')}</p>
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
      <section className="landing-how-it-works">
        <div className="landing-container">
          <div className="section-header animate-on-scroll">
            <span className="section-badge">{t('landing.howItWorks.badge')}</span>
            <h2>{t('landing.howItWorks.title')}</h2>
          </div>
          <div className="steps-container">
            <div className="step animate-on-scroll">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>{t('landing.howItWorks.step1.title')}</h3>
                <p>{t('landing.howItWorks.step1.description')}</p>
              </div>
              <div className="step-image">
                <RiQrCodeLine />
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step animate-on-scroll">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>{t('landing.howItWorks.step2.title')}</h3>
                <p>{t('landing.howItWorks.step2.description')}</p>
              </div>
              <div className="step-image">
                <RiSmartphoneLine />
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step animate-on-scroll">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>{t('landing.howItWorks.step3.title')}</h3>
                <p>{t('landing.howItWorks.step3.description')}</p>
              </div>
              <div className="step-image">
                <RiSecurePaymentLine />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="landing-benefits" id="benefits">
        <div className="landing-container">
          <div className="benefits-content">
            <div className="benefits-text animate-on-scroll">
              <span className="section-badge">{t('landing.benefits.badge')}</span>
              <h2>{t('landing.benefits.title')}</h2>
              <p>{t('landing.benefits.subtitle')}</p>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index}>
                    <RiCheckLine />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-primary-lg">
                {t('landing.benefits.cta')}
                <RiArrowRightLine />
              </Link>
            </div>
            <div className="benefits-visual animate-on-scroll">
              <div className="benefits-image-container">
                <img src={BurgerImg} alt="Burger" className="benefit-food food-main" />
                <img src={PizzaImg} alt="Pizza" className="benefit-food food-secondary" />
                <img src={FriesImg} alt="Fries" className="benefit-food food-tertiary" />
                <div className="benefits-stats-card">
                  <div className="stats-card-header">
                    <RiPieChartLine />
                    <span>{t('landing.benefits.statsCard.title')}</span>
                  </div>
                  <div className="stats-card-value">+45%</div>
                  <div className="stats-card-label">{t('landing.benefits.statsCard.label')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta" id="contact">
        <div className="landing-container">
          <div className="cta-content animate-on-scroll">
            <h2>{t('landing.cta.title')}</h2>
            <p>{t('landing.cta.subtitle')}</p>
            <div className="cta-actions">
              <Link to="/register" className="btn-cta-primary">
                {t('landing.cta.register')}
                <RiArrowRightLine />
              </Link>
              <Link to="/login" className="btn-cta-secondary">
                {t('landing.cta.login')}
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
              <p className="footer-tagline">{t('landing.footer.tagline')}</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>{t('landing.footer.product')}</h4>
                <a href="#features">{t('landing.footer.features')}</a>
                <a href="#benefits">{t('landing.footer.benefits')}</a>
                <a href="#pricing">{t('landing.footer.pricing')}</a>
              </div>
              <div className="footer-column">
                <h4>{t('landing.footer.company')}</h4>
                <a href="#about">{t('landing.footer.about')}</a>
                <a href="#contact">{t('landing.footer.contact')}</a>
                <a href="#careers">{t('landing.footer.careers')}</a>
              </div>
              <div className="footer-column">
                <h4>{t('landing.footer.legal')}</h4>
                <a href="#privacy">{t('landing.footer.privacy')}</a>
                <a href="#terms">{t('landing.footer.terms')}</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Zamora. {t('landing.footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
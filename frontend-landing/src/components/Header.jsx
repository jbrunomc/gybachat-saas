import React, { useState, useEffect } from 'react';
import { Menu, X, MessageSquare, ArrowRight } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-gybachat rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                Gybachat
              </span>
              <span className={`text-xs transition-colors ${
                isScrolled ? 'text-gray-500' : 'text-white/80'
              }`}>
                WhatsApp Business
              </span>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('features')}
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-gray-700' : 'text-white/90'
              }`}
            >
              Funcionalidades
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-gray-700' : 'text-white/90'
              }`}
            >
              Preços
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-gray-700' : 'text-white/90'
              }`}
            >
              Depoimentos
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-gray-700' : 'text-white/90'
              }`}
            >
              FAQ
            </button>
          </nav>

          {/* CTA Buttons Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <a
              href="https://app.gybachat.com.br/client/login"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-gray-700' : 'text-white/90'
              }`}
            >
              Entrar
            </a>
            <button
              onClick={() => scrollToSection('pricing')}
              className="btn-gybachat group"
            >
              Começar Grátis
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-200 animate-slide-up">
            <div className="px-4 py-6 space-y-4">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
              >
                Funcionalidades
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
              >
                Preços
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="block w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
              >
                Depoimentos
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
              >
                FAQ
              </button>
              
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <a
                  href="https://app.gybachat.com.br/client/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Entrar
                </a>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="block w-full btn-gybachat"
                >
                  Começar Grátis
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;


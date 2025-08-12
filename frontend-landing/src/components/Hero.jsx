import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, CheckCircle, Star, Users, MessageSquare, Zap } from 'lucide-react';

const Hero = () => {
  const [currentText, setCurrentText] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const heroTexts = [
    "Transforme seu WhatsApp em uma máquina de vendas",
    "Automatize respostas e aumente sua conversão",
    "Gerencie múltiplos atendentes em um só lugar"
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % heroTexts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openDemo = () => {
    // TODO: Adicionar link do vídeo quando estiver pronto
    // window.open('https://www.youtube.com/watch?v=VIDEO_ID', '_blank');
    console.log('Abrir vídeo demonstração');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-gybachat">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`text-center lg:text-left transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 animate-fade-in">
              <Star className="w-4 h-4 mr-2 text-yellow-300" />
              Mais de 1.000 empresas confiam no Gybachat
            </div>

            {/* Main Title */}
            <h1 className="hero-title font-bold text-white mb-6 leading-tight">
              <span className="block transition-all duration-500">
                {heroTexts[currentText]}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Gerencie todas as conversas em um só lugar, automatize respostas e aumente suas vendas 
              com a plataforma de atendimento mais completa do Brasil.
            </p>

            {/* Features List */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
              <div className="flex items-center text-white/90 text-sm">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                14 dias grátis
              </div>
              <div className="flex items-center text-white/90 text-sm">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                Sem cartão de crédito
              </div>
              <div className="flex items-center text-white/90 text-sm">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                Suporte 24/7
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={scrollToPricing}
                className="btn-gybachat bg-white text-primary hover:bg-gray-50 group text-lg px-8 py-4"
              >
                Começar Teste Grátis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={openDemo}
                className="btn-gybachat-outline border-white text-white hover:bg-white hover:text-primary group text-lg px-8 py-4"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Ver Demonstração
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-white/70 text-sm mb-4">Empresas que já aumentaram suas vendas:</p>
              <div className="flex items-center justify-center lg:justify-start space-x-8 opacity-70">
                <div className="text-white font-semibold">TechSolutions</div>
                <div className="text-white font-semibold">E-commerce Plus</div>
                <div className="text-white font-semibold">Digital Corp</div>
                <div className="text-white font-semibold">+997 outras</div>
              </div>
            </div>
          </div>

          {/* Visual/Dashboard Preview */}
          <div className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Dashboard Mockup */}
            <div className="relative">
              {/* Main Dashboard */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 animate-float">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-white font-semibold">Gybachat Dashboard</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Users className="w-6 h-6 text-white mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">1,234</div>
                    <div className="text-white/70 text-xs">Conversas</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <MessageSquare className="w-6 h-6 text-white mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">5,678</div>
                    <div className="text-white/70 text-xs">Mensagens</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Zap className="w-6 h-6 text-white mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">89%</div>
                    <div className="text-white/70 text-xs">Conversão</div>
                  </div>
                </div>

                {/* Chat Preview */}
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">JS</span>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">João Silva</div>
                      <div className="text-white/70 text-xs">Online agora</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white/30 rounded-lg p-2 text-white text-sm">
                      Olá! Gostaria de saber mais sobre os planos
                    </div>
                    <div className="bg-primary/80 rounded-lg p-2 text-white text-sm ml-8">
                      Claro! Temos 3 planos que se adaptam ao seu negócio...
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-bounce">
                +300% vendas
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-bounce" style={{ animationDelay: '1s' }}>
                24/7 ativo
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


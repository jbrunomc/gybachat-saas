import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Users, 
  Zap, 
  BarChart3, 
  Shield, 
  Smartphone,
  Bot,
  Clock,
  Globe,
  Headphones,
  Database,
  Settings
} from 'lucide-react';

const Features = () => {
  const [visibleFeatures, setVisibleFeatures] = useState(new Set());
  const featuresRef = useRef([]);

  const features = [
    {
      icon: MessageSquare,
      title: "Multi WhatsApp",
      description: "Conecte até 10 números WhatsApp e gerencie tudo em um painel único. Perfeito para empresas com múltiplos departamentos.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      delay: "0ms"
    },
    {
      icon: Users,
      title: "Equipe Colaborativa",
      description: "Distribua conversas automaticamente entre sua equipe de vendas. Sistema inteligente de filas e balanceamento de carga.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      delay: "100ms"
    },
    {
      icon: Zap,
      title: "Automações Inteligentes",
      description: "Respostas automáticas, chatbots e fluxos de atendimento personalizados. Aumente a eficiência em 300%.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      delay: "200ms"
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Analytics completo para otimizar sua estratégia de vendas. Dashboards em tempo real com métricas detalhadas.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      delay: "300ms"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Dados criptografados e backup automático de todas as conversas. Conformidade com LGPD garantida.",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      delay: "400ms"
    },
    {
      icon: Smartphone,
      title: "App Mobile",
      description: "Atenda seus clientes de qualquer lugar com nosso app nativo. Disponível para iOS e Android.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      delay: "500ms"
    },
    {
      icon: Bot,
      title: "Chatbot Avançado",
      description: "IA integrada para respostas inteligentes. Aprende com suas conversas e melhora continuamente.",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      delay: "600ms"
    },
    {
      icon: Clock,
      title: "Atendimento 24/7",
      description: "Nunca perca uma venda. Sistema funciona 24 horas por dia, 7 dias por semana, sem interrupções.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      delay: "700ms"
    },
    {
      icon: Globe,
      title: "Multi-idiomas",
      description: "Suporte completo para português, inglês e espanhol. Expanda seus negócios internacionalmente.",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      delay: "800ms"
    },
    {
      icon: Headphones,
      title: "Suporte Premium",
      description: "Equipe especializada disponível via chat, email e telefone. Onboarding personalizado incluído.",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      delay: "900ms"
    },
    {
      icon: Database,
      title: "Backup Automático",
      description: "Todas as conversas e dados são salvos automaticamente a cada 5 minutos. Nunca perca informações importantes.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      delay: "1000ms"
    },
    {
      icon: Settings,
      title: "Integrações",
      description: "Conecte com CRM, ERP, e-commerce e mais de 100 ferramentas. API completa para desenvolvedores.",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      delay: "1100ms"
    }
  ];

  useEffect(() => {
    const observers = featuresRef.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleFeatures(prev => new Set([...prev, index]));
            }, index * 100);
          }
        },
        { threshold: 0.1 }
      );
      
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  return (
    <section id="features" className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4 mr-2" />
            Funcionalidades Completas
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Tudo que você precisa para
            <span className="text-gradient-gybachat block">vender mais</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Funcionalidades completas para transformar seu atendimento WhatsApp em uma 
            máquina de vendas profissional e automatizada.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleFeatures.has(index);
            
            return (
              <div
                key={index}
                ref={el => featuresRef.current[index] = el}
                className={`group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 card-hover ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: feature.delay }}
              >
                {/* Icon */}
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${feature.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-1 bg-gradient-gybachat rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-gybachat rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Pronto para revolucionar seu atendimento?
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Junte-se a mais de 1.000 empresas que já aumentaram suas vendas com o Gybachat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-primary hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Ver Planos e Preços
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold py-4 px-8 rounded-lg transition-all duration-300">
                Falar com Especialista
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;


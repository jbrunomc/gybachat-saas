import React, { useState, useEffect } from 'react';
import { Star, Quote, ArrowLeft, ArrowRight, Play } from 'lucide-react';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Carlos Silva",
      position: "CEO",
      company: "TechSolutions",
      avatar: "/images/avatar-carlos.png",
      rating: 5,
      text: "O Gybachat revolucionou nosso atendimento. Aumentamos as vendas em 300% no primeiro mês. A automação é incrível e a equipe de suporte é excepcional.",
      results: {
        increase: "300%",
        metric: "vendas",
        time: "1º mês"
      },
      videoUrl: null
    },
    {
      id: 2,
      name: "Ana Costa",
      position: "Diretora de Vendas",
      company: "E-commerce Plus",
      avatar: "/images/avatar-ana.png",
      rating: 5,
      text: "Gerenciar 5 números WhatsApp nunca foi tão fácil. O sistema de distribuição automática de conversas otimizou nossa operação completamente.",
      results: {
        increase: "250%",
        metric: "eficiência",
        time: "2 semanas"
      },
      videoUrl: null
    },
    {
      id: 3,
      name: "Roberto Mendes",
      position: "Fundador",
      company: "Digital Corp",
      avatar: "/images/avatar-roberto.png",
      rating: 5,
      text: "Os relatórios em tempo real me dão total controle sobre as vendas. Consigo identificar oportunidades e otimizar a estratégia diariamente.",
      results: {
        increase: "180%",
        metric: "conversão",
        time: "3 semanas"
      },
      videoUrl: null
    },
    {
      id: 4,
      name: "Mariana Santos",
      position: "Gerente de Marketing",
      company: "StartupBR",
      avatar: "/images/avatar-mariana.png",
      rating: 5,
      text: "A integração com nosso CRM foi perfeita. Agora temos um funil de vendas completo e não perdemos mais nenhum lead importante.",
      results: {
        increase: "400%",
        metric: "leads convertidos",
        time: "1 mês"
      },
      videoUrl: null
    },
    {
      id: 5,
      name: "Pedro Oliveira",
      position: "Diretor Comercial",
      company: "MegaStore",
      avatar: "/images/avatar-pedro.png",
      rating: 5,
      text: "O chatbot inteligente responde 80% das dúvidas automaticamente. Nossa equipe agora foca apenas nos leads qualificados. Resultado: mais vendas!",
      results: {
        increase: "220%",
        metric: "produtividade",
        time: "2 meses"
      },
      videoUrl: null
    },
    {
      id: 6,
      name: "Juliana Ferreira",
      position: "Proprietária",
      company: "Boutique Fashion",
      avatar: "/images/avatar-juliana.png",
      rating: 5,
      text: "Como pequena empresária, o Gybachat me deu ferramentas de uma grande corporação. Atendo melhor meus clientes e vendo muito mais.",
      results: {
        increase: "150%",
        metric: "faturamento",
        time: "6 semanas"
      },
      videoUrl: null
    }
  ];

  const stats = [
    { number: "1.247", label: "Empresas ativas", suffix: "+" },
    { number: "98.5", label: "Satisfação", suffix: "%" },
    { number: "2.8M", label: "Mensagens/mês", suffix: "" },
    { number: "24/7", label: "Suporte", suffix: "" }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
    setIsAutoPlaying(false);
  };

  const current = testimonials[currentTestimonial];

  return (
    <section id="testimonials" className="section-padding bg-gradient-gybachat text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
            <Star className="w-4 h-4 mr-2 text-yellow-300" />
            Depoimentos Reais
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Mais de 1.000 empresas já
            <span className="block">aumentaram suas vendas</span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Veja como o Gybachat está transformando negócios em todo o Brasil
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-2">
                {stat.number}{stat.suffix}
              </div>
              <div className="text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Testimonial */}
        <div className="relative">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Testimonial Content */}
              <div>
                <Quote className="w-12 h-12 text-white/50 mb-6" />
                
                <div className="flex items-center mb-4">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <blockquote className="text-xl lg:text-2xl font-medium leading-relaxed mb-8">
                  "{current.text}"
                </blockquote>

                {/* Results Badge */}
                <div className="inline-flex items-center bg-green-500/20 border border-green-400/30 rounded-full px-6 py-3 mb-8">
                  <div className="text-green-300 font-bold text-lg mr-2">
                    +{current.results.increase}
                  </div>
                  <div className="text-white/90 text-sm">
                    {current.results.metric} em {current.results.time}
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-white/20"
                  />
                  <div>
                    <div className="font-semibold text-lg">{current.name}</div>
                    <div className="text-white/80">{current.position}</div>
                    <div className="text-white/60 text-sm">{current.company}</div>
                  </div>
                </div>
              </div>

              {/* Video/Image */}
              <div className="relative">
                <div className="aspect-video bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center">
                  {current.videoUrl ? (
                    <button className="group">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                    </button>
                  ) : (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Quote className="w-12 h-12 text-white/70" />
                      </div>
                      <div className="text-white/80">Depoimento em Texto</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial
                      ? 'bg-white scale-125'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para ser o próximo case de sucesso?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 1.000 empresas que já transformaram seus resultados
          </p>
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-primary hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 text-lg"
          >
            Começar Meu Teste Grátis
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;


import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, MessageSquare, Shield, Zap } from 'lucide-react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set([0])); // Primeira pergunta aberta por padrão

  const faqCategories = [
    {
      title: "Geral",
      icon: HelpCircle,
      color: "blue",
      questions: [
        {
          question: "O que é o Gybachat e como funciona?",
          answer: "O Gybachat é uma plataforma completa de atendimento WhatsApp Business que permite gerenciar múltiplos números, automatizar respostas, distribuir conversas entre equipes e acompanhar métricas de vendas em tempo real. Funciona 100% na nuvem, sem necessidade de instalação."
        },
        {
          question: "Posso testar antes de assinar?",
          answer: "Sim! Oferecemos 14 dias de teste grátis com acesso completo a todas as funcionalidades. Não é necessário cartão de crédito para começar o teste."
        },
        {
          question: "Como funciona o período de teste?",
          answer: "Durante os 14 dias de teste, você tem acesso completo a todas as funcionalidades do plano escolhido. Pode conectar seus números WhatsApp, configurar automações e usar todos os recursos. Se não ficar satisfeito, pode cancelar sem custo algum."
        },
        {
          question: "Posso cancelar a qualquer momento?",
          answer: "Sim, você pode cancelar sua assinatura a qualquer momento através do painel administrativo. Não há multas ou taxas de cancelamento. Seus dados ficam disponíveis por 30 dias após o cancelamento."
        }
      ]
    },
    {
      title: "WhatsApp",
      icon: MessageSquare,
      color: "green",
      questions: [
        {
          question: "Quantos números WhatsApp posso conectar?",
          answer: "Depende do seu plano: Starter (1 número), Professional (3 números), Enterprise (10 números). Cada número funciona de forma independente com suas próprias configurações e equipe."
        },
        {
          question: "Preciso do WhatsApp Business API?",
          answer: "Para o plano Starter, usamos WhatsApp Business comum. Para Professional e Enterprise, recomendamos WhatsApp Business API para recursos avançados como automações e integrações. Ajudamos na configuração."
        },
        {
          question: "Meus números ficam seguros?",
          answer: "Sim! Usamos a Evolution API, uma das soluções mais seguras do mercado. Seus números ficam protegidos com criptografia de ponta a ponta e backup automático de todas as sessões."
        },
        {
          question: "E se meu WhatsApp desconectar?",
          answer: "Nosso sistema reconecta automaticamente em caso de queda. Temos backup de sessões a cada 5 minutos e sistema de keep-alive que mantém suas conexões sempre ativas."
        }
      ]
    },
    {
      title: "Recursos",
      icon: Zap,
      color: "purple",
      questions: [
        {
          question: "Como funcionam as automações?",
          answer: "Você pode criar fluxos automáticos para responder perguntas frequentes, qualificar leads, agendar reuniões e muito mais. O sistema aprende com suas conversas e melhora as respostas automaticamente."
        },
        {
          question: "Posso integrar com meu CRM?",
          answer: "Sim! Temos integrações nativas com os principais CRMs do mercado e uma API completa para integrações personalizadas. Também oferecemos webhooks para sincronização em tempo real."
        },
        {
          question: "Como funciona a distribuição de conversas?",
          answer: "O sistema distribui automaticamente as conversas entre sua equipe baseado em critérios como disponibilidade, especialidade, carga de trabalho e histórico de atendimento. Tudo configurável."
        },
        {
          question: "Que tipo de relatórios posso gerar?",
          answer: "Relatórios completos de vendas, atendimento, performance da equipe, conversões, tempo de resposta, satisfação do cliente e muito mais. Todos em tempo real com exportação para Excel/PDF."
        }
      ]
    },
    {
      title: "Segurança",
      icon: Shield,
      color: "red",
      questions: [
        {
          question: "Meus dados estão seguros?",
          answer: "Sim! Usamos criptografia de ponta a ponta, servidores seguros na AWS, backup automático e conformidade total com a LGPD. Seus dados nunca são compartilhados com terceiros."
        },
        {
          question: "Vocês são conformes com a LGPD?",
          answer: "Sim, somos 100% conformes com a LGPD. Temos políticas claras de privacidade, controle de acesso, auditoria de dados e direito ao esquecimento implementados."
        },
        {
          question: "Como funciona o backup das conversas?",
          answer: "Fazemos backup automático de todas as conversas a cada 5 minutos. Os dados são armazenados em múltiplos servidores com redundância geográfica. Você pode exportar suas conversas a qualquer momento."
        },
        {
          question: "Quem tem acesso aos meus dados?",
          answer: "Apenas você e sua equipe autorizada têm acesso aos dados. Nossa equipe técnica só acessa dados para suporte técnico e apenas com sua autorização expressa."
        }
      ]
    }
  ];

  const toggleItem = (categoryIndex, questionIndex) => {
    const itemId = `${categoryIndex}-${questionIndex}`;
    const newOpenItems = new Set(openItems);
    
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    
    setOpenItems(newOpenItems);
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-500 bg-blue-500/10',
      green: 'text-green-500 bg-green-500/10',
      purple: 'text-purple-500 bg-purple-500/10',
      red: 'text-red-500 bg-red-500/10'
    };
    return colors[color] || colors.blue;
  };

  return (
    <section id="faq" className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            Perguntas Frequentes
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Tire todas as suas
            <span className="text-gradient-gybachat block">dúvidas</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Respostas para as perguntas mais comuns sobre o Gybachat. 
            Não encontrou o que procura? Entre em contato conosco.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            const colorClasses = getColorClasses(category.color);
            
            return (
              <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg p-8">
                {/* Category Header */}
                <div className="flex items-center mb-8">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${colorClasses}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {category.questions.map((item, questionIndex) => {
                    const itemId = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openItems.has(itemId);
                    
                    return (
                      <div
                        key={questionIndex}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                      >
                        <button
                          onClick={() => toggleItem(categoryIndex, questionIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 pr-4">
                            {item.question}
                          </span>
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center transition-all duration-300 ${
                            isOpen ? 'bg-primary rotate-180' : 'bg-white'
                          }`}>
                            {isOpen ? (
                              <Minus className="w-4 h-4 text-white" />
                            ) : (
                              <Plus className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-gybachat rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Ainda tem dúvidas?
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Nossa equipe de especialistas está pronta para te ajudar. 
              Entre em contato e tire todas as suas dúvidas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105">
                Falar com Especialista
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold py-4 px-8 rounded-lg transition-all duration-300">
                Agendar Demonstração
              </button>
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Chat Online</h4>
            <p className="text-gray-600 text-sm mb-4">Atendimento instantâneo via chat</p>
            <button className="text-primary font-medium hover:underline">
              Iniciar Chat
            </button>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Central de Ajuda</h4>
            <p className="text-gray-600 text-sm mb-4">Tutoriais e documentação</p>
            <button className="text-primary font-medium hover:underline">
              Acessar Central
            </button>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Suporte Técnico</h4>
            <p className="text-gray-600 text-sm mb-4">Ajuda especializada 24/7</p>
            <button className="text-primary font-medium hover:underline">
              Abrir Ticket
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;


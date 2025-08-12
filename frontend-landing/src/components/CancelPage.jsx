import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  XCircle, 
  MessageSquare, 
  ArrowLeft, 
  HelpCircle,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  Heart,
  Star
} from 'lucide-react';

const CancelPage = () => {
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showOffers, setShowOffers] = useState(false);

  const cancelReasons = [
    {
      id: 'too_expensive',
      label: 'Muito caro para meu orçamento',
      offer: 'desconto'
    },
    {
      id: 'too_complex',
      label: 'Muito complexo de usar',
      offer: 'onboarding'
    },
    {
      id: 'missing_features',
      label: 'Falta funcionalidades que preciso',
      offer: 'roadmap'
    },
    {
      id: 'found_alternative',
      label: 'Encontrei uma alternativa melhor',
      offer: 'comparison'
    },
    {
      id: 'not_ready',
      label: 'Não estou pronto para usar ainda',
      offer: 'trial_extension'
    },
    {
      id: 'technical_issues',
      label: 'Problemas técnicos',
      offer: 'support'
    },
    {
      id: 'business_change',
      label: 'Mudança no negócio',
      offer: 'pause'
    },
    {
      id: 'other',
      label: 'Outro motivo',
      offer: 'feedback'
    }
  ];

  const offers = {
    desconto: {
      title: "🎁 Oferta Especial para Você!",
      description: "Que tal 50% de desconto nos próximos 3 meses?",
      action: "Aceitar Desconto",
      color: "green"
    },
    onboarding: {
      title: "🤝 Vamos te Ajudar!",
      description: "Sessão gratuita de configuração com nosso especialista",
      action: "Agendar Ajuda",
      color: "blue"
    },
    roadmap: {
      title: "🚀 Suas Ideias Importam!",
      description: "Conte o que precisa - podemos desenvolver para você",
      action: "Enviar Sugestão",
      color: "purple"
    },
    comparison: {
      title: "📊 Vamos Comparar?",
      description: "Mostramos porque somos a melhor opção do mercado",
      action: "Ver Comparação",
      color: "orange"
    },
    trial_extension: {
      title: "⏰ Mais Tempo para Decidir",
      description: "Estenda seu teste por mais 14 dias gratuitamente",
      action: "Estender Teste",
      color: "indigo"
    },
    support: {
      title: "🛠️ Suporte Prioritário",
      description: "Nossa equipe técnica vai resolver tudo para você",
      action: "Falar com Suporte",
      color: "red"
    },
    pause: {
      title: "⏸️ Pausa Temporária",
      description: "Pause sua conta e volte quando estiver pronto",
      action: "Pausar Conta",
      color: "gray"
    },
    feedback: {
      title: "💬 Sua Opinião é Valiosa",
      description: "Conte como podemos melhorar para você",
      action: "Enviar Feedback",
      color: "pink"
    }
  };

  useEffect(() => {
    if (selectedReason) {
      setShowOffers(true);
    }
  }, [selectedReason]);

  const handleReasonSelect = (reasonId) => {
    setSelectedReason(reasonId);
  };

  const handleAcceptOffer = () => {
    // Implementar ação baseada na oferta
    console.log('Oferta aceita:', selectedReason);
    // Redirecionar para ação específica
  };

  const handleFinalCancel = () => {
    // Processar cancelamento final
    console.log('Cancelamento confirmado:', { selectedReason, feedback });
    // Redirecionar para confirmação
  };

  const currentOffer = selectedReason ? offers[cancelReasons.find(r => r.id === selectedReason)?.offer] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-gybachat rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Gybachat</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showOffers ? (
          /* Seleção de Motivo */
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Que pena que você está saindo! 😢
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Antes de cancelar, nos ajude a entender o motivo. 
              Talvez possamos resolver juntos!
            </p>

            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Qual o principal motivo do cancelamento?
              </h3>

              <div className="space-y-3">
                {cancelReasons.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedReason === reason.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={() => handleReasonSelect(reason.id)}
                      className="mr-3"
                    />
                    <span className="font-medium text-gray-900">{reason.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quer nos contar mais alguma coisa? (opcional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Sua opinião é muito importante para nós..."
                />
              </div>
            </div>
          </div>
        ) : (
          /* Oferta de Retenção */
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-yellow-600" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Espera! Temos algo especial para você! ✨
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Entendemos sua preocupação e queremos resolver isso juntos.
            </p>

            {currentOffer && (
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentOffer.title}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {currentOffer.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleAcceptOffer}
                    className={`btn-gybachat bg-${currentOffer.color}-600 hover:bg-${currentOffer.color}-700`}
                  >
                    {currentOffer.action}
                  </button>
                  <button
                    onClick={() => setShowOffers(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Ver Outras Opções
                  </button>
                </div>
              </div>
            )}

            {/* Estatísticas de Satisfação */}
            <div className="bg-gradient-gybachat rounded-2xl p-8 text-white mb-8">
              <h3 className="text-2xl font-bold mb-6">
                Veja o que nossos clientes dizem
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">98.5%</div>
                  <div className="text-white/90">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">1.247</div>
                  <div className="text-white/90">Empresas ativas</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-300 fill-current" />
                    ))}
                  </div>
                  <div className="text-white/90">Avaliação média</div>
                </div>
              </div>
            </div>

            {/* Opções de Contato */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Falar Agora</h3>
                <p className="text-gray-600 text-sm mb-4">Ligue e resolva na hora</p>
                <button className="text-primary font-medium hover:underline">
                  (11) 9 9999-9999
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Chat Online</h3>
                <p className="text-gray-600 text-sm mb-4">Suporte instantâneo</p>
                <button className="text-primary font-medium hover:underline">
                  Iniciar Chat
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Agendar Reunião</h3>
                <p className="text-gray-600 text-sm mb-4">Conversa personalizada</p>
                <button className="text-primary font-medium hover:underline">
                  Agendar Agora
                </button>
              </div>
            </div>

            {/* Cancelamento Final */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Ainda quer cancelar mesmo assim?
              </p>
              <button
                onClick={handleFinalCancel}
                className="text-red-600 hover:text-red-700 font-medium underline"
              >
                Sim, quero cancelar definitivamente
              </button>
            </div>
          </div>
        )}

        {/* Footer de Ajuda */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <div className="flex items-center justify-center mb-2">
            <HelpCircle className="w-4 h-4 mr-2" />
            <span>Precisa de ajuda?</span>
          </div>
          <p>
            Entre em contato: {' '}
            <a href="mailto:suporte@gybachat.com.br" className="text-primary hover:underline">
              suporte@gybachat.com.br
            </a>
            {' '} | {' '}
            <a href="tel:+5511999999999" className="text-primary hover:underline">
              (11) 9 9999-9999
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;


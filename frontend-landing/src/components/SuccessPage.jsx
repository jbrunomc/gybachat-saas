import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  MessageSquare, 
  Mail, 
  ArrowRight, 
  Download,
  Play,
  Calendar,
  Smartphone,
  Users,
  Zap,
  Clock,
  Star
} from 'lucide-react';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const orderId = searchParams.get('order');
    if (orderId) {
      fetchOrderData(orderId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    // Countdown para redirecionamento automático
    if (countdown > 0 && orderData) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && orderData) {
      // Redirecionar para o painel
      window.location.href = `https://${orderData.company.slug}.gybachat.com.br`;
    }
  }, [countdown, orderData]);

  const fetchOrderData = async (orderId) => {
    try {
      const response = await fetch(`/api/billing/order/${orderId}`);
      const result = await response.json();
      
      if (result.success) {
        setOrderData(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSteps = [
    {
      icon: Mail,
      title: "Verifique seu email",
      description: "Enviamos as credenciais de acesso e um guia de primeiros passos",
      action: "Abrir email",
      color: "blue"
    },
    {
      icon: MessageSquare,
      title: "Conecte seu WhatsApp",
      description: "Configure seus números WhatsApp em poucos cliques",
      action: "Conectar agora",
      color: "green"
    },
    {
      icon: Users,
      title: "Convide sua equipe",
      description: "Adicione membros da equipe e configure permissões",
      action: "Gerenciar equipe",
      color: "purple"
    },
    {
      icon: Zap,
      title: "Configure automações",
      description: "Crie respostas automáticas e fluxos de atendimento",
      action: "Criar automação",
      color: "yellow"
    }
  ];

  const resources = [
    {
      icon: Play,
      title: "Vídeo Tutorial",
      description: "Aprenda a usar o Gybachat em 10 minutos",
      link: "/tutorial"
    },
    {
      icon: Download,
      title: "Guia de Configuração",
      description: "PDF completo com passo a passo",
      link: "/guia.pdf"
    },
    {
      icon: Calendar,
      title: "Agendar Onboarding",
      description: "Sessão gratuita com especialista",
      link: "/agendar"
    },
    {
      icon: Smartphone,
      title: "App Mobile",
      description: "Baixe o app para iOS e Android",
      link: "/app"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-gybachat rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Gybachat</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Suporte 24/7 disponível</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Parabéns! Sua conta foi criada com sucesso!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Bem-vindo ao Gybachat! Sua plataforma de atendimento WhatsApp está pronta. 
            Vamos começar a transformar suas vendas?
          </p>

          {orderData && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Detalhes da Conta</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Empresa:</span>
                  <span className="font-medium">{orderData.company.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plano:</span>
                  <span className="font-medium">{orderData.plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">URL:</span>
                  <span className="font-medium text-primary">
                    {orderData.company.slug}.gybachat.com.br
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teste grátis até:</span>
                  <span className="font-medium text-green-600">
                    {new Date(orderData.trial_end).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Auto Redirect */}
          {orderData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-md mx-auto">
              <div className="flex items-center justify-center text-blue-700 mb-2">
                <ArrowRight className="w-5 h-5 mr-2" />
                <span className="font-medium">Redirecionamento automático</span>
              </div>
              <p className="text-sm text-blue-600">
                Você será redirecionado para seu painel em {countdown} segundos
              </p>
              <button
                onClick={() => window.location.href = `https://${orderData.company.slug}.gybachat.com.br`}
                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Acessar Painel Agora
              </button>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Próximos Passos
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;
              const colorClasses = {
                blue: 'bg-blue-500 text-blue-500 bg-blue-500/10',
                green: 'bg-green-500 text-green-500 bg-green-500/10',
                purple: 'bg-purple-500 text-purple-500 bg-purple-500/10',
                yellow: 'bg-yellow-500 text-yellow-500 bg-yellow-500/10'
              };
              
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[step.color].split(' ')[2]}`}>
                      <Icon className={`w-6 h-6 ${colorClasses[step.color].split(' ')[1]}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                      <button className="text-primary font-medium text-sm hover:underline">
                        {step.action} →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Recursos para Começar
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                  <a
                    href={resource.link}
                    className="text-primary font-medium text-sm hover:underline"
                  >
                    Acessar →
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support */}
        <div className="bg-gradient-gybachat rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Precisa de Ajuda?
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Nossa equipe de especialistas está pronta para te ajudar a configurar 
            e otimizar sua plataforma. Suporte incluído no seu plano!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg transition-colors">
              Chat com Suporte
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold py-3 px-6 rounded-lg transition-colors">
              Agendar Onboarding
            </button>
          </div>
          
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-white/80">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-300" />
              Suporte 5 estrelas
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Resposta em 2 minutos
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            Tem dúvidas? Acesse nossa{' '}
            <a href="/ajuda" className="text-primary hover:underline">Central de Ajuda</a>
            {' '}ou entre em contato pelo{' '}
            <a href="mailto:suporte@gybachat.com.br" className="text-primary hover:underline">
              suporte@gybachat.com.br
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;


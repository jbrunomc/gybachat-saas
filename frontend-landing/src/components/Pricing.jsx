import React, { useState, useEffect } from 'react';
import { Check, Star, ArrowRight, Zap, Crown, Rocket } from 'lucide-react';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  // Planos padrão (fallback se API não responder)
  const defaultPlans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Ideal para pequenas empresas começando',
      price_monthly: 49.90,
      price_yearly: 499.00,
      trial_days: 14,
      popular: false,
      icon: Zap,
      color: 'blue',
      features: [
        'WhatsApp Business',
        'Até 5 usuários',
        '1 número WhatsApp',
        'Relatórios básicos',
        'Suporte por email',
        'Backup automático',
        'Integrações básicas'
      ],
      limits: {
        users: 5,
        whatsapp_numbers: 1,
        storage_gb: 1
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Para empresas em crescimento',
      price_monthly: 99.90,
      price_yearly: 999.00,
      trial_days: 14,
      popular: true,
      icon: Crown,
      color: 'purple',
      features: [
        'WhatsApp Business API',
        'Até 15 usuários',
        '3 números WhatsApp',
        'Relatórios avançados',
        'Automações completas',
        'Integrações premium',
        'Suporte prioritário',
        'Chatbot avançado',
        'API personalizada'
      ],
      limits: {
        users: 15,
        whatsapp_numbers: 3,
        storage_gb: 5
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Para grandes empresas',
      price_monthly: 199.90,
      price_yearly: 1999.00,
      trial_days: 14,
      popular: false,
      icon: Rocket,
      color: 'green',
      features: [
        'WhatsApp Business API',
        'Usuários ilimitados',
        '10 números WhatsApp',
        'Analytics completo',
        'Automações avançadas',
        'API personalizada',
        'Suporte 24/7',
        'Manager dedicado',
        'White label disponível',
        'SLA garantido'
      ],
      limits: {
        users: -1, // ilimitado
        whatsapp_numbers: 10,
        storage_gb: 25
      }
    }
  ];

  useEffect(() => {
    // Buscar planos da API
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/billing/public/plans');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setPlans(data.data);
        } else {
          setPlans(defaultPlans);
        }
      } else {
        setPlans(defaultPlans);
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      setPlans(defaultPlans);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan) => {
    return billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;
  };

  const getMonthlyPrice = (plan) => {
    if (billingPeriod === 'yearly') {
      return (plan.price_yearly / 12).toFixed(2);
    }
    return plan.price_monthly;
  };

  const getSavings = (plan) => {
    if (billingPeriod === 'yearly') {
      const monthlyTotal = plan.price_monthly * 12;
      const savings = monthlyTotal - plan.price_yearly;
      const percentage = Math.round((savings / monthlyTotal) * 100);
      return { amount: savings, percentage };
    }
    return null;
  };

  const handleSelectPlan = (plan) => {
    // Redirecionar para checkout
    const checkoutUrl = `/checkout?plan=${plan.id}&billing=${billingPeriod}`;
    window.location.href = checkoutUrl;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-500',
        border: 'border-blue-500',
        gradient: 'from-blue-500 to-blue-600'
      },
      purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-500',
        border: 'border-purple-500',
        gradient: 'from-purple-500 to-purple-600'
      },
      green: {
        bg: 'bg-green-500',
        text: 'text-green-500',
        border: 'border-green-500',
        gradient: 'from-green-500 to-green-600'
      }
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <section id="pricing" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando planos...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Star className="w-4 h-4 mr-2" />
            Planos e Preços
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Escolha o plano ideal para
            <span className="text-gradient-gybachat block">seu negócio</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Todos os planos incluem 14 dias de teste grátis. Sem cartão de crédito. 
            Cancele quando quiser.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon || Zap;
            const colors = getColorClasses(plan.color || 'blue');
            const savings = getSavings(plan);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  plan.popular 
                    ? 'ring-2 ring-primary scale-105 lg:scale-110' 
                    : 'hover:scale-105'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-gybachat text-white px-6 py-2 rounded-full text-sm font-medium">
                      Mais Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        R$ {getMonthlyPrice(plan)}
                      </span>
                      <span className="text-gray-600 ml-2">/mês</span>
                    </div>
                    
                    {billingPeriod === 'yearly' && (
                      <div className="mt-2">
                        <span className="text-gray-500 line-through">
                          R$ {plan.price_monthly}/mês
                        </span>
                        {savings && (
                          <span className="text-green-600 font-medium ml-2">
                            Economize {savings.percentage}%
                          </span>
                        )}
                      </div>
                    )}

                    {billingPeriod === 'yearly' && (
                      <div className="text-sm text-gray-600 mt-1">
                        Cobrado anualmente: R$ {plan.price_yearly}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limits Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-8">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>👥 {plan.limits.users === -1 ? 'Usuários ilimitados' : `Até ${plan.limits.users} usuários`}</div>
                      <div>📱 {plan.limits.whatsapp_numbers} número{plan.limits.whatsapp_numbers > 1 ? 's' : ''} WhatsApp</div>
                      <div>💾 {plan.limits.storage_gb}GB de armazenamento</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 group ${
                      plan.popular
                        ? 'bg-gradient-gybachat text-white hover:shadow-lg hover:scale-105'
                        : `border-2 ${colors.border} ${colors.text} hover:bg-gradient-to-r hover:${colors.gradient} hover:text-white`
                    }`}
                  >
                    Começar Teste Grátis
                    <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Trial Info */}
                  <p className="text-center text-sm text-gray-500 mt-4">
                    {plan.trial_days} dias grátis • Sem cartão de crédito
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-16">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Precisa de algo personalizado?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Para empresas com necessidades específicas, oferecemos planos customizados 
              com recursos exclusivos e suporte dedicado.
            </p>
            <button className="btn-gybachat-outline">
              Falar com Especialista
            </button>
          </div>
        </div>

        {/* FAQ Quick */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Teste Grátis</h4>
            <p className="text-gray-600 text-sm">14 dias completos para testar todas as funcionalidades</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Setup Instantâneo</h4>
            <p className="text-gray-600 text-sm">Sua conta fica pronta em menos de 2 minutos</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Suporte Premium</h4>
            <p className="text-gray-600 text-sm">Equipe especializada para te ajudar sempre</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;


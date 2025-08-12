import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Shield, 
  Check, 
  ArrowLeft, 
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  User,
  Mail,
  Phone,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { landingService, validators, formatters } from '../utils/api';

const CheckoutPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Dados, 2: Pagamento, 3: Processando
  
  const [formData, setFormData] = useState({
    // Dados da empresa
    companyName: '',
    subdomain: '',
    
    // Dados do administrador
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    adminPasswordConfirm: '',
    
    // Dados de pagamento
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    
    // Termos
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [errors, setErrors] = useState({});
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (planId && plans.length > 0) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
      } else {
        toast.error('Plano não encontrado');
        navigate('/');
      }
    }
  }, [planId, plans, navigate]);

  const loadPlans = async () => {
    try {
      const config = await landingService.getConfig();
      setPlans(config.plans || []);
      
      if (!planId && config.plans.length > 0) {
        // Se não especificou plano, usar o mais popular
        const popularPlan = config.plans.find(p => p.popular) || config.plans[0];
        setSelectedPlan(popularPlan);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast.error('Erro ao carregar informações dos planos');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Validações em tempo real
    if (field === 'subdomain' && value.length >= 3) {
      checkSubdomainAvailability(value);
    }
  };

  const checkSubdomainAvailability = async (subdomain) => {
    if (!validators.subdomain(subdomain)) {
      setSubdomainAvailable(false);
      return;
    }

    setSubdomainChecking(true);
    try {
      const result = await landingService.checkSubdomain(subdomain);
      setSubdomainAvailable(result.available);
    } catch (error) {
      setSubdomainAvailable(false);
    } finally {
      setSubdomainChecking(false);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    // Validar dados da empresa
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Nome da empresa é obrigatório';
    } else if (!validators.companyName(formData.companyName)) {
      newErrors.companyName = 'Nome deve ter entre 2 e 100 caracteres';
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomínio é obrigatório';
    } else if (!validators.subdomain(formData.subdomain)) {
      newErrors.subdomain = 'Subdomínio deve ter 3-20 caracteres, apenas letras, números e hífen';
    } else if (subdomainAvailable === false) {
      newErrors.subdomain = 'Subdomínio não disponível';
    }

    // Validar dados do administrador
    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Nome do administrador é obrigatório';
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Email é obrigatório';
    } else if (!validators.email(formData.adminEmail)) {
      newErrors.adminEmail = 'Email inválido';
    }

    if (!formData.adminPhone.trim()) {
      newErrors.adminPhone = 'Telefone é obrigatório';
    } else if (!validators.phone(formData.adminPhone)) {
      newErrors.adminPhone = 'Telefone inválido';
    }

    if (!formData.adminPassword) {
      newErrors.adminPassword = 'Senha é obrigatória';
    } else if (!validators.password(formData.adminPassword)) {
      newErrors.adminPassword = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (formData.adminPassword !== formData.adminPasswordConfirm) {
      newErrors.adminPasswordConfirm = 'Senhas não coincidem';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os termos de uso';
    }

    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = 'Você deve aceitar a política de privacidade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (formData.paymentMethod === 'credit_card') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Número do cartão é obrigatório';
      }

      if (!formData.cardName.trim()) {
        newErrors.cardName = 'Nome no cartão é obrigatório';
      }

      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = 'Validade é obrigatória';
      }

      if (!formData.cardCvv.trim()) {
        newErrors.cardCvv = 'CVV é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setStep(3);
    setLoading(true);

    try {
      const registrationData = {
        companyName: formData.companyName,
        subdomain: formData.subdomain,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        adminPassword: formData.adminPassword,
        planId: selectedPlan.id,
        paymentData: formData.paymentMethod === 'credit_card' ? {
          method: 'credit_card',
          cardNumber: formData.cardNumber,
          cardName: formData.cardName,
          cardExpiry: formData.cardExpiry,
          cardCvv: formData.cardCvv
        } : null
      };

      const response = await landingService.register(registrationData);
      
      // Redirecionar para página de sucesso
      navigate('/success', { 
        state: { 
          company: response.company,
          user: response.user,
          plan: selectedPlan
        }
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      setStep(2); // Voltar para o pagamento
      toast.error(error.message || 'Erro ao processar cadastro');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {step > 1 ? 'Voltar' : 'Início'}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">Passo {step} de 3</div>
              <div className="flex space-x-1">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full ${
                      s <= step ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumo do Plano */}
          <div className="lg:col-span-1">
            <div className="card-gybachat sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo do Pedido
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Plano</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatters.currency(selectedPlan.price)}/mês
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    14 dias grátis, depois {formatters.currency(selectedPlan.price)}/mês
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center text-green-800">
                    <Shield className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Garantia de 30 dias</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Cancele a qualquer momento sem custos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="card-gybachat">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Dados da Empresa e Administrador
                </h2>

                <div className="space-y-6">
                  {/* Dados da Empresa */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-primary" />
                      Dados da Empresa
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome da Empresa *
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className={`input-gybachat ${errors.companyName ? 'border-red-500' : ''}`}
                          placeholder="Sua Empresa Ltda"
                        />
                        {errors.companyName && (
                          <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subdomínio *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.subdomain}
                            onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase())}
                            className={`input-gybachat pr-12 ${errors.subdomain ? 'border-red-500' : ''}`}
                            placeholder="minhaempresa"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {subdomainChecking ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : subdomainAvailable === true ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : subdomainAvailable === false ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : null}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Seu painel ficará em: {formData.subdomain || 'subdominio'}.gybachat.com.br
                        </p>
                        {errors.subdomain && (
                          <p className="text-red-500 text-sm mt-1">{errors.subdomain}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dados do Administrador */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      Dados do Administrador
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          value={formData.adminName}
                          onChange={(e) => handleInputChange('adminName', e.target.value)}
                          className={`input-gybachat ${errors.adminName ? 'border-red-500' : ''}`}
                          placeholder="João Silva"
                        />
                        {errors.adminName && (
                          <p className="text-red-500 text-sm mt-1">{errors.adminName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.adminEmail}
                          onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                          className={`input-gybachat ${errors.adminEmail ? 'border-red-500' : ''}`}
                          placeholder="joao@empresa.com"
                        />
                        {errors.adminEmail && (
                          <p className="text-red-500 text-sm mt-1">{errors.adminEmail}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone *
                        </label>
                        <input
                          type="tel"
                          value={formData.adminPhone}
                          onChange={(e) => handleInputChange('adminPhone', formatters.phone(e.target.value))}
                          className={`input-gybachat ${errors.adminPhone ? 'border-red-500' : ''}`}
                          placeholder="(11) 99999-9999"
                        />
                        {errors.adminPhone && (
                          <p className="text-red-500 text-sm mt-1">{errors.adminPhone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Senha *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.adminPassword}
                            onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                            className={`input-gybachat pr-12 ${errors.adminPassword ? 'border-red-500' : ''}`}
                            placeholder="Mínimo 8 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.adminPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.adminPassword}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Senha *
                        </label>
                        <input
                          type="password"
                          value={formData.adminPasswordConfirm}
                          onChange={(e) => handleInputChange('adminPasswordConfirm', e.target.value)}
                          className={`input-gybachat ${errors.adminPasswordConfirm ? 'border-red-500' : ''}`}
                          placeholder="Digite a senha novamente"
                        />
                        {errors.adminPasswordConfirm && (
                          <p className="text-red-500 text-sm mt-1">{errors.adminPasswordConfirm}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Termos */}
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                        className="mt-1 mr-3"
                      />
                      <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                        Aceito os{' '}
                        <a href="/termos" target="_blank" className="text-primary hover:underline">
                          Termos de Uso
                        </a>
                        {' '}do Gybachat *
                      </label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-red-500 text-sm">{errors.acceptTerms}</p>
                    )}

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="acceptPrivacy"
                        checked={formData.acceptPrivacy}
                        onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
                        className="mt-1 mr-3"
                      />
                      <label htmlFor="acceptPrivacy" className="text-sm text-gray-600">
                        Aceito a{' '}
                        <a href="/privacidade" target="_blank" className="text-primary hover:underline">
                          Política de Privacidade
                        </a>
                        {' '}do Gybachat *
                      </label>
                    </div>
                    {errors.acceptPrivacy && (
                      <p className="text-red-500 text-sm">{errors.acceptPrivacy}</p>
                    )}
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full btn-gybachat"
                  >
                    Continuar para Pagamento
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="card-gybachat">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informações de Pagamento
                </h2>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center text-blue-800">
                      <Shield className="w-5 h-5 mr-2" />
                      <span className="font-medium">Teste Grátis por 14 Dias</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Você não será cobrado agora. Após o período de teste, será cobrado {formatters.currency(selectedPlan.price)}/mês.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Método de Pagamento
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit_card"
                          checked={formData.paymentMethod === 'credit_card'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="mr-3"
                        />
                        <CreditCard className="w-5 h-5 mr-3 text-gray-400" />
                        <span className="font-medium">Cartão de Crédito</span>
                      </label>
                    </div>
                  </div>

                  {formData.paymentMethod === 'credit_card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número do Cartão *
                        </label>
                        <input
                          type="text"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          className={`input-gybachat ${errors.cardNumber ? 'border-red-500' : ''}`}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                        {errors.cardNumber && (
                          <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome no Cartão *
                        </label>
                        <input
                          type="text"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange('cardName', e.target.value)}
                          className={`input-gybachat ${errors.cardName ? 'border-red-500' : ''}`}
                          placeholder="João Silva"
                        />
                        {errors.cardName && (
                          <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Validade *
                          </label>
                          <input
                            type="text"
                            value={formData.cardExpiry}
                            onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                            className={`input-gybachat ${errors.cardExpiry ? 'border-red-500' : ''}`}
                            placeholder="MM/AA"
                            maxLength={5}
                          />
                          {errors.cardExpiry && (
                            <p className="text-red-500 text-sm mt-1">{errors.cardExpiry}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={formData.cardCvv}
                            onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                            className={`input-gybachat ${errors.cardCvv ? 'border-red-500' : ''}`}
                            placeholder="123"
                            maxLength={4}
                          />
                          {errors.cardCvv && (
                            <p className="text-red-500 text-sm mt-1">{errors.cardCvv}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 btn-gybachat-outline"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 btn-gybachat"
                    >
                      Finalizar Cadastro
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="card-gybachat text-center">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Processando seu cadastro...
                    </h2>
                    <p className="text-gray-600">
                      Estamos criando sua conta e configurando seu ambiente. 
                      Isso pode levar alguns segundos.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Validando informações
                      </div>
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-primary mr-2 animate-spin" />
                        Criando empresa
                      </div>
                      <div className="flex items-center justify-center text-gray-400">
                        <div className="w-4 h-4 mr-2" />
                        Configurando ambiente
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;


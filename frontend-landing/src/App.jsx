import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import './styles/colors.css';

// Imports diretos (sem lazy loading)
import Header from './components/Header';
import Hero from './components/Hero';
import VideoSection from './components/VideoSection';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import CheckoutPage from './components/CheckoutPage';
import SuccessPage from './components/SuccessPage';
import CancelPage from './components/CancelPage';

// Página inicial (Landing Page)
const HomePage = () => (
  <div className="min-h-screen">
    <Header />
    <main>
      <Hero />
      <VideoSection />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
    </main>
    <Footer />
  </div>
);

// Componente para páginas não encontradas
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
    <div className="text-center">
      <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl font-bold text-primary">404</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Página não encontrada
      </h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        A página que você está procurando não existe ou foi movida.
      </p>
      <a
        href="/"
        className="btn-gybachat inline-flex items-center"
      >
        Voltar ao Início
      </a>
    </div>
  </div>
);

// Componente principal da aplicação
function App() {
  return (
    <Router>
      <div className="App">
        {/* Configuração do Toaster para notificações */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1f2937',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />

        {/* Definição das rotas */}
        <Routes>
          {/* Página inicial */}
          <Route path="/" element={<HomePage />} />

          {/* Checkout com plano específico */}
          <Route path="/checkout/:planId" element={<CheckoutPage />} />

          {/* Checkout sem plano */}
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Página de sucesso */}
          <Route path="/success" element={<SuccessPage />} />

          {/* Página de cancelamento */}
          <Route path="/cancel" element={<CancelPage />} />

          {/* Redirecionamentos para compatibilidade */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/pricing" element={<Navigate to="/#pricing" replace />} />
          <Route path="/features" element={<Navigate to="/#features" replace />} />
          <Route path="/faq" element={<Navigate to="/#faq" replace />} />

          {/* Páginas estáticas (podem ser implementadas depois) */}
          <Route 
            path="/termos" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Termos de Uso</h1>
                  <p className="text-gray-600">Em construção...</p>
                  <a href="/" className="btn-gybachat mt-4 inline-block">
                    Voltar
                  </a>
                </div>
              </div>
            } 
          />

          <Route 
            path="/privacidade" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Política de Privacidade</h1>
                  <p className="text-gray-600">Em construção...</p>
                  <a href="/" className="btn-gybachat mt-4 inline-block">
                    Voltar
                  </a>
                </div>
              </div>
            } 
          />

          <Route 
            path="/contato" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Contato</h1>
                  <p className="text-gray-600">Em construção...</p>
                  <a href="/" className="btn-gybachat mt-4 inline-block">
                    Voltar
                  </a>
                </div>
              </div>
            } 
          />

          {/* Página 404 para rotas não encontradas */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


import React, { useState } from 'react';
import { Play, X } from 'lucide-react';

const VideoSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const openVideo = () => {
    setIsVideoOpen(true);
  };

  const closeVideo = () => {
    setIsVideoOpen(false);
  };

  return (
    <>
      {/* Video Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Veja o GybaChat em Ação
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra como transformar seu WhatsApp em uma máquina de vendas em apenas 2 minutos
            </p>
          </div>

          {/* Video Thumbnail */}
          <div className="relative max-w-4xl mx-auto">
            <div 
              className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
              onClick={openVideo}
            >
              <img 
                src="/images/video-thumbnail.png" 
                alt="Vídeo demonstração do GybaChat - Veja como funciona"
                className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Fallback para caso a imagem não carregue
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              
              {/* Fallback Video Thumbnail */}
              <div 
                className="w-full h-96 bg-gradient-to-br from-primary to-secondary flex items-center justify-center rounded-2xl"
                style={{ display: 'none' }}
              >
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Veja o GybaChat em Ação</h3>
                  <p className="text-white/90">Clique para assistir a demonstração</p>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors shadow-lg">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Video Stats */}
            <div className="flex justify-center mt-8 space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2 min</div>
                <div className="text-gray-600">Duração</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">+1000</div>
                <div className="text-gray-600">Visualizações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-gray-600">Aprovação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-4">
            {/* Close Button */}
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Video Container */}
            <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
              <div className="aspect-video">
                {/* TODO: Substituir por iframe do YouTube quando o vídeo estiver pronto */}
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 text-white/50" />
                    <h3 className="text-xl font-semibold mb-2">Vídeo em Produção</h3>
                    <p className="text-white/70">
                      O vídeo demonstração estará disponível em breve.
                      <br />
                      Substitua este placeholder pelo iframe do YouTube.
                    </p>
                  </div>
                </div>
                
                {/* Exemplo de como será o iframe do YouTube:
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1"
                  title="GybaChat - Demonstração"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoSection;


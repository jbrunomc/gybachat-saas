export class MonitoringService {
  constructor() {
    this.metrics = new Map();
  }

  // Inicializar monitoramento
  async initialize() {
    console.log('✅ MonitoringService inicializado');
  }

  // Registrar métrica
  recordMetric(name, value) {
    this.metrics.set(name, {
      value,
      timestamp: new Date().toISOString()
    });
  }

  // Obter métricas
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}


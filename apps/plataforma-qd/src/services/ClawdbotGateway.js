/**
 * ClawdbotGateway - Cliente WebSocket para Moltbot/Clawdbot
 *
 * Conexión ligera entre Howard OS y un Gateway de Moltbot en ejecución.
 * Permite enviar tareas, recibir resultados y gestionar sesiones.
 */

import { v4 as uuidv4 } from 'uuid';

export class ClawdbotGateway {
  constructor(config = {}) {
    this.host = config.host || 'ws://127.0.0.1:18789';
    this.reconnectInterval = config.reconnectInterval || 5000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10;

    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.sessionId = null;
    this.pendingTasks = new Map();
    this.messageHandlers = new Map();
    this.eventListeners = new Map();

    // Estadísticas
    this.stats = {
      tasksCompleted: 0,
      tasksFailed: 0,
      averageResponseTime: 0,
      lastActivity: null
    };
  }

  /**
   * Conectar al Gateway de Moltbot
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.host);

        this.ws.onopen = () => {
          console.log('🦞 [Moltbot] Connected to Gateway');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.sessionId = uuidv4();

          this.emit('connected', { sessionId: this.sessionId });
          this.sendHandshake();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('🦞 [Moltbot] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('🦞 [Moltbot] WebSocket error:', error);
          this.emit('error', error);
        };

        this.ws.onclose = () => {
          console.log('🦞 [Moltbot] Connection closed');
          this.isConnected = false;
          this.emit('disconnected');
          this.attemptReconnect();
        };

        // Timeout de conexión
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Enviar handshake inicial
   */
  sendHandshake() {
    this.send({
      type: 'handshake',
      sessionId: this.sessionId,
      client: 'howard-os',
      version: '1.0.0',
      capabilities: ['code-execution', 'git-operations', 'file-management']
    });
  }

  /**
   * Intentar reconexión automática
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🦞 [Moltbot] Max reconnection attempts reached');
      this.emit('reconnect-failed');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🦞 [Moltbot] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('🦞 [Moltbot] Reconnection failed:', error);
      });
    }, this.reconnectInterval);
  }

  /**
   * Enviar tarea a Moltbot
   * @param {Object} task - Configuración de la tarea
   * @returns {Promise} - Resultado de la tarea
   */
  async sendTask(task) {
    if (!this.isConnected) {
      throw new Error('Not connected to Moltbot Gateway');
    }

    const taskId = uuidv4();
    const startTime = Date.now();

    const taskPayload = {
      type: 'task',
      taskId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      payload: {
        instruction: task.instruction,
        context: task.context || {},
        priority: task.priority || 'normal',
        requiresApproval: this.assessRequiresApproval(task.instruction),
        riskLevel: this.assessRisk(task.instruction),
        timeout: task.timeout || 300000, // 5 minutos default
      }
    };

    return new Promise((resolve, reject) => {
      // Registrar handler para esta tarea
      this.pendingTasks.set(taskId, {
        resolve,
        reject,
        startTime,
        task: taskPayload
      });

      // Timeout
      setTimeout(() => {
        if (this.pendingTasks.has(taskId)) {
          this.pendingTasks.delete(taskId);
          reject(new Error('Task timeout'));
        }
      }, taskPayload.payload.timeout);

      // Enviar tarea
      this.send(taskPayload);
      this.emit('task-sent', { taskId, instruction: task.instruction });
    });
  }

  /**
   * Evaluar nivel de riesgo de una instrucción
   * Implementación simplificada de MUEDP
   */
  assessRisk(instruction) {
    const lowerInstruction = instruction.toLowerCase();

    // Palabras clave críticas
    const criticalKeywords = [
      'delete', 'remove', 'rm -rf', 'drop', 'truncate',
      'format', 'destroy', 'kill', 'sudo', 'chmod 777'
    ];

    const highRiskKeywords = [
      'git push', 'npm publish', 'deploy', 'production',
      'database', 'credentials', 'password', 'token', 'api key'
    ];

    const mediumRiskKeywords = [
      'install', 'update', 'modify', 'change', 'write',
      'commit', 'merge', 'rebase'
    ];

    // Calcular score
    let riskScore = 0.1; // Base risk

    criticalKeywords.forEach(keyword => {
      if (lowerInstruction.includes(keyword)) riskScore += 0.6;
    });

    highRiskKeywords.forEach(keyword => {
      if (lowerInstruction.includes(keyword)) riskScore += 0.3;
    });

    mediumRiskKeywords.forEach(keyword => {
      if (lowerInstruction.includes(keyword)) riskScore += 0.1;
    });

    riskScore = Math.min(riskScore, 1.0);

    // Clasificar
    if (riskScore >= 0.7) return 'critical';
    if (riskScore >= 0.4) return 'high';
    if (riskScore >= 0.2) return 'medium';
    return 'low';
  }

  /**
   * Determinar si requiere aprobación humana
   */
  assessRequiresApproval(instruction) {
    const approvalPatterns = [
      /git push/i,
      /npm publish/i,
      /delete.*file/i,
      /remove.*database/i,
      /deploy/i,
      /production/i,
      /sudo/i
    ];

    return approvalPatterns.some(pattern => pattern.test(instruction));
  }

  /**
   * Manejar mensajes entrantes del Gateway
   */
  handleMessage(message) {
    this.stats.lastActivity = Date.now();

    switch (message.type) {
      case 'handshake-ack':
        this.emit('handshake-complete', message);
        break;

      case 'task-accepted':
        this.emit('task-accepted', message);
        break;

      case 'task-progress':
        this.emit('task-progress', message);
        break;

      case 'task-approval-required':
        this.handleApprovalRequest(message);
        break;

      case 'task-completed':
        this.handleTaskCompleted(message);
        break;

      case 'task-failed':
        this.handleTaskFailed(message);
        break;

      case 'thinking':
        this.emit('thinking', message);
        break;

      case 'tool-call':
        this.emit('tool-call', message);
        break;

      default:
        console.warn('🦞 [Moltbot] Unknown message type:', message.type);
    }
  }

  /**
   * Manejar solicitud de aprobación
   */
  handleApprovalRequest(message) {
    const { taskId, action, reason } = message;

    this.emit('approval-required', {
      taskId,
      action,
      reason,
      approve: () => this.approveTask(taskId),
      reject: () => this.rejectTask(taskId)
    });
  }

  /**
   * Aprobar tarea pendiente
   */
  approveTask(taskId) {
    this.send({
      type: 'approval-response',
      taskId,
      approved: true,
      timestamp: Date.now()
    });
  }

  /**
   * Rechazar tarea pendiente
   */
  rejectTask(taskId) {
    this.send({
      type: 'approval-response',
      taskId,
      approved: false,
      timestamp: Date.now()
    });

    // Resolver la promesa como rechazada
    if (this.pendingTasks.has(taskId)) {
      const { reject } = this.pendingTasks.get(taskId);
      reject(new Error('Task rejected by user'));
      this.pendingTasks.delete(taskId);
    }
  }

  /**
   * Manejar tarea completada
   */
  handleTaskCompleted(message) {
    const { taskId, result } = message;

    if (this.pendingTasks.has(taskId)) {
      const { resolve, startTime } = this.pendingTasks.get(taskId);

      // Actualizar estadísticas
      const responseTime = Date.now() - startTime;
      this.updateStats('completed', responseTime);

      resolve({
        success: true,
        result,
        responseTime
      });

      this.pendingTasks.delete(taskId);
      this.emit('task-completed', { taskId, result });
    }
  }

  /**
   * Manejar tarea fallida
   */
  handleTaskFailed(message) {
    const { taskId, error } = message;

    if (this.pendingTasks.has(taskId)) {
      const { reject, startTime } = this.pendingTasks.get(taskId);

      // Actualizar estadísticas
      const responseTime = Date.now() - startTime;
      this.updateStats('failed', responseTime);

      reject(new Error(error));

      this.pendingTasks.delete(taskId);
      this.emit('task-failed', { taskId, error });
    }
  }

  /**
   * Actualizar estadísticas
   */
  updateStats(status, responseTime) {
    if (status === 'completed') {
      this.stats.tasksCompleted++;
    } else if (status === 'failed') {
      this.stats.tasksFailed++;
    }

    // Media móvil del tiempo de respuesta
    const totalTasks = this.stats.tasksCompleted + this.stats.tasksFailed;
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (totalTasks - 1) + responseTime) / totalTasks;
  }

  /**
   * Enviar mensaje al Gateway
   */
  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not ready');
    }

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Registrar listener de eventos
   */
  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  /**
   * Eliminar listener
   */
  off(event, handler) {
    if (this.eventListeners.has(event)) {
      const handlers = this.eventListeners.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emitir evento
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`🦞 [Moltbot] Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    return {
      ...this.stats,
      isConnected: this.isConnected,
      pendingTasks: this.pendingTasks.size,
      uptime: this.stats.lastActivity
        ? Date.now() - this.stats.lastActivity
        : 0
    };
  }

  /**
   * Desconectar del Gateway
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.sessionId = null;
    this.pendingTasks.clear();
  }
}

export default ClawdbotGateway;

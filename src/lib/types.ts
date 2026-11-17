
/**
 * @fileOverview Definições de tipos globais para o sistema SGov FluxoSaúde.
 * Define a distinção clara entre os papéis administrativos e operacionais.
 */

export type UserRole = 'UBS_MANAGER' | 'DRIVER' | 'ADMIN' | 'SECRETARY';

/**
 * Perfil de Usuário
 * SECRETARY/ADMIN: Acesso ao dashboard central (/dashboard)
 * UBS_MANAGER: Acesso ao portal da unidade (/ubs-portal)
 * DRIVER: Acesso ao aplicativo de campo (/driver)
 */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  unitId?: string; // ID da UBS (obrigatório para UBS_MANAGER)
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  medicalRecordNumber: string;
  comorbidities: string[];
  needsCompanion: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UBS {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  
  // Novos campos expandidos
  managerName?: string;
  phone?: string;
  email?: string;
  operatingHours?: string;
  type?: 'UBS' | 'HOSPITAL' | 'PRONTO_ATENDIMENTO' | 'ESPECIALIZADA';
  status?: 'active' | 'inactive';
}

export interface MaintenanceRecord {
  id: string;
  type: 'Óleo' | 'Pneus' | 'Freios' | 'Suspensão' | 'Geral';
  date: string;
  description: string;
  odometer: number;
}

export interface Vehicle {
  id: string;
  type: 'Ambulância' | 'Van' | 'Sedan' | 'Acessível';
  licensePlate: string;
  capacity: number;
  available: boolean;
  status?: 'AVAILABLE' | 'MAINTENANCE' | 'IN_USE';
  
  // Informações Técnicas Adicionais
  odometer?: number;
  fuelLevel?: number; // 0-100
  lastMaintenance?: string;
  nextMaintenance?: string;
  insuranceExpiry?: string;
  lastSanitization?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;

  maintenanceHistory?: MaintenanceRecord[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone?: string;
  available: boolean;
  status?: 'AVAILABLE' | 'ON_ROUTE' | 'OFF_DUTY';
  createdAt?: string;
  updatedAt?: string;
}

export type TransportStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'COMPLETED' | 'CANCELLED';

export interface TransportRequest {
  id: string;
  patientId: string;
  patientName: string;
  ubsId: string;
  pickupLocation: string;
  destinationLocation: string;
  requestedTime: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  status: TransportStatus;
  operatorId: string; 
  createdAt: string;
  updatedAt?: string;
  
  driverId?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  assignedAt?: string;
  manifestId?: string;
  
  // Suporte ao Paciente
  patientAccessCode?: string;
  
  // Suporte à IA
  aiRecommendation?: string;
  aiSuggestedAction?: 'approve' | 'deny' | 'escalate' | 'needs_more_info';
}

export interface DriverReport {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId?: string;
  content: string;
  timestamp: string;
  read: boolean;
  type?: 'NORMAL' | 'SOS';
}

export interface BoardingLog {
  requestId: string;
  patientName: string;
  timestamp: string;
  lat: number;
  lng: number;
}

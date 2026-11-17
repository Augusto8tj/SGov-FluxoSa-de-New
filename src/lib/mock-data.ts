
import { Patient, TransportRequest, Vehicle, Driver, UBS, DriverReport, MaintenanceRecord } from "./types";

/**
 * @fileOverview Base de dados mock técnica para demonstração executiva (Perfil TI).
 * Contém dados de alta fidelidade, metadados de sistema e telemetria.
 */

export const MOCK_PATIENTS: Patient[] = [
  { id: "P1", name: "Benedito Silva", medicalRecordNumber: "CNS: 123.456.789-00", comorbidities: ["Diabetes", "Hipertensão"], needsCompanion: true, notes: "Cadeirante, requer rampa de acesso hidráulica.", createdAt: new Date().toISOString() },
  { id: "P2", name: "Maria de Fátima", medicalRecordNumber: "CNS: 987.654.321-11", comorbidities: ["Renal Crônico"], needsCompanion: false, notes: "Tratamento de Hemodiálise (Seg/Qua/Sex).", createdAt: new Date().toISOString() },
  { id: "P3", name: "José Bonifácio", medicalRecordNumber: "CNS: 456.789.123-44", comorbidities: ["Cardiopata"], needsCompanion: true, notes: "Uso de marca-passo, evitar proximidade com rádio-frequência forte.", createdAt: new Date().toISOString() },
  { id: "P4", name: "Ana Oliveira", medicalRecordNumber: "CNS: 321.654.987-22", comorbidities: ["Pós-Operatório"], needsCompanion: true, notes: "Cirurgia ortopédica recente, transporte em maca obrigatório.", createdAt: new Date().toISOString() },
  { id: "P5", name: "Wilson Oliveira", medicalRecordNumber: "CNS: 789.456.123-33", comorbidities: ["DPOC"], needsCompanion: false, notes: "Uso contínuo de O2 a 2L/min.", createdAt: new Date().toISOString() },
  { id: "P7", name: "Cecília Meireles", medicalRecordNumber: "CNS: 555.666.777-88", comorbidities: ["Oncologia"], needsCompanion: true, notes: "Paciente em quimioterapia, imunossuprimida.", createdAt: new Date().toISOString() },
  { id: "P13", name: "Jorge Amado", medicalRecordNumber: "CNS: 333.333.333-33", comorbidities: ["Cardiopata"], needsCompanion: false, notes: "Histórico de angina instável.", createdAt: new Date().toISOString() },
];

export const MOCK_REQUESTS: TransportRequest[] = [
  // NOVOS PEDIDOS PENDENTES PARA DEMONSTRAÇÃO (PAINEL DE COMANDO)
  { 
    id: "REQ-PEND-001", 
    patientId: "P7", 
    patientName: "Cecília Meireles", 
    ubsId: "UBS Central", 
    pickupLocation: "UBS Central", 
    destinationLocation: "Hospital Municipal", 
    urgencyLevel: "critical", 
    status: "PENDING", 
    requestedTime: new Date().toISOString(), 
    operatorId: "UBS_MGR", 
    createdAt: new Date().toISOString(), 
    patientAccessCode: "405060", 
    aiRecommendation: "Prioridade Crítica: Paciente oncológica com dor aguda reportada. Requer isolamento relativo na viatura." 
  },
  { 
    id: "REQ-PEND-002", 
    patientId: "P13", 
    patientName: "Jorge Amado", 
    ubsId: "UBS Passa Três", 
    pickupLocation: "UBS Passa Três", 
    destinationLocation: "Centro Hemodiálise", 
    urgencyLevel: "high", 
    status: "PENDING", 
    requestedTime: new Date().toISOString(), 
    operatorId: "UBS_MGR", 
    createdAt: new Date().toISOString(), 
    patientAccessCode: "405061", 
    aiRecommendation: "Logística: Sessão de hemodiálise inadiável às 14h. Rota sugerida via BR-393 para evitar trânsito central." 
  },
  
  // APROVADOS PRONTOS PARA MANIFESTO (DEMO OTIMIZADOR)
  { id: "REQ-001", patientId: "P1", patientName: "Benedito Silva", ubsId: "UBS Lídice", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "critical", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString(), patientAccessCode: "102030", vehicleId: "Ambulância V1", vehiclePlate: "ABC-1234", driverId: "Carlos Alberto Silva" },
  { id: "REQ-002", patientId: "P4", patientName: "Ana Oliveira", ubsId: "UBS Lídice", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "low", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString(), patientAccessCode: "102031", vehicleId: "Ambulância V1", vehiclePlate: "ABC-1234", driverId: "Carlos Alberto Silva" },
  { id: "REQ-006", patientId: "P2", patientName: "Maria de Fátima", ubsId: "UBS Central", pickupLocation: "UBS Central", destinationLocation: "Clínica Hemodiálise", urgencyLevel: "high", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString(), patientAccessCode: "203040", vehicleId: "Van V2", vehiclePlate: "XYZ-5678", driverId: "Marcos Pereira" },
];

const MOCK_MAINTENANCE_HISTORY: MaintenanceRecord[] = [
  { id: "M1", type: 'Óleo', date: '2024-05-10', odometer: 12100, description: 'Troca de óleo sintético 5W30, filtro de óleo e filtro de combustível.' },
  { id: "M2", type: 'Pneus', date: '2024-04-15', odometer: 11800, description: 'Substituição dos pneus dianteiros (Michelin) e balanceamento.' },
  { id: "M3", type: 'Freios', date: '2024-03-02', odometer: 10500, description: 'Troca de pastilhas de freio dianteiras e fluído DOT4.' },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { 
    id: "V1", 
    type: "Ambulância", 
    licensePlate: "ABC-1234", 
    capacity: 4, 
    available: true, 
    status: 'AVAILABLE', 
    odometer: 12450, 
    fuelLevel: 85, 
    lastMaintenance: "2024-04-12", 
    nextMaintenance: "2024-06-15", 
    insuranceExpiry: "2024-12-31", 
    lastSanitization: "2024-05-20 07:00", 
    assignedDriverName: "Carlos Alberto Silva",
    maintenanceHistory: MOCK_MAINTENANCE_HISTORY
  },
  { 
    id: "V2", 
    type: "Van", 
    licensePlate: "XYZ-5678", 
    capacity: 12, 
    available: true, 
    status: 'IN_USE', 
    odometer: 45600, 
    fuelLevel: 42, 
    lastMaintenance: "2024-03-05", 
    nextMaintenance: "2024-07-10", 
    insuranceExpiry: "2024-10-15", 
    lastSanitization: "2024-05-20 06:30" 
  },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: "D1", name: "Carlos Alberto Silva", licenseNumber: "CNH: 123456789-A", phone: "(24) 99123-4567", available: true, status: 'AVAILABLE' },
  { id: "D2", name: "Marcos Pereira", licenseNumber: "CNH: 987654321-B", phone: "(24) 98765-4321", available: true, status: 'ON_ROUTE' },
  { id: "D3", name: "Ricardo Oliveira", licenseNumber: "CNH: 554433221-A", phone: "(24) 99887-1122", available: true, status: 'AVAILABLE' },
];

export const MOCK_UBS: UBS[] = [
  { id: "UBS-01", name: "UBS Central", address: "Av. 29, 123 - Centro, Rio Claro", location: { lat: -22.7214, lng: -44.1322 }, managerName: "Dra. Helena Souza", phone: "(24) 3332-1001", email: "ubs.central@rioclaro.rj.gov.br", operatingHours: "07:00 - 17:00", type: "UBS", status: "active" },
  { id: "UBS-02", name: "UBS Rio Claro Sul", address: "Distrito de Passa Três", location: { lat: -22.7931, lng: -44.0244 }, managerName: "Enf. Marcos Lima", phone: "(24) 3332-2002", email: "ubs.passatres@rioclaro.rj.gov.br", operatingHours: "08:00 - 16:00", type: "UBS", status: "active" },
  { id: "UBS-03", name: "UBS Lídice", address: "Distrito de Lídice", location: { lat: -22.8455, lng: -44.2312 }, managerName: "Dra. Ana Paula Costa", phone: "(24) 3332-3003", email: "ubs.lidice@rioclaro.rj.gov.br", operatingHours: "07:30 - 17:30", type: "UBS", status: "active" },
];

export const MOCK_REPORTS: DriverReport[] = [
  { id: "R1", driverId: "D2", driverName: "Marcos Pereira", vehicleId: "Van V2", content: "🚨 ALERTA SOS: Falha no sistema de injeção na subida da serra. Veículo perdeu potência. Solicito reboque e viatura reserva para 8 passageiros.", timestamp: new Date().toISOString(), read: false, type: 'SOS' },
  { id: "R2", driverId: "D1", driverName: "Carlos Alberto Silva", vehicleId: "Ambulância V1", content: "Missão intermunicipal RJ finalizada. Abastecimento realizado no Posto Ipiranga conforme guia 002. KM: 12580.", timestamp: new Date(Date.now() - 3600000).toISOString(), read: true, type: 'NORMAL' },
];

export const MOCK_AUDIT_LOGS = [
  { id: "L1", userId: "sys-admin-01", userEmail: "ti@rioclaro.rj.gov.br", action: "REST_API_BATCH_UPDATE", resource: "Collection: Requests (Aprovação em lote)", ip: "10.0.0.145", status: "SUCCESS", timestamp: new Date().toISOString() },
  { id: "L2", userId: "demo-secretary", userEmail: "secretario@rioclaro.rj.gov.br", action: "UI_MANUAL_OVERRIDE", resource: "Manifesto MF-8821 (Alteração de Viatura)", ip: "189.122.45.10", status: "SUCCESS", timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: "L3", userId: "ubs-mgr-central", userEmail: "gerente.ubs@rioclaro.rj.gov.br", action: "FIRESTORE_WRITE", resource: "Patient P7 (Update Comorbidities)", ip: "177.34.12.8", status: "SUCCESS", timestamp: new Date(Date.now() - 7200000).toISOString() },
];

export const MOCK_DOCUMENTS = [
  { id: "DOC-2024-001", type: "DIÁRIA", name: "Requerimento de Auxílio Viagem", driverName: "Carlos Alberto Silva", value: "R$ 150,00", status: "READY", createdAt: new Date().toISOString() },
  { id: "DOC-2024-002", type: "COMBUSTÍVEL", name: "Autorização de Abastecimento", driverName: "Marcos Pereira", value: "40 Litros (Diesel S10)", status: "PRINTED", createdAt: new Date(Date.now() - 86400000).toISOString() },
];

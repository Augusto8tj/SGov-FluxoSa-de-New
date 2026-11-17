
# SGov FluxoSaúde - Rio Claro, RJ

Sistema de Gestão de Transporte Sanitário para a Prefeitura de Rio Claro - RJ.

## 🚀 Status do Projeto: TESTE BETA (Dados Reais)
O sistema saiu da fase de prototipagem e agora opera conectado ao **Firebase Firestore** para gestão da malha viária municipal.

## 🏛️ Arquitetura por Perfis

O sistema é dividido em três ecossistemas distintos para garantir a eficiência operacional:

### 1. Central de Comando (Secretário/Admin) - `/dashboard`
*   **Objetivo**: Gestão macro e tomada de decisão estratégica.
*   **Recursos**: Painel de aprovação, otimização de rotas por IA, gestão de frota municipal e auditoria.

### 2. Portal das Unidades (Gerentes UBS) - `/ubs-portal`
*   **Objetivo**: Entrada de demanda e gestão local de pacientes.
*   **Recursos**: Cadastro de cidadãos (CNS), solicitações de transporte e fornecimento de códigos de acesso.

### 3. Portal do Condutor (Motoristas) - `/driver`
*   **Objetivo**: Execução de campo e segurança.
*   **Recursos**: Manifesto digital, checklist de segurança, SOS e relatórios de KM.

## 🤖 Inteligência Artificial
O sistema utiliza **Genkit (Nvidia Nemotron via OpenRouter)** para:
- Otimização de rotas em tempo real (Motor Híbrido).
- Classificação de urgência clínica.
- Insights estratégicos para o gabinete.

---
**2024 - Secretaria Municipal de Ordem Pública - PMRC**

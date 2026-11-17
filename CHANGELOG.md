# Changelog - SGov FluxoSaúde

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.2.0] - 2024-06-12
### 🤖 Inteligência Artificial & Logística
- **Otimizador de Rotas v2:** Restauração completa do motor logístico com suporte a processamento híbrido. Integração resiliente com Nvidia Nemotron e algoritmo de contingência geográfico local para garantir a continuidade da operação.
- **Clusterização Geo-Espacial:** Melhoria no agrupamento de pacientes por distritos e destinos comuns (Lídice, Centro, Passa Três), otimizando o uso de combustível e tempo de frota.
- **Triagem de Campo Inteligente:** Implementação de análise automatizada de relatórios enviando notificações de Briefing Executivo e Checklist de Providências direto para o painel do Secretário.

### 📱 Experiência do Usuário (UX)
- **Mobile First:** Reestruturação responsiva completa do módulo de relatórios, adaptando tabelas complexas e painéis de IA para visualização perfeita em qualquer smartphone.
- **Histórico de Triagem:** Implementação de Dialog operacional para consulta de análises passadas, permitindo rastrear a evolução de ocorrências mecânicas e logísticas.

### ⚙️ Engenharia de Dados
- **Persistência Volátil (Demo Mode):** Implementação de ciclo de vida completo para manifestos no modo demonstração; solicitações agora saem da fila e migram para o estado "Oficializado" em tempo real.
- **Sanitização de Respostas:** Nova camada de processamento de saída de IA para remoção de Markdown e validação de integridade de IDs de solicitações.

## [1.1.0] - 2024-05-25
### 🛡️ Segurança & Auditoria
- **Painel de Auditoria:** Rastreabilidade completa de ações administrativas para o perfil Secretaria, incluindo logs de IP e timestamp.
- **Relatórios de Campo:** Novo canal de comunicação bidirecional entre motoristas e logística para registro de ocorrências em tempo real.
- **Cadeia de Custódia:** Implementação de logs imutáveis para garantir a integridade dos dados governamentais.

### 🚗 Gestão de Frota & Operação
- **Telemetria Expandida:** Monitoramento de nível de combustível, odômetro e status de sanitização integrados ao dashboard.
- **Portal do Cidadão v1.1:** Melhorias na visualização segura e botão de encerramento de sessão pública.

## [1.0.0] - 2024-05-22
### 🚀 Lançamento da Versão Estável
- **Portal do Cidadão:** Consulta segura via código de 6 dígitos.
- **IA Unificada:** Integração com Nvidia Nemotron para triagem clínica.
- **Multi-Perfil:** Ecossistemas para Secretaria, UBS e Motoristas.
- **PWA:** Instalação nativa em dispositivos móveis.

---
**Prefeitura de Rio Claro - RJ**
*Secretaria Municipal de Ordem Pública & Saúde*

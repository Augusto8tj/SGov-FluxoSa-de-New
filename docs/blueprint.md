# **App Name**: SGov FluxoSaúde

## Core Features:

- Gerenciamento de Recursos: Permita o cadastro e controle de postos de saúde, motoristas e da frota de veículos, incluindo a gestão de capacidade e disponibilidade em tempo real.
- Cadastro de Pacientes e Solicitação de Transporte: Crie prontuários detalhados de pacientes com histórico de comorbidades e requisitos de acompanhantes, facilitando a triagem e solicitação de transportes.
- Sistema de Agendamento por Horário Definido: Garanta que as solicitações de transporte sejam feitas apenas entre 08h e 13h, com um sistema de bloqueio automático para organizar o fluxo diário.
- Otimizador Inteligente de Rotas: Utilize uma ferramenta de IA como um tool que processa os agendamentos aprovados via API OpenRouter para sugerir as rotas e atribuições de veículos mais eficientes.
- Painel Administrativo para Aprovação: Forneça um console administrativo onde o Secretário de Saúde pode avaliar e aprovar/recusar solicitações de viagens, com a opção de ativar ou desativar o auxílio da IA na tomada de decisão.
- Notificações Automatizadas: Configure um serviço de backend integrado ao Google Apps Script para o disparo automático de e-mails e SMS de confirmação para os envolvidos após a aprovação das solicitações.
- Histórico de Transporte e Auditoria: Mantenha um registro estruturado de todo o histórico de transportes e alterações, facilitando a auditoria e a gestão transparente dos dados pela prefeitura.

## Style Guidelines:

- O aplicativo adotará um esquema de cores claras. O primário será um azul sóbrio (#2E7EB8), transmitindo confiança e profissionalismo. O plano de fundo será um tom quase branco do mesmo azul (#F3F5F7), garantindo alta legibilidade. Um tom de ciano vibrante (#52E0D4) será utilizado como acento para destaques e elementos interativos.
- Será utilizada a fonte 'Inter' (sans-serif) para todo o texto da aplicação, desde títulos a corpo de texto, devido à sua clareza e legibilidade em interfaces digitais e ambientes de dados densos.
- Utilize ícones vetoriais claros e minimalistas, preferencialmente no estilo outline ou solid, para representar funcionalidades e informações de maneira eficiente e intuitiva, mantendo a consistência visual em todo o aplicativo.
- O layout será limpo e organizado, com foco na usabilidade e na apresentação estruturada de dados, permitindo fácil navegação entre as diferentes seções de gerenciamento e relatórios, adaptável a diferentes tamanhos de tela.
- Implementar animações sutis e funcionais, como transições suaves e indicadores de carregamento, para melhorar a experiência do usuário sem distrair, oferecendo feedback claro sobre as interações do sistema.
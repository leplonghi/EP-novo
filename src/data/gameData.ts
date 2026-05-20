export type Student = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export const STUDENTS: Student[] = [
  { id: "s1", name: "Alice Araújo", color: "#f97316", icon: "user" },
  { id: "s2", name: "Emmilly Beatriz", color: "#3b82f6", icon: "user" },
  { id: "s3", name: "Júlia Costa", color: "#10b981", icon: "user" },
  { id: "s4", name: "Sofia Lopes", color: "#8b5cf6", icon: "user" },
  { id: "s5", name: "Yasmin Morgado", color: "#ec4899", icon: "user" },
  { id: "s6", name: "Maria Eduarda", color: "#06b6d4", icon: "user" },
  { id: "s7", name: "Rafisa Melo", color: "#eab308", icon: "user" },
  { id: "s8", name: "Rebecca Moysane", color: "#ef4444", icon: "user" },
  { id: "s9", name: "Beatriz Silva", color: "#14b8a6", icon: "user" },
  { id: "s10", name: "Isabelle Almeida", color: "#6366f1", icon: "user" },
  { id: "s11", name: "Mary Kelly Soares", color: "#f43f5e", icon: "user" },
  { id: "s12", name: "Rafaelle Viegas", color: "#84cc16", icon: "user" },
  { id: "s13", name: "Janielle Andrade", color: "#d946ef", icon: "user" },
  { id: "s14", name: "Maria Clara Andrade", color: "#0ea5e9", icon: "user" },
  { id: "s15", name: "João Vítor de Almeida", color: "#f59e0b", icon: "user" },
  { id: "s16", name: "Gabriel Santana", color: "#10b981", icon: "user" },
  { id: "s17", name: "Liandra Oliveira", color: "#3b82f6", icon: "user" },
  { id: "s18", name: "David Amorim", color: "#64748b", icon: "user" },
  { id: "s19", name: "Silviane Pinheiro", color: "#a855f7", icon: "user" },
  { id: "s20", name: "Morgana Kochhann", color: "#ec4899", icon: "user" },
  { id: "s21", name: "Lucianne Barreto", color: "#ef4444", icon: "user" },
  { id: "s22", name: "Ana Clara Gabiatti", color: "#f97316", icon: "user" },
  { id: "s23", name: "Ana Gabryella Naves", color: "#eab308", icon: "user" },
  { id: "s24", name: "Giovanna Brito", color: "#84cc16", icon: "user" },
  { id: "s25", name: "Manuela Zambrotti", color: "#14b8a6", icon: "user" },
  { id: "s26", name: "Vitória Ribeiro", color: "#06b6d4", icon: "user" },
  { id: "s27", name: "Kauã Lutero", color: "#3b82f6", icon: "user" },
  { id: "s28", name: "Luís Gustavo", color: "#6366f1", icon: "user" },
  { id: "s29", name: "Amanda Carneiro", color: "#d946ef", icon: "user" },
  { id: "s30", name: "Evylin Sanches", color: "#f43f5e", icon: "user" },
  { id: "s31", name: "João Gabriel Gomes", color: "#f59e0b", icon: "user" },
  { id: "s32", name: "Mario", color: "#10b981", icon: "user" },
  { id: "s33", name: "Amanda", color: "#8b5cf6", icon: "user" },
  { id: "test_user", name: "Usuário Teste", color: "#ffffff", icon: "flask-conical" }
];

export const ZONES = [
  { id: "z1", name: "Portal da Chegada", technical: "Entrada Urbana", tooltip: "Primeira impressão do território. Aqui entram legibilidade, acolhimento e sensação de chegada.", icon: "door-open" },
  { id: "z2", name: "Corredor da Pressa", technical: "Eixo de Passagem", tooltip: "Área onde todo mundo passa, mas ninguém fica. O desafio é transformar fluxo em experiência urbana.", icon: "fast-forward" },
  { id: "z3", name: "Forno de Piso", technical: "Praça Seca Quente", tooltip: "Espaço mineralizado, quente e desconfortável. Sombra, drenagem e permanência são decisivas aqui.", icon: "sun-dim" },
  { id: "z4", name: "Banco Fantasma", technical: "Área de Permanência Frágil", tooltip: "Existe espaço para ficar, mas falta motivo, conforto ou qualidade. Permanência não nasce por decreto.", icon: "armchair" },
  { id: "z5", name: "Varanda das Águas", technical: "Borda d’Água", tooltip: "Paisagem potente e subutilizada. O desafio é transformar vista em lugar.", icon: "waves" },
  { id: "z6", name: "Nó dos Fluxos", technical: "Travessia Crítica", tooltip: "Pedestres, bicicletas e veículos disputam o mesmo ponto. Segurança e hierarquia de fluxos são prioridade.", icon: "shuffle" },
  { id: "z7", name: "Sobra Sem Nome", technical: "Vazio Residual", tooltip: "Área esquecida, sem função clara. Pode virar potência urbana ou continuar como resto de projeto.", icon: "ghost" },
  { id: "z8", name: "Muralha Muda", technical: "Frente Inativa", tooltip: "Borda construída sem vida, uso ou vigilância natural. Fachada ativa e presença urbana podem mudar o jogo.", icon: "brick-wall" },
];

export const ROUNDS = [
  {
    id: 1,
    title: "Raio-X da Rua",
    subtitle: "Antes de projetar, enxergue o problema. Qual conflito urbano é o mais urgente no terreno?",
    tooltip: "Diagnóstico é leitura crítica do espaço: fluxos, usos, conflitos. Identificar corretamente o problema é 50% da solução.",
    mechanic: "pick_problem",
    options: [
      { id: "p1", title: "Ninguém Fica", tooltip: "Baixa permanência. O espaço é apenas atravessado, sem mobiliário ou motivo para que as pessoas o utilizem." },
      { id: "p2", title: "Sol de Castigo", tooltip: "Falta de sombra e conforto térmico. Em clima quente, sem sombreamento, o espaço é inutilizável." },
      { id: "p3", title: "Fluxo Embolado", tooltip: "Pedestres, ciclistas e veículos disputam o mesmo espaço, criando perigo e desconforto." },
      { id: "p4", title: "Acesso Quebrado", tooltip: "Barreiras físicas, percursos desconexos ou falta de acessibilidade impedem o direito à cidade." },
      { id: "p5", title: "Medo Pós-18h", tooltip: "Falta de iluminação, fachadas cegas e ausência de pessoas tornam o local perigoso à noite." },
      { id: "p6", title: "Chuva Vira Lagoa", tooltip: "Excesso de área impermeável e drenagem falha causam alagamentos e danos ao uso." },
      { id: "p7", title: "Lugar Sem Memória", tooltip: "Espaço genérico, sem identidade ou conexão com a cultura local." },
      { id: "p8", title: "Borda Morta", tooltip: "Fachadas ativas inexistentes: o limite entre edifícios e rua é inativo, sem troca urbana." }
    ]
  },
  {
    id: 2,
    title: "Combo de Urbanidade",
    subtitle: "Duas estratégias complementares.",
    tooltip: "Boa solução responde ao problema, qualifica o lugar e atende às pessoas. Selecione um combo funcional.",
    mechanic: "pick_combo", 
    options: [
      { id: "s1", title: "Sombra que Segura Gente", tooltip: "Árvores ou pérgolas. Cria conforto térmico necessário para permanência." },
      { id: "s2", title: "Banco com Dignidade", tooltip: "Mobiliário posicionado com foco no pedestre. Banco no sol é inutilizável." },
      { id: "s3", title: "Piso que Bebe Chuva", tooltip: "Área permeável para combater alagamentos." },
      { id: "s4", title: "Travessia de Respeito", tooltip: "Safe, acessível, prioridade ao pedestre." },
      { id: "s5", title: "Rota Sem Perrengue", tooltip: "Acessibilidade total, contínua e sem degraus." },
      { id: "s6", title: "Luz de Presença", tooltip: "Segurança sem poluição luminosa excessiva." },
      { id: "s7", title: "Jardim Antienchente", tooltip: "Paisagismo com função clara de drenagem." },
      { id: "s8", title: "Bike Bem-vinda", tooltip: "Apoio prático à mobilidade ativa." },
      { id: "s9", title: "Placa que Explica", tooltip: "Ajuda na legibilidade e apropriação do lugar." },
      { id: "s10", title: "Borda Ativada", tooltip: "Uso comercial ou social na fachada para dinamizar a rua." }
    ]
  },
  {
    id: 3,
    title: "Orçamento de Bolso",
    subtitle: "Distribua 10 fichas conforme o impacto que você quer gerar.",
    tooltip: "Recursos são finitos. Priorize onde a intervenção terá maior retentor de qualidade urbana.",
    mechanic: "distribute_tokens",
    options: [
      { id: "o1", title: "Sombra & Clima", tooltip: "Foco integral em conforto térmico e drenagem." },
      { id: "o2", title: "Ficar & Conviver", tooltip: "Prioriza permanência, mobiliário e uso social." },
      { id: "o3", title: "Ir & Chegar", tooltip: "Prioriza fluxos, caminhabilidade e conexões." },
      { id: "o4", title: "Acesso para Todos", tooltip: "Foco em inclusão e mobilidade reduzida." },
      { id: "o5", title: "Memória & Identidade", tooltip: "Prioriza valorização local e pertencimento." }
    ]
  },
  {
    id: 4,
    title: "Detalhe Mata Render",
    subtitle: "Qual estratégia é mais robusta na implementação?",
    tooltip: "Projeto urbano precisa de materialidade, manutenção, uso real e escala humana. Escolha a que melhor responde ao uso.",
    mechanic: "pick_detail",
    options: [
      { id: "e1", title: "Banco com Dignidade", tooltip: "Considera posição, conforto e uso." },
      { id: "e2", title: "Sombra que Segura Gente", tooltip: "Considera espécie, escala e eficiência." },
      { id: "e3", title: "Piso que Bebe Chuva", tooltip: "Considera drenagem e manutenção." },
      { id: "e4", title: "Travessia de Respeito", tooltip: "Considera segurança e fluxo real." },
      { id: "e5", title: "Luz de Presença", tooltip: "Considera alcance, eficácia e segurança." },
      { id: "e6", title: "Rota Sem Perrengue", tooltip: "Considera continuidade e acessibilidade." },
      { id: "e7", title: "Jardim Antienchente", tooltip: "Considera drenagem e paisagismo." },
      { id: "e8", title: "Bike Bem-vinda", tooltip: "Considera praticidade e uso frequente." }
    ],

    users: ["crianças", "idosos", "estudantes", "trabalhadores", "ciclistas", "pessoas com deficiência", "moradores", "visitantes"],
    risks: [
      { id: "r1", title: "Banco no Sol", tooltip: "Quando o mobiliário existe, mas ninguém usa porque o conforto foi ignorado." },
      { id: "r2", title: "Rampa que Não Leva a Lugar Nenhum", tooltip: "Acessibilidade falsa: parece inclusão, mas não resolve o percurso real." },
      { id: "r3", title: "Piso Bonito que Escorrega", tooltip: "Material estético, mas inadequado para segurança, clima ou manutenção." },
      { id: "r4", title: "Área que Alaga", tooltip: "Falha de drenagem que compromete uso, conforto e durabilidade." },
      { id: "r5", title: "Caminho que Dá Medo", tooltip: "Percurso com baixa visibilidade, pouca presença urbana ou iluminação ruim." },
      { id: "r6", title: "Mobiliário que Quebra Fácil", tooltip: "Solução que não considera uso intenso, manutenção e durabilidade." },
      { id: "r7", title: "Espaço Bonito e Vazio", tooltip: "Imagem boa, uso fraco. Falta motivo real para permanecer." },
      { id: "r8", title: "Conflito entre Usos", tooltip: "Fluxos e atividades disputam espaço sem organização clara." }
    ]
  },
  {
    id: 5,
    title: "Treta no Território",
    subtitle: "Sua proposta encontrou a vida real. E agora?",
    tooltip: "Cidade real muda, pressiona e contradiz o projeto. A boa proposta resiste sem perder qualidade urbana.",
    mechanic: "crisis",
    options: [
      { id: "c1", title: "Chuva de Respeito", tooltip: "Evento de chuva forte expõe drenagem frágil e excesso de impermeabilização." },
      { id: "c2", title: "Calor de Derreter Partido", tooltip: "Temperatura alta revela se o projeto tem conforto climático ou só boas intenções." },
      { id: "c3", title: "Apagão da Permanência", tooltip: "À noite, o espaço perde usuários por falta de luz, presença urbana e segurança." },
      { id: "c4", title: "Corte no Orçamento", tooltip: "O recurso caiu. A equipe precisa escolher o que é essencial e o que era enfeite." },
      { id: "c5", title: "Conflito de Rodinhas", tooltip: "Pedestres, bicicletas, patinetes ou carrinhos disputam o mesmo espaço." },
      { id: "c6", title: "Bonito, mas Vazio", tooltip: "O projeto ficou apresentável, mas não criou motivo real para as pessoas usarem." },
      { id: "c7", title: "Manutenção Mandou Lembranças", tooltip: "A solução exige manutenção demais e pode virar problema em pouco tempo." }
    ],
    adaptations: [
      "Sombra emergencial", "Drenagem esperta", "Iluminação de percurso", "Menos piso duro", 
      "Fluxo reorganizado", "Uso temporário", "Borda ativada", "Mobiliário resistente", "Rota acessível reforçada"
    ]
  }
];

export const CONDITIONALS = [
  { id: "cond1", title: "Pouca Grana, Muita Responsa", tooltip: "O orçamento caiu. Escolha soluções de alto impacto e baixa complexidade." },
  { id: "cond2", title: "Meio-dia no Maranhão", tooltip: "Conforto térmico virou prioridade. Ignorar sombra e materialidade reduz a nota." },
  { id: "cond3", title: "Acessibilidade Não é Bônus", tooltip: "A proposta precisa funcionar para idosos, crianças e pessoas com deficiência." },
  { id: "cond4", title: "Chuva Chegou Primeiro", tooltip: "Drenagem e permeabilidade entram no centro do problema." },
  { id: "cond5", title: "Manutenção Existe", tooltip: "Se a solução é difícil de conservar, ela pode fracassar no uso real." },
  { id: "cond6", title: "O Usuário Mudou o Projeto", tooltip: "A população usa o espaço de forma diferente do previsto." },
  { id: "cond7", title: "Sem Enfeite Solto", tooltip: "Elemento bonito sem função urbana não ganha jogo." },
  { id: "cond8", title: "Fluxo Não é Gente Correndo", tooltip: "Circulação precisa ser confortável, segura e legível." }
];



export const RANKS = [
  { max: 199, name: "Calouro da Calçada", tooltip: "Está começando a ler a cidade. Ainda tropeça no meio-fio conceitual." },
  { max: 399, name: "Estrategista da Praça", tooltip: "Já entende que espaço público não é vazio decorado." },
  { max: 599, name: "Mestre da Permanência", tooltip: "Conecta conforto, acessibilidade e uso real." },
  { max: 9999, name: "Lendário do Território", tooltip: "Aqui o render já virou cidade. Nível master." }
];

export function getRank(exp: number) {
  return RANKS.find(r => exp <= r.max) || RANKS[RANKS.length - 1];
}

# Siscol — Sistema de Gestão Escolar

O **Siscol** é a versão web do projeto acadêmico **PIM (Projeto Integrado
Multidisciplinar)**. O sistema apoia a gestão de uma instituição de ensino,
com cadastro de turmas, disciplinas, professores e alunos, além de atividades,
submissões, correções e indicadores acadêmicos.

## Projeto PIM

As três aplicações que compõem as entregas do PIM são:

- **Web (este repositório — Siscol):** https://github.com/jotavvvg/pim-4sm-panel
- **Mobile:** https://github.com/jotavvvg/pim-4sm-mobile
- **App/Desktop:** https://github.com/jotavvvg/pim-4sm-electron

## Arquitetura

O projeto utiliza uma arquitetura cliente-servidor organizada em dois módulos:

```text
Siscol/
├── backend/
│   ├── src/
│   │   ├── db/          # Conexão e schema do MySQL
│   │   ├── schemas/     # Validação dos dados de entrada
│   │   ├── services/    # Regras de negócio por domínio
│   │   └── server.ts    # API HTTP, autenticação e rotas
│   ├── drizzle/         # Migrations do banco de dados
│   └── scripts/         # Seed e migração de atividades
└── frontend/
    └── vite-project/
        └── src/
            ├── auth/        # Contexto, papéis e proteção de rotas
            ├── components/  # Componentes reutilizáveis da interface
            ├── lib/         # Cliente HTTP e validações
            ├── pages/       # Telas por fluxo do sistema
            └── types/       # Tipos das entidades da aplicação
```

O frontend é uma SPA (Single-Page Application) React. Durante o
desenvolvimento, o Vite encaminha as requisições `/api` para o backend. No
ambiente conteinerizado, o frontend é compilado em uma imagem multi-stage e
servido pelo Nginx, que encaminha `/api` para o serviço Fastify. A API acessa o
MySQL por meio do Drizzle ORM e aplica autenticação baseada em JWT, autorização
por papel e validação com Zod.

### Principais papéis

- **Administrador:** gerencia disciplinas, turmas, professores e alunos.
- **Professor:** consulta sua disciplina e seus alunos, cria atividades e
  corrige avaliações.
- **Aluno:** consulta seu perfil e disciplinas, responde atividades e acompanha
  suas submissões.

### Modelo de dados

O banco possui entidades para usuários, disciplinas, turmas, professores,
alunos, matrículas em disciplinas, atividades, questões, submissões e
respostas. As relações e as chaves estrangeiras são definidas em
`backend/src/db/schema.ts`; as alterações estruturais são versionadas em
`backend/drizzle/`.

## Ferramentas e tecnologias

### Backend

- Node.js e TypeScript
- Fastify
- Drizzle ORM e Drizzle Kit
- MySQL, acessado pelo driver `mysql2`
- Zod e `fastify-type-provider-zod` para validação e tipagem
- JWT (`@fastify/jwt`) para autenticação
- `bcryptjs` para hash de senhas
- `dotenv` para variáveis de ambiente
- `tsx` para execução em desenvolvimento

### Frontend

- React 19 e TypeScript
- Vite
- React Router
- TanStack React Query
- Axios
- React Hook Form e Zod
- Recharts e Chart.js para indicadores
- Lucide React para ícones
- Oxlint

## Pré-requisitos

- Node.js com suporte a ESM e npm
- MySQL em execução
- Um banco de dados criado para o sistema, por exemplo:

```sql
CREATE DATABASE academico_db;
```

As versões exatas das dependências ficam registradas nos arquivos
`backend/package-lock.json` e `frontend/vite-project/package-lock.json`.

## Inicialização

### 1. Configurar o backend

No PowerShell, a partir da raiz do repositório:

```powershell
cd backend
npm install
```

Crie `backend/.env` com pelo menos a URL de conexão:

```env
DATABASE_URL=mysql://root:SUA_SENHA@localhost:3306/academico_db
JWT_SECRET=uma-chave-secreta-durante-o-desenvolvimento
PORT=3000
```

Se o MySQL local não tiver senha, a URL pode ser
`mysql://root@localhost:3306/academico_db`. Em produção, `JWT_SECRET` deve ser
definido explicitamente; não use uma chave efêmera.

Aplique o schema e os dados iniciais:

```powershell
npm run db:push
npm run db:seed
npm run db:migrate:activities
```

O `db:seed` limpa e recria os dados de demonstração. Portanto, não o execute
em um banco que contenha dados que precisam ser preservados.

Inicie a API:

```powershell
npm run dev
```

A API ficará disponível em `http://localhost:3000`. O endpoint
`http://localhost:3000/health` pode ser usado para verificar se ela está ativa.

### 2. Executar com Docker Compose

Como alternativa à execução manual, o projeto possui um
`docker-compose.yml` na raiz. É necessário ter o Docker Desktop iniciado.

Na raiz do repositório, valide a configuração e suba os serviços:

```powershell
docker compose config
docker compose up --build -d
docker compose ps
```

O Compose inicia:

- `api`, publicada em `http://localhost:3000`;
- `db`, com MySQL disponível internamente para a API em `db:3306`;
- `web`, com o frontend compilado e servido pelo Nginx em
  `http://localhost:5173`;
- MySQL publicado no host em `localhost:3307`, evitando conflito com uma
  instalação local que já utilize a porta `3306`.

O frontend usa o proxy do Nginx para acessar a API pela mesma origem. Dentro da
rede do Compose, o Nginx encaminha `/api` para `api:3000`.

> A porta publicada `3307` é somente para acessos ao MySQL a partir do
> computador host. Dentro da rede do Compose, a API deve usar
> `mysql://root:senha@db:3306/academico_db`, que já está configurado no serviço
> `api`.

Após os containers subirem, aplique o schema e os dados iniciais dentro do
container da API:

```powershell
docker compose exec api npm run db:push
docker compose exec api npm run db:seed
docker compose exec api npm run db:migrate:activities
```

O `db:seed` limpa e recria os dados de demonstração. Execute-o somente em um
banco descartável ou quando essa limpeza for desejada.

Teste a API:

```powershell
Invoke-WebRequest http://localhost:3000/health
docker compose logs -f api
```

Para parar os serviços sem remover o banco persistido:

```powershell
docker compose down
```

Para remover também o volume do MySQL e começar com um banco vazio:

```powershell
docker compose down -v
```

### 3. Executar o frontend isoladamente (opcional)

Para desenvolver a interface com hot reload, abra outro terminal na raiz do
repositório:

```powershell
cd frontend\vite-project
npm install
npm run dev
```

O Vite disponibiliza a aplicação normalmente em `http://localhost:5173`. Nesse
modo, as chamadas `/api` são encaminhadas para `http://localhost:3000`.

Caso a API esteja em outro endereço, crie
`frontend/vite-project/.env.local`:

```env
VITE_API_PROXY_TARGET=http://localhost:3000
```

Também é possível configurar uma base de API diretamente com
`VITE_API_BASE_URL`. Quando essa variável não é definida, o frontend utiliza
`/api`, preservando o proxy do Vite.

## Usuários de demonstração

O seed cria contas para testes locais:

| Papel | Usuário | Senha |
|---|---|---|
| Administrador | `admin` | `Admin123!` |
| Professor | usuário derivado do nome | `Professor123!` |
| Aluno | usuário derivado do nome | `Aluno123!` |

Essas credenciais são somente para desenvolvimento e demonstração. Altere-as
ou remova os dados de seed antes de qualquer implantação real.

## Comandos úteis

### Backend

```powershell
npm run dev                 # Executa com recarregamento automático
npm run build               # Compila TypeScript para dist/
npm start                   # Executa a versão compilada
npm run db:generate         # Gera uma migration a partir do schema
npm run db:push             # Sincroniza o schema com o banco
npm run db:seed             # Recria dados de demonstração
npm run db:migrate:activities
```

### Frontend

```powershell
npm run dev                 # Servidor de desenvolvimento
npm run build               # Verificação TypeScript e build de produção
npm run lint                # Verificação com Oxlint
npm run preview             # Servir o build localmente
```

### Docker Compose

```powershell
docker compose config       # Validar a configuração
docker compose up --build -d # Construir e iniciar os containers
docker compose ps           # Verificar o status dos serviços
docker compose logs -f api  # Acompanhar logs estruturados da API
docker compose logs -f web  # Acompanhar logs do Nginx/frontend
docker compose down         # Parar containers, preservando o volume
docker compose down -v      # Parar e remover o volume do MySQL
```

## Disciplinas contempladas

Por integrar diferentes camadas de uma solução de software, o Siscol
contempla os seguintes eixos acadêmicos do PIM:

- **Análise e Desenvolvimento de Sistemas:** levantamento dos papéis,
  requisitos funcionais, fluxos de acesso e organização por domínios.
- **Programação Web e Engenharia de Software:** SPA em React, API REST,
  TypeScript, separação de responsabilidades, componentes reutilizáveis e
  controle de rotas.
- **Banco de Dados:** modelagem relacional, entidades associativas, chaves
  estrangeiras, índices, migrations e carga inicial em MySQL.
- **Segurança da Informação:** autenticação JWT, autorização por papéis,
  armazenamento de senhas com hash e validação de entradas.
- **Interface e Experiência do Usuário:** dashboards, formulários,
  tabelas, estados de carregamento e fluxos específicos para cada perfil.
- **Gestão e acompanhamento educacional:** atividades, respostas, correções,
  notas e métricas acadêmicas.

Os nomes formais das disciplinas podem variar conforme a matriz curricular da
instituição; os itens acima descrevem as competências efetivamente aplicadas
no projeto.

### Estrutura do Projeto
<!-- START_TREE -->
<!-- END_TREE -->

### Histórico Recente de Atualizações
<!-- START_CHANGELOG -->
<!-- END_CHANGELOG -->

## Licença e contexto acadêmico

Este repositório foi desenvolvido para fins acadêmicos no contexto do PIM.
Consulte a instituição e os responsáveis pelo projeto antes de reutilizar
dados, credenciais ou configurações de demonstração em outros ambientes.

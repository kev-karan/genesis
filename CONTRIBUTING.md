# Contribuindo com o ARCA Gênesis

Guia para novos membros configurarem o ambiente, entenderem o fluxo de trabalho e submeterem contribuições.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Docker + Docker Compose | qualquer versão recente |
| Python | 3.12 |
| Node.js | 22 |
| Git | qualquer versão recente |

---

## Setup do ambiente

### Com Docker (recomendado)

```bash
# Clone o repositório
git clone <url-do-repo>
cd genesis

# Suba todos os serviços com hot reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### Sem Docker

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata fluxogramas/fixtures/protocolos.json
python manage.py loaddata casos/fixtures/caso_dengue.json
python manage.py loaddata casos/fixtures/caso_sedacao.json
python manage.py runserver
```

Crie um arquivo `.env` na raiz com pelo menos:
```env
SECRET_KEY=qualquer-string-longa-aqui
```

Sem `DATABASE_URL`, o backend usa SQLite local automaticamente.

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

---

## Variáveis de ambiente

Copie o `.env` de referência e ajuste conforme necessário:

```env
SECRET_KEY=<chave-secreta-django>
DATABASE_URL=<url-postgres-ou-vazio-para-sqlite>

# Apenas para testes E2E
E2E_BASE_URL=http://localhost:3000
E2E_API_URL=http://localhost:8000/api
E2E_TEST_EMAIL=teste_e2e@genesis.com
E2E_TEST_PASSWORD=senha_teste_123
```

Nunca commite o arquivo `.env` com credenciais reais.

---

## Rodando os testes

### Backend (Django)

```bash
cd backend
python manage.py test                    # todos os testes
python manage.py test api_auth           # app específica
python manage.py test casos.tests.CasoTestCase.test_nome  # teste único
```

Requer `SECRET_KEY` no ambiente; sem `DATABASE_URL` usa SQLite.

### Frontend (Vitest)

```bash
cd frontend
npm test           # modo watch
npm run test:run   # rodada única (usado no CI)
```

### E2E (Selenium + pytest)

Requer backend e frontend rodando:

```bash
# Suba os serviços primeiro
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Rode os testes
cd e2e
pip install -r requirements.txt
pytest tests/ -v

# Teste específico
pytest tests/test_auth.py::TestAuth::test_login_valido -v

# Com relatório HTML
pytest tests/ -v --html=report.html --self-contained-html
```

---

## Branches e commits

### Nomenclatura de branches

Siga o padrão já estabelecido no repositório:

| Tipo | Padrão | Exemplo |
|---|---|---|
| Nova funcionalidade | `feat/<descricao>` | `feat/minha-conta` |
| Correção | `fix/<descricao>` | `fix/modo-emergencia` |
| Refatoração | `refactor/<descricao>` | `refactor/nome-pastas` |

### Mensagens de commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona tela de histórico de acessos
fix: corrige overflow em mobile no modo estudo
style: alinha ícones do bottom nav
refactor: extrai lógica de cálculo para hook
test: cobre fetchCasos com mock de token
```

- Imperativo, minúsculo, sem ponto final

---

## Adicionando novas páginas (frontend)

O frontend **não usa React Router** — navegação é via estado `tela` em [App.jsx](frontend/src/App.jsx).

1. Crie o componente em `frontend/src/pages/`
2. Importe em `App.jsx`
3. Adicione um `case` no bloco condicional de renderização
4. Se a página deve aparecer no `BottomNav`, atualize o mapa `activeNav` em `App.jsx`

```jsx
// App.jsx — exemplo
{tela === 'minha-tela' && <MinhaTela navegar={navegar} />}
```

Para navegar programaticamente: `navegar('minha-tela')` ou `navegar('estudo-caso', id)` para telas com ID.

### Protocolos fixos (shortcuts)

Protocolos acessíveis por nome estão no objeto `PROTOCOLOS` no topo de `App.jsx`:

```js
const PROTOCOLOS = {
  dengue: 1,
  sedacao: 2,
}
```

---

## Adicionando novos apps Django

1. `python manage.py startapp nome_do_app`
2. Adicione em `INSTALLED_APPS` em [settings.py](backend/arca_genesis/settings.py)
3. Inclua as URLs em [arca_genesis/urls.py](backend/arca_genesis/urls.py)
4. Aplique autenticação: todas as views requerem `IsAuthenticated` por padrão — exceto endpoints públicos, que devem declarar `permission_classes = []`

---

## Adicionando fixtures

Fixtures são carregadas automaticamente no deploy via `Dockerfile`. Para adicionar uma nova:

1. Crie o arquivo JSON em `<app>/fixtures/<nome>.json` com `pk` explícito (para upsert idempotente)
2. Adicione o `loaddata` no `CMD` do [backend/Dockerfile](backend/Dockerfile)
3. Documente no CLAUDE.md

---

## Ícones

Use apenas **SVGs inline** — não adicione assets PNG para ícones de UI. Isso garante controle de cor/stroke via props.

---

## CI/CD

O GitHub Actions executa automaticamente em push e PR para `main`:

| Workflow | Gatilho | O que faz |
|---|---|---|
| `test.yml` | push/PR → main | Testes backend (Django) + frontend (Vitest) |
| `e2e.yml` | push/PR → main | Sobe Docker, roda Selenium + pytest |

O relatório HTML dos testes E2E é salvo como artefato por 30 dias.

PRs só devem ser mergeados com os checks passando.

---

## Storybook

```bash
cd frontend
npm run storybook   # http://localhost:6006
```

Use Storybook para desenvolver e documentar componentes isolados.

---

## Dúvidas

Abra uma issue ou entre em contato com o time.

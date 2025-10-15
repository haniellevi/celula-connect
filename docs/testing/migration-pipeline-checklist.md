# Checklist de QA – Pipeline de Migração (Fase 3)

Use esta lista rápida sempre que precisar validar a importação de dados legados para o PostgreSQL/Prisma.

## Pré-requisitos
- `DATABASE_URL` apontando para o banco alvo (ambiente local ou Supabase dev).
- Export do sistema antigo em JSON (default: `tests/fixtures/domain-seed.json`). Para um dump externo, defina `OLD_DB_EXPORT=/caminho/para/export.json`.
- Dependências instaladas (`npm install`) e Prisma client gerado (`prisma generate`).

## Passo a passo
1. **Resetar o ambiente (opcional, mas recomendado)**
   ```bash
   npm run db:reset    # reconstrói schema e aplica seeds base
   ```
2. **Executar o pipeline**
   ```bash
   node scripts/migrate-data.ts
   ```
   - A execução é idempotente e pode ser rodada múltiplas vezes.
   - Verifique o log no terminal (cada módulo concluído imprime `✅`).
3. **Validar registros críticos**
   - Conferir contagem por módulo (exemplo usando Prisma Studio ou SQL):
     ```sql
     select count(*) from "Igreja";
     select count(*) from "Usuario";
     select count(*) from "Celula";
     select count(*) from "Devocional";
     select count(*) from "Aviso";
     select count(*) from "MetaLeitura";
     ```
   - Para o sistema bíblico:
     ```sql
     select count(*) from "LivroBiblia";
     select count(*) from "CapituloBiblia";
     select count(*) from "VersiculoBiblia";
     ```
4. **Smoke tests**
   - Rodar a suíte de integração relacionada:
     ```bash
     npm run test -- --runTestsByPath \
       tests/integration/api/igrejas-route.test.ts \
       tests/integration/api/celulas-route.test.ts \
       tests/integration/api/devocionais-route.test.ts
     ```
   - Validar os dashboards protegidos (`npm run dev`) com usuários seed (`usr_seed_pastor`, `usr_seed_supervisor`, `usr_seed_lider`, `usr_seed_discipulo`).
5. **Registrar evidências**
   - Anexar ao PR ou documentação:
     - Logs do pipeline (`node scripts/migrate-data.ts`).
     - Contagem de registros (print ou query result).
     - Resultado dos testes automatizados.

## Notas
- Se o export for complementar (ex.: produção), garanta que IDs não entrem em conflito com seeds locais; prefira prefixos/UUIDs.
- O pipeline não executa `db:reset`; isso deve ser feito separadamente para evitar perda de dados não intencional.
- Qualquer ajuste em schema ou relações requer atualização deste checklist e revalidação completa.

import { PrismaClient } from "../prisma/generated/client";

const prisma = new PrismaClient();

type MigrationTask = {
  name: string;
  run: () => Promise<void>;
};

const tasks: MigrationTask[] = [
  {
    name: "usuarios",
    run: async () => {
      console.info("➡️  Migrando usuários (stub)");
      // TODO: Importar dados do D1 / Mocha Auth e upsert em prisma.usuario
    },
  },
  {
    name: "igrejas",
    run: async () => {
      console.info("➡️  Migrando igrejas (stub)");
      // TODO: Conectar igrejas aos planos e mapear status/trials históricos
    },
  },
  {
    name: "celulas",
    run: async () => {
      console.info("➡️  Migrando células (stub)");
      // TODO: Garantir relacionamento com líderes e supervisores existentes
    },
  },
  {
    name: "membros-celula",
    run: async () => {
      console.info("➡️  Migrando membros de célula (stub)");
      // TODO: Criar histórico de cargos e datas de entrada/saída
    },
  },
  {
    name: "reunioes-celula",
    run: async () => {
      console.info("➡️  Migrando reuniões de célula (stub)");
      // TODO: Persistir métricas de presença/visitantes por encontro
    },
  },
];

async function main() {
  console.info("🚀 Iniciando pipeline de migração (stub)");

  for (const task of tasks) {
    try {
      await task.run();
      console.info(`✅ ${task.name} concluído (stub)`);
    } catch (error) {
      console.error(`❌ Erro ao migrar ${task.name}`, error);
      throw error;
    }
  }

  console.info("🎉 Pipeline de migração finalizado (stub)");
}

main()
  .catch((error) => {
    console.error("🚨 Migração interrompida", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

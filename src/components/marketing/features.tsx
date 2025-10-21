import { Shield, Zap, CreditCard, Cog, BarChart2, Lock } from "lucide-react"

const features = [
  {
    title: "Trilhas de Crescimento",
    description: "Acompanhe o desenvolvimento espiritual com trilhas personalizadas e progresso automático.",
    icon: Lock,
  },
  {
    title: "Gestão de Células",
    description: "Centralize informações de líderes, membros e reuniões em um painel unificado.",
    icon: CreditCard,
  },
  {
    title: "Avisos Inteligentes",
    description: "Sistema de notificações automáticas para manter a comunidade engajada.",
    icon: Shield,
  },
  {
    title: "Relatórios Pastorais",
    description: "Métricas detalhadas sobre crescimento, engajamento e saúde das células.",
    icon: Zap,
  },
  {
    title: "Automação Pastoral",
    description: "Automatize processos repetitivos e foque no que realmente importa.",
    icon: BarChart2,
  },
  {
    title: "Landing Dinâmica",
    description: "Configure e personalize a página inicial da sua igreja sem código.",
    icon: Cog,
  },
]

export function Features() {
  return (
    <section id="features" className="container mx-auto px-4 mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Ferramentas poderosas para sua igreja</h2>
        <p className="mt-3 text-muted-foreground">Tecnologia moderna para transformar sua gestão pastoral e acelerar o crescimento espiritual.</p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="group relative rounded-xl border bg-card/60 p-6 backdrop-blur-md">
            <div className="flex size-10 items-center justify-center rounded-md border bg-white/40 dark:bg-white/10">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}


const testimonials = [
  {
    name: "Pastor João Silva",
    role: "Igreja Central, São Paulo",
    quote: "O Célula Connect transformou nossa gestão pastoral. Agora acompanhamos o crescimento espiritual de cada membro de forma organizada.",
  },
  {
    name: "Pastora Maria Santos",
    role: "Igreja Vida Plena, Rio de Janeiro",
    quote: "As trilhas de crescimento automatizaram nosso discipulado. Nossos líderes estão mais engajados e os resultados são visíveis.",
  },
  {
    name: "Pastor Carlos Oliveira",
    role: "Igreja Multiplica, Belo Horizonte",
    quote: "A plataforma nos ajudou a escalar de 5 para 25 células em apenas 6 meses. A automação pastoral é revolucionária.",
  },
]

export function Testimonials() {
  return (
    <section className="container mx-auto px-4 mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Amado por pastores e líderes</h2>
        <p className="mt-3 text-muted-foreground">Junte-se a igrejas que estão transformando vidas através da tecnologia.</p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 will-change-transform hover:-translate-y-0.5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-black"
          >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:4px_4px] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
            </div>
            <blockquote className="relative text-sm leading-relaxed text-slate-900 dark:text-slate-100">“{t.quote}”</blockquote>
            <figcaption className="relative mt-4 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-medium text-slate-900 dark:text-slate-50">{t.name}</span> · {t.role}
            </figcaption>
            <div className="absolute inset-0 -z-10 rounded-xl p-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10" />
          </figure>
        ))}
      </div>
    </section>
  )
}

import {
  Bot,
  Book,
  CreditCard,
  GraduationCap,
  Home,
  Map,
  MapPin,
  Settings,
  User,
  Users,
} from 'lucide-react'

export type NavigationItem = {
  name: string
  href: string
  icon: typeof Home
}

export const navigationItems: NavigationItem[] = [
  { name: 'Painel', href: '/dashboard', icon: Home },
  { name: 'Chat com IA', href: '/ai-chat', icon: Bot },
  { name: 'Cobrança', href: '/billing', icon: CreditCard },
  { name: 'Discípulo', href: '/dashboard/discipulo', icon: User },
  { name: 'Líder', href: '/dashboard/lider', icon: Users },
  { name: 'Supervisor', href: '/dashboard/supervisor', icon: Map },
  { name: 'Pastor', href: '/dashboard/pastor', icon: Settings },
  { name: 'Células', href: '/celulas', icon: MapPin },
  { name: 'Trilha', href: '/trilha', icon: GraduationCap },
  { name: 'Bíblia', href: '/biblia/leitor', icon: Book },
]

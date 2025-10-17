"use client";

import { useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import { Copy, QrCode, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { site } from '@/lib/brand-config'
import { cn } from '@/lib/utils'

interface InvitationShareDialogProps {
  token: string
  convidado?: string | null
  className?: string
}

function buildInvitationUrl(token: string) {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    return `${origin.replace(/\/$/, '')}/convites/${token}`
  }
  return `${site.url.replace(/\/$/, '')}/convites/${token}`
}

export function InvitationShareDialog({ token, convidado, className }: InvitationShareDialogProps) {
  const [open, setOpen] = useState(false)
  const invitationUrl = useMemo(() => buildInvitationUrl(token), [token])
  const { toast } = useToast()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(invitationUrl)
      toast({
        title: 'Link copiado',
        description: 'Envie o convite por mensagem ou e-mail para o convidado.',
      })
    } catch (error) {
      console.error('Erro ao copiar URL do convite', error)
      toast({
        title: 'Não foi possível copiar',
        description: 'Copie manualmente o link exibido abaixo.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-1', className)}>
          <QrCode className="h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[min(480px,90vw)]">
        <DialogHeader>
          <DialogTitle>Compartilhar convite</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="rounded-lg border border-primary/30 bg-muted/40 p-4">
            <QRCode value={invitationUrl} size={192} />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Escaneie o QR code ou compartilhe o link direto{convidado ? ` com ${convidado}` : ''}.
          </p>
          <div className="flex w-full flex-col gap-2">
            <Input value={invitationUrl} readOnly className="w-full font-mono text-xs" />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleCopy} className="flex-1 gap-1">
                <Copy className="h-4 w-4" />
                Copiar link
              </Button>
              <Button asChild variant="secondary" className="flex-1 gap-1">
                <a href={invitationUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Abrir convite
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

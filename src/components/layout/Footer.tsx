import { Link } from 'react-router-dom'

import { Instagram, Mail, MessageCircle } from 'lucide-react'

import { useProducts } from '../../context/MarketplaceContext'

import Logo from './Logo'



export default function Footer() {

  const { settings } = useProducts()



  return (

    <footer className="border-t border-surface-600 bg-surface-800 text-gray-400">

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-8 md:grid-cols-4">

          <div className="md:col-span-2">

            <Logo name={settings.storeName} size="md" />

            <p className="mt-4 text-sm max-w-md leading-relaxed">

              {settings.storeDescription}

            </p>

            <div className="mt-4 flex gap-3">

              <a

                href={`https://wa.me/${settings.whatsapp}`}

                target="_blank"

                rel="noopener noreferrer"

                className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-700 text-gray-400 transition-colors hover:bg-green-600 hover:text-white"

              >

                <MessageCircle className="h-5 w-5" />

              </a>

              <a

                href={`mailto:${settings.email}`}

                className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-700 text-gray-400 transition-colors hover:bg-brand-600 hover:text-white"

              >

                <Mail className="h-5 w-5" />

              </a>

              <a

                href="#"

                className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-700 text-gray-400 transition-colors hover:bg-pink-600 hover:text-white"

              >

                <Instagram className="h-5 w-5" />

              </a>

            </div>

          </div>



          <div>

            <h4 className="font-semibold text-white mb-4">Links</h4>

            <ul className="space-y-2 text-sm">

              <li><Link to="/" className="hover:text-neon-cyan transition-colors">Início</Link></li>

              <li><Link to="/produtos" className="hover:text-neon-cyan transition-colors">Produtos</Link></li>

              <li><Link to="/cadastro?tipo=vendedor" className="hover:text-neon-cyan transition-colors">Vender no marketplace</Link></li>
              <li><Link to="/legal/termos" className="hover:text-neon-cyan transition-colors">Termos de Uso</Link></li>
              <li><Link to="/legal/privacidade" className="hover:text-neon-cyan transition-colors">Privacidade (LGPD)</Link></li>
              <li><Link to="/legal/contrato-comprador" className="hover:text-neon-cyan transition-colors">Contrato Comprador</Link></li>
              <li><Link to="/legal/contrato-vendedor" className="hover:text-neon-cyan transition-colors">Contrato Vendedor</Link></li>

            </ul>

          </div>



          <div>

            <h4 className="font-semibold text-white mb-4">Pagamento & Entrega</h4>

            <ul className="space-y-2 text-sm">

              <li>PIX com {settings.pixDiscountPercent}% de desconto</li>

              <li>Frete via Correios</li>

              <li>Entrega para todo Brasil</li>

              <li>Pagamento protegido em escrow</li>
              <li>Comissão plataforma: {settings.marginPercent}%</li>

            </ul>

          </div>

        </div>



        <div className="mt-10 border-t border-surface-600 pt-6 text-center text-sm text-gray-500">

          &copy; {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.

        </div>

      </div>

    </footer>

  )

}


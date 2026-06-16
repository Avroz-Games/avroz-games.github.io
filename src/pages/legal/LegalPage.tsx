import { useParams, Link } from 'react-router-dom'
import { LEGAL_DOCUMENTS } from '../../content/legalContent'

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-white mt-8 mb-3">{line.slice(3)}</h2>
    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-gray-200 mt-4">{line.replace(/\*\*/g, '')}</p>
    if (line.match(/^\d+\./)) return <p key={i} className="text-gray-400 ml-4 my-1">{line}</p>
    if (line.startsWith('  (')) return <p key={i} className="text-gray-500 ml-8 my-1">{line}</p>
    if (line.startsWith('- ')) return <li key={i} className="text-gray-400 ml-6 list-disc">{line.slice(2)}</li>
    if (line.trim() === '') return <br key={i} />
    return <p key={i} className="text-gray-400 my-2 leading-relaxed">{line}</p>
  })
}

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>()
  const doc = slug ? LEGAL_DOCUMENTS[slug] : null

  if (!doc) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-gray-400">Documento não encontrado</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Voltar</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/" className="text-sm text-gray-500 hover:text-neon-cyan">← Voltar à loja</Link>
      <h1 className="section-title mt-4 mb-2">{doc.title}</h1>
      <p className="text-sm text-gray-500 mb-8">Atualizado em {doc.updated}</p>
      <div className="card p-8 prose-invert">{renderMarkdown(doc.content)}</div>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {Object.keys(LEGAL_DOCUMENTS).map((key) => (
          <Link key={key} to={`/legal/${key}`} className={`px-3 py-1 rounded-lg border ${slug === key ? 'border-neon-cyan text-neon-cyan' : 'border-surface-600 text-gray-400 hover:text-white'}`}>
            {LEGAL_DOCUMENTS[key].title.split('—')[0].trim()}
          </Link>
        ))}
      </div>
    </div>
  )
}

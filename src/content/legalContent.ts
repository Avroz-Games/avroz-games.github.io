export const LEGAL_DOCUMENTS: Record<string, { title: string; updated: string; content: string }> = {
  termos: {
    title: 'Termos de Uso — Avroz Games Marketplace',
    updated: '15 de junho de 2026',
    content: `
## 1. Objeto
A Avroz Games LTDA ("Plataforma") opera um marketplace digital que intermedia vendas entre vendedores independentes ("Vendedores") e consumidores ("Compradores"), oferecendo ambiente de cadastro, vitrine, pagamento e logística.

## 2. Cadastro e elegibilidade
2.1. Compradores e Vendedores devem fornecer dados verdadeiros e manter suas informações atualizadas.
2.2. Vendedores passam por análise de aprovação antes de publicar produtos.
2.3. Menores de 18 anos devem utilizar a plataforma com supervisão de responsável legal.

## 3. Intermediação e comissão
3.1. A Plataforma retém **25% (vinte e cinco por cento)** sobre o valor de venda como remuneração pela intermediação, infraestrutura, suporte e gestão de pagamentos.
3.2. O preço exibido ao Comprador já inclui a margem da Plataforma.

## 4. Pagamento em escrow
4.1. Pagamentos são recebidos pela Plataforma e mantidos em **escrow** até confirmação de recebimento pelo Comprador ou liberação automática após o prazo configurado (padrão: 7 dias úteis após entrega).
4.2. Somente após a confirmação ou prazo de liberação o valor líquido é repassado ao Vendedor via PIX.

## 5. Responsabilidades
5.1. Vendedores são responsáveis pela veracidade das ofertas, qualidade, embalagem e envio.
5.2. A Plataforma não é proprietária dos produtos anunciados, salvo indicação expressa.
5.3. Disputas serão analisadas conforme política de mediação e contratos específicos.

## 6. Propriedade intelectual
É proibido utilizar marcas, imagens ou conteúdos de terceiros sem autorização.

## 7. Suspensão e encerramento
A Plataforma pode suspender contas por fraude, violação legal ou descumprimento destes Termos.

## 8. Foro
Fica eleito o foro da comarca de São Paulo/SP, salvo disposição legal em contrário para relações de consumo.

## 9. Contato
E-mail: contato@avrozgames.com.br
    `.trim(),
  },
  privacidade: {
    title: 'Política de Privacidade (LGPD)',
    updated: '15 de junho de 2026',
    content: `
## 1. Controlador
Avroz Games LTDA, CNPJ [inserir], e-mail: contato@avrozgames.com.br

## 2. Dados coletados
- Identificação: nome, e-mail, CPF/CNPJ, telefone
- Endereço de entrega e cobrança
- Dados de pagamento (processados por parceiros certificados PCI-DSS; não armazenamos dados completos de cartão)
- Histórico de pedidos, logs de acesso e IP

## 3. Finalidades
- Execução de contratos de compra e venda
- Intermediação, escrow e repasse financeiro
- Prevenção à fraude e segurança
- Cumprimento de obrigações legais
- Comunicações transacionais

## 4. Base legal (LGPD)
Art. 7º: execução de contrato, legítimo interesse (segurança), consentimento quando aplicável e cumprimento de obrigação legal.

## 5. Compartilhamento
Dados podem ser compartilhados com: gateway de pagamento, Correios/transportadoras, Supabase (hospedagem), autoridades quando exigido por lei.

## 6. Segurança
- Criptografia TLS em trânsito
- Row Level Security (RLS) no banco de dados
- Autenticação com senha forte e tokens JWT
- Acesso administrativo restrito e auditável

## 7. Direitos do titular
Confirmação, acesso, correção, anonimização, portabilidade, eliminação e revogação de consentimento via contato@avrozgames.com.br

## 8. Retenção
Dados mantidos pelo prazo necessário à operação e exigências fiscais (mínimo 5 anos para registros contábeis).

## 9. DPO
Encarregado: privacidade@avrozgames.com.br
    `.trim(),
  },
  'contrato-comprador': {
    title: 'Contrato de Intermediação — Comprador',
    updated: '15 de junho de 2026',
    content: `
## PARTES
**INTERMEDIADORA:** Avroz Games LTDA ("Plataforma")
**COMPRADOR:** Usuário cadastrado que realiza compras

## CLÁUSULA 1 — Natureza da relação
1.1. A Plataforma atua como **intermediadora tecnológica**, não sendo vendedora dos produtos, salvo indicação expressa.
1.2. O contrato de compra e venda do produto é celebrado entre Comprador e Vendedor; a Plataforma facilita pagamento, comunicação e resolução de conflitos.

## CLÁUSULA 2 — Pagamento e escrow
2.1. O Comprador paga o valor total (produtos + frete − descontos) à Plataforma.
2.2. Os valores ficam retidos em **escrow** até:
  (a) confirmação expressa de recebimento pelo Comprador; ou
  (b) decurso de 7 (sete) dias após registro de entrega, sem contestação formal.
2.3. Após liberação, a Plataforma repassa ao Vendedor o valor líquido (deduzida comissão de 25%).

## CLÁUSULA 3 — Entrega e conferência
3.1. O Comprador deve conferir o produto no prazo de 7 dias após recebimento.
3.2. Produtos divergentes ou avariados devem ser contestados via canal de suporte em até 7 dias, com evidências (fotos, vídeos).
3.3. A confirmação de recebimento implica aceite do produto nas condições entregues.

## CLÁUSULA 4 — Cancelamento e reembolso
4.1. Cancelamentos antes do envio: reembolso integral.
4.2. Após envio: conforme Código de Defesa do Consumidor (art. 49 — arrependimento em 7 dias para compras online, quando aplicável).
4.3. Reembolsos processados pelo mesmo meio de pagamento, em até 10 dias úteis.

## CLÁUSULA 5 — Limitação de responsabilidade da Plataforma
5.1. A Plataforma não responde por vícios ocultos, atrasos de transportadora ou informações incorretas fornecidas pelo Vendedor, sem prejuízo da mediação e retenção de valores em disputa.
5.2. Responsabilidade da Plataforma limitada ao valor da transação intermediada.

## CLÁUSULA 6 — Aceite
O cadastro e/ou conclusão de compra implicam aceite integral deste contrato.

**Avroz Games LTDA** — Documento gerado eletronicamente com validade probatória (MP 2.200-2/2001).
    `.trim(),
  },
  'contrato-vendedor': {
    title: 'Contrato de Intermediação — Vendedor',
    updated: '15 de junho de 2026',
    content: `
## PARTES
**INTERMEDIADORA:** Avroz Games LTDA ("Plataforma")
**VENDEDOR:** Pessoa física ou jurídica cadastrada e aprovada

## CLÁUSULA 1 — Objeto
1.1. O Vendedor autoriza a Plataforma a exibir, promover e intermediar a venda de seus produtos.
1.2. A Plataforma cobra **comissão de 25%** sobre o preço de venda ao consumidor final.

## CLÁUSULA 2 — Cadastro e aprovação
2.1. O Vendedor declara veracidade de CPF/CNPJ, dados bancários/PIX e titularidade dos produtos.
2.2. A Plataforma pode recusar, suspender ou encerrar cadastros a seu critério, com comunicação motivada quando aplicável.

## CLÁUSULA 3 — Obrigações do Vendedor
3.1. Manter estoque, descrições e preços atualizados.
3.2. Enviar produtos em até 3 dias úteis após confirmação de pagamento.
3.3. Utilizar embalagem adequada e informar código de rastreio.
3.4. Cumprir legislação consumerista, tributária e de propriedade intelectual.
3.5. Emitir documento fiscal quando obrigado por lei.

## CLÁUSULA 4 — Repasse financeiro (escrow)
4.1. Pagamentos ficam retidos até confirmação do Comprador ou liberação automática (7 dias após entrega).
4.2. Repasse via PIX para chave cadastrada, descontada a comissão de 25%.
4.3. Valores retidos em disputa até resolução.

## CLÁUSULA 5 — Chargeback e fraude
5.1. O Vendedor responde por chargebacks decorrentes de produto não enviado, divergente ou fraudulento.
5.2. A Plataforma pode compensar débitos futuros ou suspender repasses.

## CLÁUSULA 6 — Propriedade e conteúdo
6.1. O Vendedor concede licença não exclusiva para exibição de imagens e descrições na Plataforma.
6.2. Produtos proibidos: ilegais, falsificados, sem certificação ou que violem políticas da Plataforma.

## CLÁUSULA 7 — Rescisão
Qualquer parte pode encerrar mediante aviso; pedidos em andamento serão concluídos conforme escrow.

## CLÁUSULA 8 — Foro
Comarca de São Paulo/SP.

## CLÁUSULA 9 — Aceite eletrônico
O cadastro como vendedor e a marcação do aceite do contrato constituem manifestação válida de vontade.

**Avroz Games LTDA** — CNPJ [inserir] — contato@avrozgames.com.br
    `.trim(),
  },
}

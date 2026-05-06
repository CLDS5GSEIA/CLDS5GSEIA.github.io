# Gestor de Ofertas de Emprego — CLDS 5G Seia — Protótipo inicial

Protótipo navegável em HTML/CSS/JavaScript da aplicação para gerir ofertas de emprego do CLDS 5G [Des]Envolver Seia.

## O que já faz
- Regista ofertas de emprego.
- Valida campos mínimos.
- Separa estado: pendente, ativa e verificável, excluída.
- Gera pré-visualização de publicação Facebook resumida.
- Gera pré-visualização de ficha PDF A4 detalhada.
- Usa localStorage do navegador para guardar dados localmente.
- Permite imprimir/guardar em PDF através do browser.

## Próxima fase
- Backend com login.
- Base de dados central.
- Conetores para IEFP, Net-Empregos, Randstad, SAPO Emprego e outros.
- Exportação real para PNG/JPG e PDF sem depender do print do browser.
- Gestão de utilizadores e permissões.

- Campo de Técnico/a responsável: Gonçalo Pimentel, Rita Saúde, Sara Dias, Maria Silva ou escrita manual.
- PDF preferencialmente em 1 página A4 e, em casos extensos, no máximo 2 páginas.

## Regras de exportação atualizadas
- Publicação Facebook = PNG.
- Ficha detalhada = PDF A4.
- PDF preferencialmente em 1 página; máximo 2 páginas.
- Pontos/listas começam com maiúscula.
- Página inicial apresenta o nome completo: CLDS 5G [Des]Envolver Seia.
- Contacto institucional integrado:
  CLDS 5G [Des]Envolver Seia, Edifício Elo Comum, Avenida 1º de Maio, nº 75, 6270-479 Seia, Tlf: +351 238 310 230, E-mail: clds5g@cm-seia.pt.


## v11 — PDF A4 bloqueado

Nesta versão foi corrigido apenas o módulo de geração PDF A4 para seguir o modelo aprovado pelo CLDS. Este bloco deve ficar congelado e não deve ser alterado sem pedido expresso.


## v12 — Afinação visual do PDF

Foram afinados tipografia, espaçamentos e rodapé do PDF para evitar sobreposição de texto e manter o visual mais consistente. Continuou-se a mexer apenas no módulo PDF.


## v13 — Correção do organizador copy/paste

Corrigido o parser para preencher a Entidade quando a oferta vem no formato: Ref → Área → Entidade. O módulo PDF A4 não foi alterado.


## v14 — Correção botões + afinação IEFP

Corrigido erro de JavaScript que impedia os botões de funcionar. Foi também iniciado parser específico para textos IEFP: ID da oferta, localidade, requisitos, condições, remuneração e contacto IEFP. O módulo visual do PDF não foi alterado.


## v15 — Afinação IEFP: vagas e nota final

Nas ofertas IEFP, a Área passa a ser “IEFP / Oferta pública de emprego”, o número de vagas passa a campo próprio no PDF e a nota final foi substituída pela formulação aprovada: “Oferta disponível no IEFP Online. Para apoio à candidatura, recomenda-se contacto com o IEFP da sua área de residência.”


## v16 — Entidade Net-Empregos

Afinado o organizador copy/paste para apanhar automaticamente a Entidade nas ofertas Net-Empregos quando o texto vem no formato Ref → Área → Entidade. O visual do PDF não foi alterado.


## v17 — Área e Entidade Net-Empregos

Corrigido o organizador copy/paste para limpar o símbolo de bullet usado pelo Net-Empregos e preencher automaticamente Área e Entidade no padrão: Ref → Área → Entidade. O getFormData passou a preservar area/vagas ao editar a oferta. O visual do PDF não foi alterado.


## v18 — Correção de secções Net-Empregos

Corrigido o parser para distinguir cabeçalhos exatos: Detalhe da Oferta deixa de ser interpretado como Condições; Funções vai para responsabilidades; Requisitos vai para perfil; Oferecemos/Condições vai para condições. O visual do PDF não foi alterado.


## v20 — Organizador Net-Empregos refeito

Retomada a v18 como base. Refeita apenas a função parseRawOffer para organizar melhor textos Net-Empregos copiados/colados, incluindo Perfil pretendido, Principais responsabilidades, Oferecemos, Área e Entidade. O visual do PDF não foi alterado.


## v21 — Perfil pretendido IEFP

Corrigido o parser IEFP para colocar “Descrição do Perfil” no bloco Perfil pretendido. Também passou a ler melhor campos no formato Label:Valor, por exemplo Habilitações Mínimas:4.º ano e Tipo de contrato:Termo certo. O visual do PDF não foi alterado.


## v22 — Módulo Facebook/PNG

Ativado o módulo Facebook a partir das ofertas já gravadas. A publicação é resumida, com contacto CLDS, Eixo 1 e barra de cofinanciamento. O botão Exportar PNG foi implementado. O módulo PDF não foi alterado.


## v24 — Facebook PNG

Corrigida a sobreposição do rodapé na versão Facebook, mantendo a barra de cofinanciamento no tamanho original. Reforçada a exportação PNG com incorporação de estilos e imagens no momento da exportação.


## v25 — Exportação Facebook reforçada

Mantido o tamanho da barra de cofinanciamento. Ajustado o rodapé Facebook para evitar sobreposição. A exportação tenta PNG e, se o navegador bloquear o PNG, gera automaticamente um SVG como alternativa.


## v27 — Exportação PNG por canvas

O botão Facebook/PNG passa a exportar a imagem por desenho direto em canvas, com logótipos incorporados na app. Isto evita o bloqueio do método anterior e deve funcionar mesmo em modo file://. O preview mantém-se visualmente na app.


## v28 — Correção exportação PNG

Corrigida função em falta safeOfferFilename(), que fazia a exportação PNG falhar na v27. A mensagem de erro passa também a mostrar o motivo técnico caso volte a falhar.


## v29 — Limpeza da interface

Removido o botão “Repor dados de teste”, mantendo o PDF como está. Próximo foco: fechar definitivamente a exportação PNG.


## v30 — Estados e eliminação

Removido definitivamente o botão “Repor dados de teste”. O botão “Excluir” foi substituído por “Marcar como inativa”, mantendo a oferta no histórico. Foi acrescentado “Eliminar definitivamente” para apagar ofertas criadas por erro, duplicadas ou testes. O PDF e o PNG não foram alterados.


## v31 — Correção estado inativa

Corrigido o estado Inativa no formulário. O botão “Marcar como inativa” passa a guardar data de inativação e a oferta fica no histórico. O painel passa a contabilizar Inativas. Na lista, ofertas inativas mostram mês/ano de inativação.


## v32 — Histórico e filtros

Melhorada a lista/histórico com filtros por estado, fonte, localidade, mês de consulta, mês de inativação e exportação. Acrescentadas colunas Entidade, Referência/ID, Datas e Exportações. Regista datas de exportação PDF/Facebook, data de validação e motivo/data de inativação. Preparados campos internos para futuro modo técnico.


## v33 — Botão Pesquisar / Aplicar filtros

Na Base de ofertas foi acrescentado o botão “Pesquisar / Aplicar filtros”. A pesquisa interna passa a ser aplicada explicitamente pelo botão, mantendo “Limpar filtros” para voltar à lista completa. A tecla Enter no campo de pesquisa livre também aplica os filtros.


## v34 — Correção dos filtros do histórico

Corrigida a aplicação dos filtros na Base de ofertas. O botão “Pesquisar / Aplicar filtros” passa a filtrar corretamente a tabela. A pesquisa é indiferente a maiúsculas/minúsculas e também ignora acentos.


## v35 — Botões dos filtros corrigidos

Corrigido o comportamento dos botões na Base de ofertas: “Pesquisar / Aplicar filtros” atualiza imediatamente a listagem e “Limpar filtros” limpa todos os campos e repõe a lista completa automaticamente.


## v36 — Correção dos assets nas novas ofertas

Reforçado o carregamento do logótipo CLDS, ícone do Eixo 1 e barra de cofinanciamento. As imagens passam a ser também incorporadas em base64 para evitar falhas de caminho em novas ofertas, previews, PDF e PNG.


## v37 — Pesquisa: limpeza de protótipo

Removido o texto “Protótipo...”. O botão “Simular pesquisa” passou a “Pesquisar”. A área de pesquisa fica preparada para ligação posterior a conetores/API/backend autorizado.

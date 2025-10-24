1- Quem pode se cadastrar?

O usuário vê 4 cards mostrando os 4 tipos de usuários e clica em quem ele é, podemos seguir abas de cadastro após usuário clicar em cadastrar na landpage.

Pastor - Pode cadastrar sua igreja (Confirmação pelo administrador do sistema- super admin), podemos ter um formulário com Nome do Pastor Presidente, e-mail da igreja, whatsapp do pastor, responsável técnico, whatsapp do responsável técnico, ou marcar se é o próprio pastor, e botão Solicitar Cadastro da Igreja, esse formulário cria uma solicitação do super admin que prossegue o processo de cadastro da igreja.

Supervisor é a pessoa que lidera mais de uma célula, ele lidera lideres e não células, ainda que ele mesmo possa liderar uma célula e ter outro líder de célula abaixo de sua supervisão. Esse usuário primeiro procura sua igreja no campo de busca, se achar já pode cadastrar primeiro sua célula, se nao achar a igreja, o sistema pergunta se ele deseja cadastrar sua célula sem uma igreja e futuramente quando a igreja dele se cadastrar ele pode associar a celula naquela igreja. O supervisor cadastrar a celula como se fosse um lider de celula, e recebe o acesso supervisor apenas quando ele cadastrar nova célula(multiplica) a partir da primeira celula dele. O supervisor nao vê todas as células com a mesma visao do lider de celula, ele gerencia lideres de celula, tem informações no dashboard de todas as células abaixo dele e outras métricas importantes. O Padrão do supervisor é ver apenas a gestão dos lideres que estão abaixo dele e metricas de sua organização abaixo, mas ele também pode lider uma celula, então ele pode ter um menu MINHA CELULA e ver exatamente o que o lider de celula ver no seu dashboard;

Líder de celula - Esse usuário primeiro procura sua igreja no campo de busca, se achar já pode cadastrar primeiro sua célula, se nao achar a igreja, o sistema pergunta se ele deseja cadastrar sua célula sem uma igreja e futuramente quando a igreja dele se cadastrar ele pode associar a celula naquela igreja.


Usuario comum - Esse precisa procurar sua celula para solicitar acesso à celula, ele precisa colocar o nome completo do lider, se o sistema nao achar, abre um campo para ele copiar e enviar pelo WhatsApp do lider de celula falando do sistema com o link de cadastro para o lider cadastrar no sistema.


PAPEIS NO SISTEMA

1- Super admin
gestão de usuários(pastores, lideres de célula ou supervisor que se cadastrem na plataforma)
- podemos tirar essa questão de créditos, custos por feature, ele nao tem todas as funcionalidades dos outros perfis.
-O super admin ver todas as igrejas, ele faz gestão das igrejas;
-Configura e gere a landing-page;

2- Pastor
- Nao vê todas as igrejas, se o pastor tiver uma rede de igrejas, vamos implementar isso depois. Mas o padrão é que ele veja apenas sua própria igreja;
- Ele nao tem a metrica total de igrejas;
- Ele nao faz configuração da landing page.
- Ele nao remove igrejas, apenas a sua propria igreja, ele pode solicitar a exclusão para o super admin;
- Ele enxerga sua árvore genealogia ministerial no formado de mapa mental;
- Qualquer membro da igreja pode ser marcado pelo pastor como alguem da sua equipe principal, e integrar um dos campos da equipe principal do pastor presidente.

3- Supervisor- É o lider de celula que já multiplicou celula;


4- Lider de Celula
- Gere sua própria célula;
- Se multiplicar, automaticamente recebe o perfil de supervisor;
- Se continuar liderando uma célula e tiver pelo menos um outro líder abaixo ele é um supervisor que lidera celula;


5- Discipulo

6- Usuario Autenticado sem perfil
- nao pode existir, automaticamente deve ser direcionado para pagina de escolha de perfil no complemento de cadastro;
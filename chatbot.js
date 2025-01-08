const puppeteer = require('puppeteer-core');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Armazenando as opções e respostas
let options = {};

// Configuração do WhatsApp Web
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable', // Caminho para o navegador
        args: [
            '--no-sandbox', // Desativa o sandbox
            '--disable-setuid-sandbox', // Desativa o setuid sandbox
        ],
    },
});

// Função para baixar o arquivo
async function downloadFile(url, filePath) {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Função para simular digitação
async function simulateTyping(chat, duration) {
    await chat.sendStateTyping();
    return new Promise(resolve => setTimeout(resolve, duration));
}

// Gerar o QR Code para autenticação
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR Code acima!');
});

// Após a conexão bem-sucedida
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

// Lidar com as mensagens recebidas no WhatsApp
client.on('message', async (message) => {
    console.log('Mensagem recebida:', message.body);

    const chat = await message.getChat();

    // Opções para interagir com o menu principal
    if (message.body.match(/(menu|Menu|oi|Oi|Olá|olá|ola|Ola|interessado)/i)) {
        await simulateTyping(chat, 2000);
        const contact = await message.getContact();
        const name = contact.pushname || 'Amigo';
        await client.sendMessage(
            message.from,
            `Olá, ${name.split(' ')[0]}! Sou o assistente virtual da Hyper. Escolha uma das opções abaixo digitando o número correspondente:\n\n` +
            '1 - Como Funciona\n' +
            '2 - Valores dos Planos\n' +
            '3 - Fazer teste no Android\n' +
            '4 - Fazer teste no iPhone\n' +
            '5 - Como Aderir\n' +
            '6 - Quero me tornar um Revendedor\n' +
            '7 - Tabela de Valores para Revenda\n' +
            '8 - Termos de Uso\n' +
            '9 - Falar com um Atendente\n'
        );
        return;
    }

    // Responder às opções do menu
    switch (message.body) {
        case '1':
            await simulateTyping(chat, 3000);
            await message.reply(
                'Oferecemos internet ilimitada por meio de nosso aplicativo. É simples: baixe, faça login com as credenciais fornecidas e conecte. Enquanto estiver conectado ao app, você terá acesso à internet ilimitada!'
            );
            break;
        case '2':
            await simulateTyping(chat, 2500);
            await client.sendMessage(message.from, options['Valores dos planos']);
            break;
        case '3':
            await simulateTyping(chat, 3600);
            await client.sendMessage(
                message.from,
                'Por favor, *INSTALE* este aplicativo: https://play.google.com/store/apps/details?id=com.hypernet23.pro e abra-o com o Wi-Fi ligado.'
            );
            await simulateTyping(chat, 2100);
            await client.sendMessage(
                message.from,
                '👤 Usuário: 4000\n🔑 Senha: 4000\n📲 Limite: 1\n🗓️ Expira em: 24 horas\n🌍 Instruções: Use o Wi-Fi ao abrir o app, depois ative os dados móveis. Escolha a operadora e clique em conectar.'
            );
            await simulateTyping(chat, 3150);
            
            // Agora, o vídeo será baixado e enviado diretamente
            const videoLink = 'https://drive.google.com/uc?export=download&id=1B30tef3Ic9lImJy6J_EadmjwlhOUcJcd';
            const videoFilePath = path.join(__dirname, 'tutorial_video.mp4'); // Caminho para salvar o vídeo

            await downloadFile(videoLink, videoFilePath); // Baixar o vídeo

            // Enviar o vídeo para a conversa
            const media = MessageMedia.fromFilePath(videoFilePath); // Criar o objeto de mídia
            await client.sendMessage(message.from, media, { caption: 'Video ensinando como conectar no aplicativo!' });

            break;
        case '4':
            await simulateTyping(chat, 3000);
            await client.sendMessage(
                message.from,
                'Por favor, *BAIXE* este aplicativo: https://apps.apple.com/app/napsternetv/id1629465476.'
            );
            await simulateTyping(chat, 3500); // Pausa antes de enviar a próxima mensagem
            await client.sendMessage(
                message.from,
                'Em qual operadora você gostaria de testar? Para testar, digite *vivo iphone* ou *tim iphone*, de acordo com a sua operadora.'
            );

            // Aguardar a resposta do cliente
            client.on('message', async (response) => {
                const userReply = response.body.toLowerCase();

                // Caso o usuário mencione "vivo iphone"
                if (userReply.includes('vivo') && userReply.includes('iphone')) {
                    await simulateTyping(chat, 2000);

                    // Links para os arquivos no Google Drive
                    const vivoFileLink = 'https://drive.google.com/uc?export=download&id=1vB5mAaC8jz9PJqo_EMBesmKIIUawMmWE';
                    const vivoFilePath = path.join(__dirname, 'vivotestepraiphone.inpv'); // Caminho para salvar o arquivo com extensão .inpv

                    await downloadFile(vivoFileLink, vivoFilePath); // Baixar arquivo do link

                    const media = MessageMedia.fromFilePath(vivoFilePath);
                    await client.sendMessage(response.from, media, { caption: 'Arquivo de configuração para Vivo no iPhone' });

                    await simulateTyping(chat, 3000); // Simula pausa antes de enviar
                    await client.sendMessage(
                        response.from,
                        `Aqui está o vídeo tutorial para conectar na Vivo no iPhone!`
                    );
                    
                    // Baixar e enviar o vídeo da Vivo diretamente
                    const vivoVideoLink = 'https://drive.google.com/uc?export=download&id=1w8Wlt_lcs0gCm845ZsJiYWxjw58MZh-F';
                    const vivoVideoPath = path.join(__dirname, 'vivo_tutorial_video.mp4');
                    await client.sendMessage(response.from, vivoMedia, { caption: 'Aqui está o vídeo tutorial para conectar na Vivo no iPhone!' });

                } else if (userReply.includes('tim') && userReply.includes('iphone')) {
                    await simulateTyping(chat, 3000);

                    try {
                        // Links para os arquivos no Google Drive
                        const timFileLink = 'https://drive.google.com/uc?export=download&id=1oLrl7PMJ4CfCirOB_vZ06UIkgiJAdbL1';
                        const timFilePath = path.join(__dirname, 'timtestepraiphone.inpv'); // Caminho para salvar o arquivo .inpv

                        // Baixar e enviar o arquivo de configuração
                        await downloadFile(timFileLink, timFilePath);
                        const media = MessageMedia.fromFilePath(timFilePath);
                        await client.sendMessage(response.from, media, { caption: 'Arquivo de configuração para TIM no iPhone' });

                        // Link para o vídeo tutorial
                        const timVideoLink = 'https://drive.google.com/uc?export=download&id=1w8Wlt_lcs0gCm845ZsJiYWxjw58MZh-F';
                        const timVideoPath = path.join(__dirname, 'tim_tutorial_video.mp4'); // Caminho para salvar o vídeo

                        // Baixar e enviar o vídeo tutorial
                        await downloadFile(timVideoLink, timVideoPath);
                        const timMedia = MessageMedia.fromFilePath(timVideoPath);
                        await client.sendMessage(response.from, timMedia, { caption: 'Aqui está o vídeo tutorial para conectar na TIM no iPhone!' });
                    } catch (error) {
                        console.error('Erro ao enviar arquivo ou vídeo para TIM:', error);
                    }
                    break;
                    case '5':
                        await simulateTyping(chat, 2000);
                        await client.sendMessage(
                            message.from,
                            'Para aderir, basta escolher um dos nossos planos, efetuar o pagamento e enviar o comprovante. Nossa chave PIX é a seguinte:\n\n' +
                            'Chave PIX Nubank: speednetservicec@gmail.com\n' +
                            'Nome: Julio Cezar\n\n' +
                            'Por favor, envie o comprovante para que possamos liberar seu acesso.'
                        );
                        break;
                        case '6':
                            await simulateTyping(chat, 2000);
                            await message.reply(
                                'Para se tornar nosso revendedor, é bem simples. Temos revenda disponível para Android e uma revenda híbrida para Android e iPhone. Basta escolher uma das opções e a quantidade de crédito/acesso que você deseja adquirir. Para consultar os valores para revendedores, digite o número 7.'
                            );
                            break;
                        case '7':
                            await simulateTyping(chat, 3000);
                            await message.reply(
                                '📲 SPEEDNET - SOLUÇÕES EM VPN 📡\n\n' +
                                '*INFORMAÇÕES PARA NOVOS CLIENTES*\n' +
                                'Quer revender nossos serviços? Escolha seu plano de revendedor logo abaixo:\n\n' +
                                '🚀 PLANOS PARA REVENDER APENAS PARA *ANDROID* 🚀\n' +
                                '*Operadoras disponíveis:*\n' +
                                '- *im ✅\n' +
                                '- VIVO (funcionando normalmente). ✅\n\n' +
                                '*Preços por quantidade de créditos no painel (sem acesso ao servidor iPhone):*\n' +
                                '- *10 a 49 créditos/unidades*: R$ *,00 cada\n' +
                                '- *50 a 99 créditos/unidades*: R$ 3,00 cada\n' +
                                '- *100 a 299 créditos/unidades*: R$ 2,50 cada\n' +
                                '- *300 a 499 créditos/unidades*: R$ 2,00 cada\n' +
                                '- *500 ou mais créditos/unidades*: R$ 1,50 cada\n\n' +
                                '➡️ *Obs:* Ao comprar em maior quantidade, o valor de cada crédito fica mais barato. Por exemplo: adquirindo acima de 49 créditos, cada um sai por R$ 3,00; comprando acima de 99 créditos, o valor reduz para R$ 2,50 cada, e assim por diante.\n\n' +
                                '*📆 Pagamento mensal obrigatório*\n\n' +
                                '---\n\n' +
                                '🚀 PLANOS PARA *IPHONE + ANDROID* 🚀\n' +
                                '**Operadoras disponíveis:**\n' +
                                '- Tim ✅\n' +
                                '- VIVO (funcionando normalmente). ✅\n\n' +
                                '*Preços por quantidade de créditos no painel (com acesso ao servidor iPhone):*\n' +
                                '- *10 a 49 créditos*: R$ 4,50 cada\n' +
                                '- *50 a 99 créditos*: R$ 3,50 cada\n' +
                                '- *100 a 299 créditos*: R$ 3,00 cada\n' +
                                '- *300 a 499 créditos*: R$ 2,00 cada\n' +
                                '- *500 ou mais créditos*: R$ 1,50 cada\n\n' +
                                '➡️ *Obs:* Ao comprar em maior quantidade, o valor de cada crédito fica mais barato. Por exemplo: adquirindo acima de 49 créditos, cada um sai por R$ 3,50; comprando acima de 99 créditos, o valor reduz para R$ 3,00 cada, e assim por diante.\n\n' +
                                '*📆 Pagamento mensal obrigatório*\n\n' +
                                '---\n\n' +
                                'COMO ADQUIRIR SEU PLANO:\n' +
                                '1. Escolha seu plano Android ou iPhone.\n' +
                                '2. Realize o pagamento via:\n' +
                                '   - *🏦 Banco:* Nubank\n' +
                                '   - *💠 PIX:* speednetservicec@gmail.com\n' +
                                '3. Envie o comprovante de pagamento.\n\n' +
                                '*📥 Liberação imediata do painel após envio do comprovante.*\n\n' +
                                '---\n\n' +
                                '*SUPORTE:*\n' +
                                '- Acesse nossos grupos no WhatsApp para suporte e atendimento exclusivo para clientes.\n\n' +
                                '*MATERIAL PARA DIVULGAÇÃO:*\n' +
                                '- Após adquirir a revenda, fornecemos banners e vídeos exclusivos para facilitar sua divulgação e atrair mais clientes.\n\n' +
                                '---\n\n' +
                                '*✅ Garantimos a qualidade do serviço.*\n' +
                                '*❌ Não realizamos devolução do valor investido.*\n\n' +
                                'Seja bem-vindo(a) ao *SpeedNet - Soluções em VPN!* ✌️'
                            );
                            break;
                        case '8':
                            await simulateTyping(chat, 3500);
                            await client.sendMessage(
                                message.from,
                                '*TERMOS DE USO – HYPER NET*\n\n' +
                                'Bem-vindo à *HYPER NET*, fornecedora de internet via aplicativos VPN. Ao utilizar nossos serviços, você concorda integralmente com os termos e condições descritos abaixo. Leia atentamente para evitar dúvidas ou desentendimentos futuros.\n\n' +
                                '---\n\n' +
                                '⚠️ *SOBRE O SERVIÇO* ⚠️\n' +
                                'A *HYPER NET* oferece conexão à internet utilizando VPN, que funciona de forma diferente das conexões Wi-Fi tradicionais. É possível acessar jogos, realizar ligações via WhatsApp e usar serviços de streaming, mas *não garantimos uma experiência idêntica à de uma conexão Wi-Fi*.\n\n' +
                                'Se você precisa de:\n' +
                                '- *Ping abaixo de 100ms para jogos online*;\n' +
                                '- *Streaming em qualidade 4K sem interrupções*;\n' +
                                '- *Downloads de arquivos grandes via torrent*;\n\n' +
                                '*Recomendamos contratar um serviço de Wi-Fi de um provedor local.* Essa informação deve ser repassada aos clientes antes da compra para evitar frustrações e mal-entendidos.\n\n' +
                                '---\n\n' +
                                '⭐ *SUPORTE* ⭐\n' +
                                '1. *Treinamento e Instruções:* Ajudamos a configurar os aplicativos e o painel do revendedor. Caso o serviço apresente problemas, entre em contato para análise.\n' +
                                '2. *Limitações:*\n' +
                                '   - Problemas de lentidão, manutenção na rede, ou bloqueios da operadora não estão sob nossa responsabilidade.\n' +
                                '   - Se houver instabilidade na rede da operadora, nossa equipe orientará sobre possíveis soluções, mas *não podemos garantir suporte em questões externas à VPN.*\n' +
                                '3. *Responsabilidade do Revendedor:*\n' +
                                '   - Revendedores precisam compreender e solucionar problemas comuns. Caso a solução já tenha sido ensinada previamente, não responderemos questões repetidas.\n' +
                                '   - *Leitura obrigatória do grupo de avisos:* Todas as atualizações são publicadas no grupo. Questões já esclarecidas lá não serão respondidas novamente.\n\n' +
                                '⚠️ *Respeite a ordem de atendimento.* Flood de mensagens ou chamadas repetidas atrasam o suporte.\n\n' +
                                '---\n\n' +
                                '⭐ *GARANTIAS* ⭐\n' +
                                '1. O serviço contratado é válido por 30 dias. Caso o método de conexão seja bloqueado pela operadora antes desse prazo, os dias perdidos serão repostos sem custo adicional.\n' +
                                '2. *Importante:* Bloqueios da operadora podem ocorrer em determinadas regiões ou estados, afetando todos os usuários. Esse tipo de interrupção está fora do nosso controle.\n\n' +
                                '---\n\n' +
                                '⭐ *REEMBOLSO* ⭐\n' +
                                '- Oferecemos *testes gratuitos* antes da compra para uso pessoal ou revenda.\n' +
                                '- Por se tratar de um produto digital, não realizamos reembolsos totais ou parciais após a compra.\n\n' +
                                '---\n\n' +
                                '⭐ *REGRAS DE USO* ⭐\n\n' +
                                '1. *Dispositivos Limitados:* Respeite o limite contratado. O uso indevido em múltiplos dispositivos pode acarretar suspensão do serviço.\n' +
                                '2. *Proibição de Torrents e P2P:* O uso desses serviços sobrecarrega os servidores e prejudica todos os usuários.\n' +
                                '3. *Atividades Ilícitas:* É proibido utilizar o serviço para ataques DDoS, carding ou qualquer crime cibernético.\n' +
                                '4. *Citação de Outros Serviços:* É proibido divulgar concorrentes em grupos ou contatar outros revendedores para vendas não autorizadas.\n' +
                                '5. *Vendas Não Autorizadas:* A comercialização de produtos não relacionados, como IPTV, em nossos grupos ou privados, é terminantemente proibida.\n\n' +
                                '⚠️ *Penalidades:* O descumprimento de qualquer regra resultará no cancelamento do acesso sem aviso prévio, reembolso ou reativação da conta.\n\n' +
                                '---\n\n' +
                                '*ATENÇÃO, REVENDEDORES*\n\n' +
                                '1. *Logins acima de 30 dias não são permitidos sem autorização prévia.* Logins longos sobrecarregam os servidores. A detecção de logins irregulares resultará na exclusão automática do acesso.\n' +
                                '2. *Seja proativo:* Leia os avisos no grupo e evite dependência excessiva do suporte. Quanto mais informado você estiver, mais rápido conseguirá atender seus clientes.\n\n' +
                                '---\n\n' +
                                'Agradecemos por confiar na *HYPER NET*! Juntos, garantimos a melhor experiência possível dentro das limitações do serviço. Para dúvidas adicionais, entre em contato. 🚀'
                            );
                            break;
                            case '9':
                                await simulateTyping(chat, 2000);
                                await message.reply(
                                    'Por favor, aguarde um momento. Estamos encaminhando a resposta para você! 😎'
                                );
                                break;
                            // Outras condições podem ser adicionadas aqui...
                            default:
                                break;
                        }
                        
                        // Inicializar o cliente WhatsApp
                        client.initialize();          

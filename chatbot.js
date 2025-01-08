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
            '1 - Como funciona\n' +
            '2 - Valores dos planos\n' +
            '3 - Fazer teste no Android\n' +
            '4 - Fazer teste no iPhone\n' +
            '5 - Como aderir\n' +
            '6 - Outras perguntas\n' +
            '7 - Receber imagem informativa\n' +
            '8 - Baixar e enviar vídeo informativo'
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
            await simulateTyping(chat, 2100);

            // Agora, o vídeo será baixado e enviado diretamente
            const videoLink = 'https://drive.google.com/uc?export=download&id=1B30tef3Ic9lImJy6J_EadmjwlhOUcJcd';
            const videoFilePath = path.join(__dirname, 'tutorial_video.mp4'); // Caminho para salvar o vídeo

            await downloadFile(videoLink, videoFilePath); // Baixar o vídeo

            // Enviar o vídeo para a conversa
            const media = MessageMedia.fromFilePath(videoFilePath); // Criar o objeto de mídia
            await client.sendMessage(message.from, media, { caption: 'Vídeo ensinando como conectar no aplicativo!' });

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

                    await downloadFile(vivoVideoLink, vivoVideoPath);
                    const vivoMedia = MessageMedia.fromFilePath(vivoVideoPath);
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
                    } catch (err) {
                        console.error('Erro ao processar o arquivo ou vídeo:', err);
                    }
                }
            });
            break;
        case '5':
            await simulateTyping(chat, 2000);
            await client.sendMessage(
                message.from,
                'Para aderir, basta acessar nosso site oficial ou entrar em contato pelo WhatsApp para escolher o plano ideal para você.'
            );
            break;
        case '6':
            await simulateTyping(chat, 2000);
            await message.reply('Envie sua pergunta! Estamos aqui para ajudar.');
            break;
        case '7':
            await simulateTyping(chat, 2000);
            const imagePath = './imagemInformativa.png'; // Substitua pelo caminho da imagem
            if (fs.existsSync(imagePath)) {
                const media = MessageMedia.fromFilePath(imagePath);
                await client.sendMessage(message.from, media, { caption: 'Aqui está a imagem informativa!' });
            } else {
                await message.reply('Desculpe, a imagem informativa não foi encontrada.');
            }
            break;
        case '8':
            await simulateTyping(chat, 2000);
            const videoPath = './videoInformativo.mp4'; // Substitua pelo caminho do vídeo
            if (fs.existsSync(videoPath)) {
                const media = MessageMedia.fromFilePath(videoPath);
                await client.sendMessage(message.from, media, { caption: 'Aqui está o vídeo informativo!' });
            } else {
                await message.reply('Desculpe, o vídeo informativo não foi encontrado.');
            }
            break;
    }
});

// Inicializar cliente WhatsApp
client.initialize();

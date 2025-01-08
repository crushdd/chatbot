const puppeteer = require('puppeteer-core');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Configuração de opções e respostas do chatbot
let options = {};

// Configuração do WhatsApp Web
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable', // Caminho para o navegador
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
        ],
    },
});

// Função para baixar arquivos
async function downloadFile(url, filePath) {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
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

// Lidar com as mensagens recebidas
client.on('message', async (message) => {
    console.log('Mensagem recebida:', message.body);
    const chat = await message.getChat();
    const contact = await message.getContact();
    const name = contact.pushname || 'Amigo';

    // Opções do menu inicial
    if (message.body.match(/(menu|Menu|oi|Oi|Olá|olá|ola|Ola|interessado)/i)) {
        await handleMenuMessage(chat, name, message);
        return;
    }

    // Respostas específicas do menu
    switch (message.body) {
        case '1': await sendHowItWorksMessage(chat, message); break;
        case '2': await sendPlanPrices(chat, message); break;
        case '3': await sendAndroidTestInfo(chat, message); break;
        case '4': await sendIphoneTestInfo(chat, message); break;
        case '5': await sendJoinInstructions(chat, message); break;
        case '6': await sendResellerInfo(chat, message); break;
        case '7': await sendResellerPricing(chat, message); break;
        case '8': await sendTermsOfService(chat, message); break;
        case '9': await sendSupportInfo(chat, message); break;
    }
});

// Função para responder ao menu
async function handleMenuMessage(chat, name, message) {
    await simulateTyping(chat, 2000);
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
}

// Função para explicar como funciona
async function sendHowItWorksMessage(chat, message) {
    await simulateTyping(chat, 3000);
    await message.reply(
        'Oferecemos internet ilimitada por meio de nosso aplicativo. É simples: baixe, faça login com as credenciais fornecidas e conecte. Enquanto estiver conectado ao app, você terá acesso à internet ilimitada!'
    );
}

// Função para enviar informações sobre os planos
async function sendPlanPrices(chat, message) {
    await simulateTyping(chat, 2500);
    await client.sendMessage(message.from, options['Valores dos planos']);
}

// Função para enviar informações sobre o teste no Android
async function sendAndroidTestInfo(chat, message) {
    await simulateTyping(chat, 3600);
    await client.sendMessage(message.from, 'Por favor, *INSTALE* este aplicativo: https://play.google.com/store/apps/details?id=com.hypernet23.pro e abra-o com o Wi-Fi ligado.');
    await simulateTyping(chat, 2100);
    await client.sendMessage(message.from, '👤 Usuário: 4000\n🔑 Senha: 4000\n📲 Limite: 1\n🗓️ Expira em: 24 horas\n🌍 Instruções: Use o Wi-Fi ao abrir o app, depois ative os dados móveis. Escolha a operadora e clique em conectar.');
    await simulateTyping(chat, 3150);

    // Baixar e enviar o vídeo tutorial
    const videoLink = 'https://drive.google.com/uc?export=download&id=1B30tef3Ic9lImJy6J_EadmjwlhOUcJcd';
    const videoFilePath = path.join(__dirname, 'tutorial_video.mp4');
    await downloadFile(videoLink, videoFilePath);
    const media = MessageMedia.fromFilePath(videoFilePath);
    await client.sendMessage(message.from, media, { caption: 'Video ensinando como conectar no aplicativo!' });
}

// Função para enviar informações sobre o teste no iPhone
async function sendIphoneTestInfo(chat, message) {
    await simulateTyping(chat, 3000);
    await client.sendMessage(message.from, 'Por favor, *BAIXE* este aplicativo: https://apps.apple.com/app/napsternetv/id1629465476.');
    await simulateTyping(chat, 3500);
    await client.sendMessage(message.from, 'Em qual operadora você gostaria de testar? Para testar, digite *vivo iphone* ou *tim iphone*, de acordo com a sua operadora.');
}

// Função para enviar informações sobre como aderir
async function sendJoinInstructions(chat, message) {
    await simulateTyping(chat, 2000);
    await client.sendMessage(message.from, 'Para aderir, basta escolher um dos nossos planos, efetuar o pagamento e enviar o comprovante. Nossa chave PIX é a seguinte:\n\n' +
        'Chave PIX Nubank: speednetservicec@gmail.com\n' +
        'Nome: Julio Cezar\n\n' +
        'Por favor, envie o comprovante para que possamos liberar seu acesso.'
    );
}

// Função para enviar informações para revendedores
async function sendResellerInfo(chat, message) {
    await simulateTyping(chat, 2000);
    await message.reply('Para se tornar nosso revendedor, é bem simples. Temos revenda disponível para Android e uma revenda híbrida para Android e iPhone. Basta escolher uma das opções e a quantidade de crédito/acesso que você deseja adquirir. Para consultar os valores para revendedores, digite o número 7.');
}

// Função para enviar tabela de preços para revendedores
async function sendResellerPricing(chat, message) {
    await simulateTyping(chat, 3000);
    await message.reply('📲 SPEEDNET - SOLUÇÕES EM VPN 📡\n\n' +
        '*INFORMAÇÕES PARA NOVOS CLIENTES*\n' +
        'Quer revender nossos serviços? Escolha seu plano de revendedor logo abaixo:\n\n' +
        '🚀 PLANOS PARA REVENDER APENAS PARA *ANDROID* 🚀\n' +
        '*Operadoras disponíveis:*\n' +
        '- *Tim ✅*\n' +
        '- *VIVO (funcionando normalmente). ✅*\n\n' +
        '... (detalhes de preços continuam)'
    );
}

// Função para enviar os termos de uso
async function sendTermsOfService(chat, message) {
    await simulateTyping(chat, 2000);
    await message.reply('Aqui estão os termos de uso...');
}

// Função para enviar informações de suporte
async function sendSupportInfo(chat, message) {
    await simulateTyping(chat, 2000);
    await message.reply('Fale com o nosso suporte para mais ajuda...');
}

client.initialize();

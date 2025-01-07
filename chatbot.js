const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js'); 
const client = new Client();

// Serviço de leitura do QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Conexão realizada com sucesso
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
    showMenu();
});

// Função para mostrar o menu após a conexão com sucesso
async function showMenu() {
    // Aguarda a inicialização completa do cliente antes de exibir o menu
    const chat = await client.getChats();
    await delay(2000); // Adiciona um pequeno atraso para garantir que a sessão foi estabelecida

    // Após a inicialização, envia o menu
    await client.sendMessage(
        chat[0].id._serialized, 
        'Escolha uma opção:\n' +
        '1 - Adicionar nova opção\n' +
        '2 - Deletar opção\n' +
        '3 - Consultar respostas\n' +
        '4 - Sair'
    );
}

// Função para criar o delay entre ações
const delay = ms => new Promise(res => setTimeout(res, ms)); 

// Funil de mensagens
client.on('message', async msg => {
    // Identifica mensagens de menu e responde com as ações apropriadas
    if (msg.body === '1') {
        await msg.reply('Você selecionou a opção para adicionar uma nova opção.');
        // Aqui você pode colocar a lógica para adicionar novas opções dinamicamente
    } else if (msg.body === '2') {
        await msg.reply('Você selecionou a opção para deletar uma opção.');
        // Aqui você pode colocar a lógica para deletar opções
    } else if (msg.body === '3') {
        await msg.reply('Você selecionou a opção para consultar respostas.');
        // Aqui você pode colocar a lógica para consultar respostas
    } else if (msg.body === '4') {
        await msg.reply('Você selecionou a opção para sair.');
        // Lógica para encerrar ou fazer outro tipo de ação
    } else {
        await msg.reply('Escolha uma opção válida. Digite 1, 2, 3 ou 4.');
    }
});

// Inicializa o cliente do WhatsApp Web
client.initialize();

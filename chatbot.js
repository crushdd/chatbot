const puppeteer = require('puppeteer-core');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');

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

// Gerar o QR Code para autenticação
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR Code acima!');
});

// Após a conexão bem-sucedida
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');

    // Menu interativo
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Escolha uma opção:\n1 - Adicionar opção e resposta\n2 - Deletar opção\nDigite o número da opção desejada: ', (option) => {
        if (option === '1') {
            rl.question('Digite a pergunta da nova opção: ', (question) => {
                rl.question('Digite a resposta para a pergunta: ', (answer) => {
                    // Armazenando a opção e a resposta no objeto 'options'
                    options[question] = answer;
                    console.log(`Opção "${question}" com resposta "${answer}" foi adicionada.`);
                    rl.close();
                });
            });
        } else if (option === '2') {
            rl.question('Digite a pergunta da opção a ser deletada: ', (questionToDelete) => {
                if (options[questionToDelete]) {
                    delete options[questionToDelete];
                    console.log(`Opção "${questionToDelete}" foi deletada.`);
                } else {
                    console.log('Opção não encontrada.');
                }
                rl.close();
            });
        } else {
            console.log('Opção inválida.');
            rl.close();
        }
    });
});

// Lidar com as mensagens recebidas no WhatsApp
client.on('message', (message) => {
    console.log('Mensagem recebida:', message.body);
    
    // Verificando se a mensagem recebida é uma das perguntas armazenadas
    const response = options[message.body];
    
    if (response) {
        // Respondendo com a resposta associada
        message.reply(response);
        console.log('Resposta enviada:', response);
    } else {
        console.log('Nenhuma resposta encontrada para a mensagem.');
    }
});

// Iniciar o cliente
client.initialize();

// Lidar com desconexões ou falhas
client.on('disconnected', (reason) => {
    console.log('Cliente desconectado. Razão:', reason);
});

// Função para enviar múltiplas respostas com o vídeo
const sendTestMessages = async (message) => {
    // Primeira resposta
    await message.reply(options['Fazer teste no Android']);
    console.log('Resposta 1 enviada: ', options['Fazer teste no Android']);

    // Aguardar 5 segundos antes de enviar as próximas respostas
    await delay(5000);

    // Caminho correto do vídeo
    const videoPath = '/home/container/app.mp4'; // Caminho exato para o arquivo de vídeo

    try {
        // Enviar o vídeo
        await message.reply(
            'Como conectar no aplicativo.', // Mensagem de texto opcional
            { media: fs.createReadStream(videoPath) } // Enviar o arquivo de vídeo
        );
        console.log('Vídeo enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar o vídeo:', error);
        if (error.code === 'ENOENT') {
            console.error('Arquivo de vídeo não encontrado no caminho especificado.');
        } else {
            console.error('Erro inesperado ao enviar o vídeo:', error);
        }
    }

    // Terceira resposta
    await message.reply(options['Fazer teste no Android - vídeo']);
    console.log('Resposta 3 enviada: ', options['Fazer teste no Android - vídeo']);
};

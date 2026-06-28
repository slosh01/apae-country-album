import { motion } from 'motion/react';

export function Entrada() {
  return (
    <div className="px-6 pt-16 pb-32 flex flex-col items-center">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full flex justify-center mb-8"
      >
        <div className="bg-cordel-paper py-4 px-8 border-4 border-cordel-wood shadow-[8px_8px_0px_#5d4037] transform -rotate-2">
          <h1 className="font-alfa text-4xl text-center text-cordel-accent drop-shadow-md">
            XV APAE COUNTRY
          </h1>
          <h2 className="font-sans font-bold text-lg text-center mt-2 text-cordel-wood tracking-widest uppercase">
            Álbum de Figurinhas
          </h2>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 text-center bg-cordel-paper/80 backdrop-blur-sm p-6 rounded-xl border-2 border-cordel-wood/30 shadow-xl"
      >
        <p className="text-lg font-medium leading-relaxed">
          A cada número que comprar da rifa beneficente da APAE Country você ganha um pacote de figurinhas para o <strong>Álbum APAE Country</strong>.
        </p>
        <div className="h-px bg-cordel-wood/20 w-3/4 mx-auto" />
        <p className="text-lg leading-relaxed">
          Completando o álbum, você ganha um ensaio fotográfico feito pela <strong className="text-cordel-accent">Equipe Galantis</strong>! Mas atenção: apenas para os <strong>5 primeiros</strong> que completarem.
        </p>

        <div className="bg-cordel-light/50 p-4 rounded-lg border border-cordel-wood/20 text-md text-left space-y-3 shadow-inner">
          <p>
            🏷️ <strong>Como começar:</strong> Compre com nossos vendedores ou entre em contato com nosso atendimento para ganhar Códigos Premium.
          </p>
          <p>
            🎁 <strong>Bônus Diário:</strong> Ganhe mais figurinhas gratuitas todos os dias (de segunda a sexta) acompanhando os Stories da APAE.
          </p>
          <p>
            🏆 <strong>Completou?</strong> Fale com o atendimento, sua conta será verificada no sistema e você receberá as instruções para o voucher!
          </p>
        </div>
        
        <div className="pt-4 flex flex-col gap-4">
          <a
            href="https://wa.me/5531995977942"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 bg-green-600 text-white font-alfa text-lg rounded-xl shadow-[4px_4px_0px_#5d4037] hover:translate-y-1 hover:shadow-[2px_2px_0px_#5d4037] transition-all"
          >
            Falar no WhatsApp
          </a>
          <div className="flex gap-4 justify-center mt-2 text-cordel-wood">
            <a href="https://www.instagram.com/galantis.photo/" target="_blank" className="underline font-bold">@galantis.photo</a>
            <span>•</span>
            <a href="https://www.instagram.com/apaesmi/" target="_blank" className="underline font-bold">@apaesmi</a>
          </div>
          <p className="text-sm opacity-80 mt-2">Dúvidas? Ligue: (31) 3838-1567</p>
        </div>
      </motion.div>
    </div>
  );
}

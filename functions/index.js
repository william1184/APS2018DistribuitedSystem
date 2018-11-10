const functions = require('firebase-functions');
const request = require('request');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});


var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		   user: 'loteriasOnlineAPS2018@gmail.com',
		   pass: '123456LOTERIAS'
	   }
   });
 /* Teste Mailer     
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'ls4txfajrtxe6hfc@ethereal.email',
        pass: '7Z36fngqEC43k7Dez9'
    }
});
*/

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.createResultadoMegasena = functions.firestore
.document('megasena/{concursoNumero}')
.onCreate((snap, context) => {

	procurarVencedor('megasena', snap.id, snap.data().numeros_sorteados);
	console.log('trigger resultado megasena' + newValue);
});

exports.createResultadoLotofacil = functions.firestore
.document('lotofacil/{concursoNumero}')
.onCreate((snap, context) => {

	procurarVencedor('lotofacil', snap.id, snap.data().numeros_sorteados);
	console.log('trigger resultado lotofacil' + newValue);	
});

exports.carregarSorteiosLotofacil = functions.https.onRequest((res, resp) => {
	var sorteio = res.query.sorteio;
	var url = 'https://www.lotodicas.com.br/api/lotofacil/'+sorteio;
	
	request.get( url, (error, response, body) => {
		console.log(body);
		var resultadoAPI = {}
		if( body ){
			resultadoAPI = JSON.parse(body);
		}		
		var proximo_sorteio = parseInt(resultadoAPI.numero) + 1;
		var resultado = {'numero_concurso': resultadoAPI.numero, 'numeros_sorteados': resultadoAPI.sorteio.join(','), 'ganhadores': resultadoAPI.ganhadores, 'rateio_entre_ganhadores': resultadoAPI.rateio, 'data_sorteio_atual': resultadoAPI.data , 'proximo_sorteio':  proximo_sorteio, 'data_proximo_sorteio': resultadoAPI.proximo_data };
		
		if( resultadoAPI ){
			db.collection('lotofacil')
				.doc(resultado.numero_concurso.toString())      
				.set(resultado)
				.then(ref => {
					procurarVencedorLotofacil('lotofacil', resultado.numero_concurso, resultado.numeros_sorteados);
					return resp.status(200).send("Success " ); 							
				  })
				.catch(error => {
					if( error ){
						console.log('Error writing document: ' + error);
						resp.status(500).send("Não foi possivel carregar o sorteio. /n erro:  "+ error );

					}
				return false;
			});
		}
		
	});	
});

exports.carregarSorteiosMegasena = functions.https.onRequest((res, resp) => {
	var sorteio = res.query.sorteio;
	var url = 'https://www.lotodicas.com.br/api/mega-sena/'+sorteio;	
	
	request.get(url, (error, response, body) => {
		console.log(body);
		var resultadoAPI = {};
		if( body ){
			resultadoAPI = JSON.parse(body);
		}	
		console.log(resultadoAPI);
		var proximo_sorteio = parseInt(resultadoAPI.numero) + 1;
		var resultado = {'numero_concurso': resultadoAPI.numero, 'numeros_sorteados': resultadoAPI.sorteio.join(','), 'ganhadores': resultadoAPI.ganhadores, 'rateio_entre_ganhadores': resultadoAPI.rateio, 'data_sorteio_atual': resultadoAPI.data , 'proximo_sorteio':  proximo_sorteio, 'data_proximo_sorteio': resultadoAPI.proximo_data };
		
		if( resultadoAPI ){
		
			db.collection('megasena')
				.doc(resultado.numero_concurso.toString())      
				.set(resultado)
				.then(ref => {
	
					procurarVencedorMegasena('megasena', resultado.numero_concurso, resultado.numeros_sorteados);
					return resp.status(200).send("Success " ); 							
				  })
				.catch(error => {
					if( error ){
						console.log('Error writing document: ' + error);
						resp.status(500).send("Não foi possivel carregar o sorteio. /n erro:  "+ error );

					}
				return false;
			});
		}
		
	});
});
 
exports.cadastrarJogo = functions.https.onRequest((res, resp) => {
	resp.set('Access-Control-Allow-Origin', "*")
	resp.set('Access-Control-Allow-Methods', 'GET, POST')
	let usuario = res.body['usuario'];
	var assunto = "Email de Confirmação";	
	var corpo = "Loterias";
	var corpoHtml = "<div>Você acaba de Cadastrar o seu jogo.</div><p>Aqui estão seus jogos: </p>";
	
	if( usuario.jogos.megasena ){
		usuario.jogos.megasena.forEach( (jogo) => {
			corpoHtml += "<p> Megasena -  Concurso: "+jogo.concurso + ", Numeros : "+jogo.numerosSelecionados + "</p>"		
		});

	}
	if( usuario.jogos.lotofacil ){
		usuario.jogos.lotofacil.forEach( (jogo) => {
			corpoHtml += "<p> Lotofacil -  Concurso: "+jogo.concurso + ", Numeros : "+jogo.numerosSelecionados + "</p>"		
		});		
	}
	corpoHtml += "<p>Assim que sair um resultado lhe enviaremos um e-mail.</p>";
	  
 	db.collection('usuarios')
	 .doc(usuario.email)      
	 .set(usuario)
	 .then(ref => {
		resp.status(200).send("Success " ); 		
		console.log('Added document with ID: ', ref.id);
		return enviarEmail(corpo,corpoHtml, assunto, usuario.email);
	  })
	 .catch(error => {
		 console.log("Hello " + error);
		 if( error ){
			 console.log('Error writing document: ' + error);
			 resp.status(500).send("Não foi possivel carregar o sorteio. /n erro:  "+ error );

		 }
		return false;
	});
});

exports.ultimoSorteioMegasena = functions.https.onRequest((res, resp) => { 	
		var resultadosRef = db.collection('megasena');

		resultadosRef.orderBy('data_sorteio_atual', 'desc').limit(1).get()
			.then(snapshot => {
				snapshot.forEach(doc => {
					resp.status(200).send( {'megasena': doc.data()} );					
				});
				return true;
			})
		.catch(err => {
		resp.status(500).send( 'Erro ', err );
		console.log('Error getting documents', err);
		});	
	
			
});

exports.ultimoSorteioLotofacil = functions.https.onRequest((res, resp) => { 	
		var resultadosRef = db.collection('lotofacil');

		resultadosRef.orderBy('data_sorteio_atual', 'desc').limit(1).get()
			.then(snapshot => {
				snapshot.forEach(doc => {
					resp.status(200).send( {'lotofacil':  doc.data() } );					
				});
				return true;
			})
		.catch(err => {
			resp.status(500).send( 'Erro ', err );
			console.log('Error getting documents', err);
		});	
	
});

exports.procurarUsuariosVencedores = functions.https.onRequest((res, resp) => {
	var tipoJogo = 'megasena';
	var Concurso = '1212'; 
	var jogo = '1,2,3,4,5,6';

	// Create a reference to the usuarios collection
	procurarVencedor(tipoJogo, Concurso, jogo);
	
	resp.status(200).send("Success " );     
 	
});

function enviarEmail(corpo,corpoHtml, assunto, destinatario){
	
		let remetente = '"Loterias Online" <meusResultados@loterias.com>';	
	
		let email = {
			from: remetente,
			to: destinatario,
			subject: assunto,
			text: corpo,
			html: corpoHtml
		};
		
		transporter.sendMail(email, (error, info) => {
			if (error) {
			  return console.log(error);
			}
			return console.log('Mensagem %s enviada: %s', info.messageId, info.response);
		});
	  
}

function procurarVencedor(tipoJogo, concurso_atual, jogo_ganhador) {
	
	var usuariosJogos = db.collection('usuarios');
	usuariosJogos.get()
		.then(snapshot => {
			var jogoVencedor;
			snapshot.forEach(doc => {
				if(tipoJogo === 'megasena'){					
					var jogosMegasena = doc.data().jogos.megasena;
					jogosMegasena.forEach(jogo => {
						if(jogo.concurso === concurso_atual){							
							if(jogo.numerosSelecionados.sort() === jogo_ganhador.sort()){
								console.log(doc.id);
								emailResultadoPositivo(doc.id, tipoJogo, concurso_atual, jogo_ganhador);							
							}else{
								console.log(doc.id);
								emailResultadoNegativo(tipoJogo, concurso_atual, jogo_ganhador);
							}
						}
					});
				}else{
					var jogosLotofacil = doc.data().jogos.lotofacil;
					jogosLotofacil.forEach(jogo => {
						if(jogo.concurso === concurso_atual){							
							if(jogo.numerosSelecionados.sort() === jogo_ganhador.sort()){
								emailResultadoPositivo(tipoJogo, concurso_atual, jogo_ganhador);							
							}else{
								emailResultadoNegativo(tipoJogo, concurso_atual, jogo_ganhador);
							}
						}
					});
				}
				return doc;
			});
			return jogoVencedor;
			
		})
		.catch(err => {
			console.log('Error getting documents', err);
		});
						
}

function procurarVencedorMegasena(tipoJogo, concurso_atual, jogo_ganhador) {
	
	var usuariosJogos = db.collection('usuarios');
	
	usuariosJogos.get()
		.then(snapshot => {
			var jogoVencedor;
			snapshot.forEach(doc => {				
					var jogosMegasena = doc.data().jogos.megasena;
					jogosMegasena.forEach(jogo => {										
						if(parseInt(jogo.concurso) === parseInt(concurso_atual)){		
							var jogoSelecionado = jogo.numerosSelecionados.split(',').sort().join(',');
							var jogoVencedor =  jogo_ganhador.split(',').sort().join(',');							
							if( parseInt(jogoSelecionado) === parseInt(jogoVencedor) ){
								console.log(doc.id);
								emailResultadoPositivo(doc.id, tipoJogo, concurso_atual, jogo_ganhador);							
							}else{
								console.log(doc.id);
								emailResultadoNegativo(doc.id, tipoJogo, concurso_atual, jogo_ganhador, jogo.numerosSelecionados);
							}
						}
					});
				
				return doc;
			});
			return jogoVencedor;
			
		})
		.catch(err => {
			console.log('Error getting documents', err);
		});
						
}

function procurarVencedorLotofacil(tipoJogo, concurso_atual, jogo_ganhador) {
	
	var usuariosJogos = db.collection('usuarios');
	usuariosJogos.get()
		.then(snapshot => {
			var jogoVencedor;
			snapshot.forEach(doc => {
				if(tipoJogo === 'lotofacil'){										
					var jogosLotofacil = doc.data().jogos.lotofacil;
					jogosLotofacil.forEach(jogo => {
						if(parseInt(jogo.concurso) === parseInt(concurso_atual)){	
							var jogoSelecionado = jogo.numerosSelecionados.split(',').sort().join(',');
							var jogoVencedor =  jogo_ganhador.split(',').sort().join(',');						
							if( parseInt(jogoSelecionado) === parseInt(jogoVencedor) ){
								emailResultadoPositivo(doc.id, tipoJogo, concurso_atual, jogo_ganhador);							
							}else{
								emailResultadoNegativo(doc.id, tipoJogo, concurso_atual, jogo_ganhador, jogo.numerosSelecionados);
							}
						}
					});
				}
				return doc;
			});
			return jogoVencedor;
			
		})
		.catch(err => {
			console.log('Error getting documents', err);
		});
						
}

function emailResultadoPositivo(email, tipoJogo, concurso, jogo){ 
    
	var assunto = "Resultado Lotofacil/Megasena";	
	var corpo = "Resultado do seu jogo(s)";
	var corpoHtml = "Você acabou de vencer na "+ tipoJogo +" no concurso " + concurso + " com o jogo " + jogo +".";

	enviarEmail(corpo, corpoHtml, assunto, email);
	console.log("Enviando Email Para: " + email);
  }

  function emailResultadoNegativo(email, tipoJogo, concurso, jogo_vencedor, jogo){ 
    
	var assunto = "Resultado Lotofacil/Megasena";	
	var corpo = "Resultado do seu jogo(s)";
	var corpoHtml = "Infelizmente você não venceu "+ tipoJogo +" no concurso " + concurso + " com o jogo " + jogo +". <br> O jogo vencedor : " + jogo_vencedor;

	enviarEmail(corpo, corpoHtml, assunto, email);
	console.log("Enviando Email Para: " + email);
  }
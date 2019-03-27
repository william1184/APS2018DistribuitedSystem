# LoteriasWithFirebaseAPS2018


Usando firebase e cloud functions para criar um serviço de verificar se o jogo ganhou ou não no concurso.


Próxima implementação seria criar um JOB Task para não precisar acionar manualmente a function:
https://firebase.googleblog.com/2017/03/how-to-schedule-cron-jobs-with-cloud.html

Implementar também funções para verificar quantidade de acertos:
var array1 = ["0","1","3"];
var array2 = ["0","2","3"];

var i = 0;
var d = array1.some( function(value, index, array){
  array2.includes(value) && i++;
  console.log("quantidade " + i + "  valor: " + value);
});


Melhorar aspecto do e-mail enviado.

Melhorar aspecto da mensagem enviada.

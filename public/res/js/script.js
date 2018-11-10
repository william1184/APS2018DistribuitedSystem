var meusJogosLotofacil = [];
var meusJogosMegasena = [];
var quantidadeNumerosLotofacil = 15;
var quantidadeNumerosMegasena = 6;

var transacionalSucesso = function(mensagem){   
    if( !mensagem ){ mensagem = 'Enviado com sucesso.'};
    $.sweetModal({
        content: mensagem,
        icon: $.sweetModal.ICON_SUCCESS
    });
}

var transacionalAlerta = function(mensagem){   
    if( !mensagem ){ mensagem = 'A campos a serem preenchidos.'};
    $.sweetModal({
        content: mensagem,
        icon: $.sweetModal.ICON_WARNING
    });
}

var transacionalErro = function(mensagem){   
    if( !mensagem ){ mensagem = 'Algo deu errado.'};
    $.sweetModal({
        content: mensagem,
        title: 'Erro',
        icon: $.sweetModal.ICON_ERROR,
    
        buttons: [
            {
                label: 'Voltar',
                classes: 'redB'
            }
        ]
    });
}

var divCheckBoxHide = function(checkboxId, divId){
    var checkboxSelecionado = document.querySelector(checkboxId);				
    document.addEventListener('click', function(){
        var divSelecionado = document.getElementById(divId);
        checkboxSelecionado.checked ? divSelecionado.classList.remove('hide') : divSelecionado.classList.add('hide');				
    });		
}

var inicializarNumeros = function(idCampoUL, quantidadeNumeros, tipoJogo){
    var limiteNumerosSelecionados = 6;
    if(tipoJogo == 'lotofacil'){ limiteNumerosSelecionados = quantidadeNumerosLotofacil }else{ limiteNumerosSelecionados = quantidadeNumerosMegasena};
    var listaNaoOrdenada = document.querySelector('#'+idCampoUL);
    for(var numero = 01; numero <= quantidadeNumeros; numero++){
        var itemListaNaoOrdenada = document.createElement("li");
        var itemSpan = document.createElement("span");
        itemSpan.setAttribute('id', tipoJogo+'N'+ numero );
        itemSpan.appendChild(document.createTextNode(numero));
        itemListaNaoOrdenada.appendChild(itemSpan)
            .addEventListener('click', function(){
                var quantidadeItensSelecionados = document.querySelectorAll('.numero-selecionado-'+tipoJogo).length;
                
                if(this.classList.length === 0){
                    if(quantidadeItensSelecionados === limiteNumerosSelecionados){ return;	}
                    this.classList.add('numero-selecionado-'+tipoJogo);	
                }else{
                    this.classList.remove('numero-selecionado-'+tipoJogo);
                }
            });			
                            
        listaNaoOrdenada.appendChild(itemListaNaoOrdenada);
                
    }
};

var btnSalvarJogo = function(modalRecebido){
    
    var nomeTipoJogo = modalRecebido.split('-')[1];
    var jogo;
    var concurso = document.querySelector('#concurso-'+nomeTipoJogo).value;
    var quantidadeNumeros = parseInt(document.querySelector('#select-'+nomeTipoJogo).value);
    var numerosSelecionados = document.querySelector('.numero-selecionado-'+nomeTipoJogo);
    var arraySelecionados = [];
    
    if(!!numerosSelecionados && numerosSelecionados.length === quantidadeNumeros){
        numerosSelecionados.forEach(function(item){
            arraySelecionados.push(item.innerText);
        });        
        numerosSelecionados = arraySelecionados.join(',');
        jogo = { concurso: concurso, quantidadeNumeros : quantidadeNumeros, numerosSelecionados : numerosSelecionados };
    };
    
    if(nomeTipoJogo == 'lotofacil'){        
        meusJogosLotofacil.push(jogo);
    }else{
        meusJogosMegasena.push(jogo);
    }
 
    
}

var salvarJogo = function( buttonId ){

    var tipoJogo = buttonId.split('-')[2];
    var concurso = document.querySelector('#concurso-'+tipoJogo).value;
    var quantidadeNumeros = parseInt(document.querySelector('#select-'+tipoJogo).value);
    var numerosSelecionados = document.querySelectorAll('.numero-selecionado-'+tipoJogo);

    
    if((concurso && numerosSelecionados) && numerosSelecionados.length === quantidadeNumeros){
        var arraySelecionados = [];
        numerosSelecionados.forEach(function(item){
            arraySelecionados.push(item.innerText);
        });        
        numerosSelecionados = arraySelecionados.join(',');
        jogo = { 'concurso': concurso, 'quantidadeNumeros': quantidadeNumeros, 'numerosSelecionados': numerosSelecionados };
        
        if( tipoJogo == 'lotofacil' ){
            meusJogosLotofacil.push(jogo);
        }else{
            meusJogosMegasena.push(jogo);
        }
        
        adicionarItemsAoBucket(jogo, tipoJogo);
        
        
        if(tipoJogo == 'lotofacil'){
            document.querySelector('#concurso-lotofacil').value = '';    
            document.querySelector('#select-lotofacil').value = 15;            
        }else{
            document.querySelector('#concurso-megasena').value = '';    
            document.querySelector('#select-megasena').value = 6;            
        }
        var numeroList = document.querySelectorAll('#numeros-'+tipoJogo+' span') ;
        if( numeroList ){
            numeroList.forEach(function(item){ item.classList.remove('numero-selecionado-'+tipoJogo)})
        }

    }else{
        transacionalAlerta();
    };
    
    
}

var criarLiParaCadaNumero = function(numerosSelecionados){

    var liNumeroSelecionados = "";
    var numerosSelecionados = numerosSelecionados.split(',');
    if( numerosSelecionados ){
        numerosSelecionados.forEach( function(item){
            
            if( item ){                
                liNumeroSelecionados += '<li><span>'+item+'</span></li>';
            };
        });
    };

    return liNumeroSelecionados;

};

var adicionarItemsAoBucket= function(jogo, tipoJogo){
    var meuJogos;
     
    (tipoJogo == 'lotofacil') ? meuJogos = meusJogosLotofacil :  meuJogos = meusJogosMegasena;
    
    var trJogo = '<tr id="bucket-n-'+(meusJogosLotofacil.length + 1)+'">'+
    '<td class="white-text">'+meusJogosLotofacil.length+'</td>'+
    '<td class="white-text">'+jogo.concurso+'</td>'+
    '<td class="white-text">'+jogo.quantidadeNumeros+'</td>'+									
    '<td><ul class="bucket-selecionado">'+
    criarLiParaCadaNumero(jogo.numerosSelecionados)+            
    '</ul></td> <td><a onclick="excluirLinha('+meusJogosLotofacil.length+','+tipoJogo+')" class="delete-'+meusJogosLotofacil.length+' red-text accent-3 btn-flat"><i class="material-icons" >delete</i></a></td>'+
    '</tr>';
    
    (tipoJogo == 'lotofacil') ? $('#tbodyLotofacil').append(trJogo) : $('#tbodyMegasena').append(trJogo);

}

var aplicarAcaoBotao = function(botaoId, acao){
    var botao = document.querySelector( botaoId );
    if( botao ){
        botao.addEventListener('click', function(){
            acao( botaoId );
        });
    };
};

var aplicarAcaoSelect = function(botaoId, acao){
    var botao = document.querySelector( botaoId );
    if( botao ){
        botao.addEventListener('change', function(){
            acao( botaoId );
        });
    };
};


var submitForm = function(){   
    
    var email = document.querySelector('#email').value; 
    var termos = document.querySelector('#termos').checked;
    if( (email && termos) && (meusJogosLotofacil.length > 0 || meusJogosMegasena.length > 0)){
        var url = "https://us-central1-aps2018-ff0e2.cloudfunctions.net/cadastrarJogo";
        if(location.hostname == 'localhost'){
            url = "http://localhost:5001/aps2018-ff0e2/us-central1/cadastrarJogo";
        }
        var data = {'usuario' : {'email' : email, 'jogos' : {'lotofacil' : meusJogosLotofacil, 'megasena' : meusJogosMegasena}}};

        $.ajax({
            type : "POST",
            data : data,
            url : url,
            success: function(data){                               
                transacionalSucesso();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                transacionalSucesso();
            }
         });
        
    }else{
        transacionalAlerta();
    }   
    
}

var valorQuantidadeNumeroLotofacil = function(){
    this.quantidadeNumerosLotofacil =  document.querySelector('#select-lotofacil').value;    
    inicializarNumeros('numeros-lotofacil', 25, "lotofacil", quantidadeNumerosLotofacil);
}

var valorQuantidadeNumeroMegasena = function(){
    this.quantidadeNumerosMegasena =   document.querySelector('#select-lotofacil').value;    
    inicializarNumeros('numeros-megasena', 60,"megasena", quantidadeNumerosMegasena);
}

var excluirLinha = function(item, tipo){
    
    document.querySelector('#meus-jogos-'+tipo+' #bucket-n-'+item).remove();
    if(tipo == 'lotofacil'){
        meusJogosLotofacil.splice(item,1)
        
    }else{
        meusJogosMegasena.splice(item,1)
    }
    
    
};

$(function() {
    inicializarNumeros('numeros-megasena', 60,"megasena", quantidadeNumerosMegasena);
    inicializarNumeros('numeros-lotofacil', 25, "lotofacil", quantidadeNumerosLotofacil);
    
    divCheckBoxHide('#check-lotofacil', 'meus-jogos-lotofacil' );
    divCheckBoxHide('#check-megasena','meus-jogos-megasena' );

    aplicarAcaoSelect('#select-lotofacil', valorQuantidadeNumeroLotofacil);
    aplicarAcaoSelect('#select-megasena', valorQuantidadeNumeroMegasena);

    aplicarAcaoBotao('#salvar-jogo-lotofacil', salvarJogo);
    aplicarAcaoBotao('#salvar-jogo-megasena', salvarJogo);
    aplicarAcaoBotao('#submit_form', submitForm);
    
    
    M.AutoInit();
});

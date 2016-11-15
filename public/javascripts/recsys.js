$(document).ready(function () {

    $("#btnProcessTerms").click(
        function (){

            var refresh_bar =  setInterval(function(){

                $.ajax(
                      {
                        method: "POST",
                        url: "/recsys/get-counters",
                        data: {  }
                      })
                      .done(function(data) {
                          set_progressbar("Processando Termos"
                            , data.counter_terms
                            , data.counter_terms_len);
                      })
                      .fail(function() {
                        alert( "Ocorreu um erro ao tentar gerar os termos!" );
                    });
            }, 100);

            $.ajax(
                  {
                    method: "POST",
                    url: "/recsys/create-terms",
                    data: {  }
                  })
                  .done(function(data) {
                      location.reload();
                  })
                  .fail(function() {
                    alert( "Ocorreu um erro ao tentar gerar os termos!" );
                })
                .always(function() {

                  clearInterval(refresh_bar);
                });
        }
    );

    $("#btnProcessFreqs").click(
        function (){

            $.ajax(
                  {
                    method: "POST",
                    url: "/recsys/create-freqs",
                    data: {  }
                  })
                  .done(function(data) {
                      //location.reload();
                  })
                  .fail(function() {
                    alert( "Ocorreu um erro ao tentar gerar as frequencias!" );
                });
                  //.always(function() {
                  //  alert( "complete" );
                  //});
        }
    );

    $("#btnEuclidianDist").click(
        function (){

            $.ajax(
                  {
                    method: "POST",
                    url: "/recsys/calculate-distances-eucl",
                    data: {  }
                  })
                  .done(function(data) {
                      //location.reload();
                  })
                  .fail(function() {
                    alert( "Ocorreu um erro ao tentar gerar as distancias euclidianas!" );
                });
                  //.always(function() {
                  //  alert( "complete" );
                  //});
        }
    );


});

function set_progressbar(text, value, len){

    $(".progress-bar").attr("aria-valuenow",value);
    $(".progress-bar").attr("aria-valuemax",len);
    $(".progress-bar").attr("aria-valuemin",0);

    $(".progress-bar").css("width",value + "%");

    $(".progress-bar").text(text + " " + value + "%");
}

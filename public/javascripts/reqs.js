$(document).ready(function () {

    $('#mnuAllReqs').addClass('active');

    $("#addForum").click(function(){

        $('#myModal').modal('toggle');
    });

    $('#myModal').on('shown.bs.modal', function () {
        $('#inputComment').focus();
    })

    $("#btnSubmitComment").click(function(){
        $("#formAddComment").submit();
    });

    $('.btn-remove').button().click(function(){

            var $btn  = $(this).button('loading');
            var count = $('.chkSelect:checked').length;

            if(count==0){
                insertAlertAfter(5000,
                    'warning',
                    '.btn-remove',
                    'Cuidado!',
                    'É necessário selecionar pelo menos uma solicitação.');

                $btn.button('reset');
                return;

            }

            $('.chkSelect:checked').each(function() {

                var obj = this;
                var id = $(obj).parent().find(".inputId").val();

                $.ajax( "/reqs/" + id + "/delete" )
                    .done(function(result) {
                        var text = "Solicitação <u>"
                                 + $( obj ).closest("td").next().text()
                                 + "</u> removida com sucesso!";

                        $( obj ).closest("tr").remove();

                        insertAlertAfter(10000,
                            'success',
                            '.btn-remove',
                            'Solicitação Removida!',
                            text);
                    })
                    .fail(function(err) {

                        var text = "Erro ao remover solicitação <u>"
                                 + $( obj ).closest("td").next().text()
                                 + "</u>.";

                        insertAlertAfter(10000,
                            'danger',
                            '.btn-remove',
                            'Erro ao Remover Registro',
                            text);
                    })
                    .always(function() {
                        count--;
                        if(count==0){
                            $btn.button('reset');
                        }
                    });
            });


        }
    );
});

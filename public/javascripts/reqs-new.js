$(document).ready(function () {
    $('#formAddReq')
        .find('[name="tags"]')
            // Revalidate the cities field when it is changed
            .change(function (e) {
                //$('#formAddReq').formValidation('revalidateField', 'tags');
            })
            .end()
        .find('[name="modulos"]')
            // Revalidate the countries field when it is changed
            .change(function (e) {
                //$('#formAddReq').formValidation('revalidateField', 'modulos');
            })
            .end();
});

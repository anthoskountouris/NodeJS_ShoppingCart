(function() {

    $('a.confirmDeletion').on('click', function(){
        if (!confirm('Confirm Deletion'))
            return false;
    });

});
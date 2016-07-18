function filterPast(){
    filterColumn("Past");
}


function filterColumn (status) {
    $('#example').DataTable().column(0).search(status).draw();
}

function filterColumnRgEx (regex) {
    console.log(status);
    $('#example').DataTable().column(0).search(regex, true).draw();
}


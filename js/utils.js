String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

$('body').on('shown.bs.modal', '.modal', function() {
    $('input:visible:first', this).focus();
});
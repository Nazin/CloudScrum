String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

$('body').on('shown.bs.modal', '.modal', function() {
    $('input:visible:first', this).focus();
});

$.fn.extend({

    block: function() {

        if (this.data('blocked')) {
            return false;
        }

        this.data('blocked', true);

        var elements = this.find('input, textarea');
        elements.prop('disabled', true);

        var submit = this.find('[type=submit]');
        submit.button('loading');

        return true;
    },

    unblock: function() {

        this.removeData('blocked');

        var elements = this.find('input, textarea');
        elements.prop('disabled', false);

        var submit = this.find('[type=submit]');
        submit.button('reset');
    }
});
